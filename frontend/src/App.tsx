import { useEffect, useState } from 'react'
import type { Item } from './types'
import { useApp } from './hooks/useApp'
import { useCrud } from './hooks/useCrud'
import { AppCtx } from './hooks/appContext'
import { Background } from './components/Background'
import { Header } from './components/Header'
import { SearchBox } from './components/SearchBox'
import { FilterBar } from './components/FilterBar'
import { GroupBlock } from './components/GroupBlock'
import { SkeletonLoader } from './components/SkeletonLoader'
import { EmptyState } from './components/EmptyState'
import { Modal } from './components/Modal'
import { SettingsPanel } from './components/SettingsPanel'
import { ContextMenu } from './components/ContextMenu'
import { ToastProvider } from './components/ToastProvider'
import { useKeyboard } from './hooks/useKeyboard'
import { OpsPanel } from './components/OpsPanel'
import { api } from './api'
import { LoginScreen } from './components/LoginScreen'
import { useAppCtx } from './hooks/appContext'

function Page() {
  const app = useAppCtx()
  const { data, loading, searchQuery, activeGroup, setSearchQuery, setActiveGroup } = app
  const crud = useCrud()
  const [editMode, setEditMode] = useState(false)
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; item: Item } | null>(null)

  useKeyboard({ onToggleEdit: () => setEditMode(v => !v) })

  const categories = data?.categories ?? []
  const settings = data?.settings ?? {
    logoText: '',
    heroText: '',
    backgroundImage: '',
    theme: 'hacker' as const,
  }
  const allItems = categories.flatMap(c => c.items)
  const rankedItems = [...allItems].sort((a, b) =>
    (b.clickCount || 0) - (a.clickCount || 0)
    || (b.lastOpenedAt || '').localeCompare(a.lastOpenedAt || '')
    || a.title.localeCompare(b.title)
  )
  const frequentItems = rankedItems.filter(i => i.clickCount > 0).slice(0, 8)

  function matchesItem(item: typeof allItems[0]) {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return true
    return [item.title, item.url, item.lanUrl, item.description].join(' ').toLowerCase().includes(q)
  }

  const filteredCategories = categories
    .filter(g => activeGroup === '全部' || g.title === activeGroup)
    .map(g => ({ ...g, items: [...g.items].sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0) || a.sortOrder - b.sortOrder).filter(matchesItem) }))
    .filter(g => g.items.length > 0 || editMode)

  const visibleCount = filteredCategories.reduce((s, g) => s + g.items.length, 0)

  const inputCls = `w-full px-3 py-2.5 rounded-xl border border-white/[0.08]
    bg-white/[0.06] text-white text-sm outline-none
    focus:border-blue-500/50 focus:bg-white/[0.08] transition-all
    placeholder-white/25`

  const labelCls = 'block text-xs font-medium mb-1 text-white/50'

  function renderForm() {
    const { entity, editing, data: fd } = crud.form
    if (!entity) return null

    if (entity === 'category') {
      return (
        <Modal open onClose={crud.closeForm} title={editing ? '编辑分类' : '新建分类'}>
          <label className={labelCls}>分类名称</label>
          <input autoFocus value={fd.title ?? ''} onChange={e => crud.setField('title', e.target.value)}
            className={inputCls} />
          <div className="flex gap-2 pt-5">
            {editing && (
              <button onClick={() => crud.deleteCategory(Number(fd.id)).then(() => crud.closeForm())}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">删除</button>
            )}
            <div className="ml-auto flex gap-2">
              <button onClick={crud.closeForm}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-white/[0.06] transition-colors">取消</button>
              <button onClick={crud.saveCategory}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20">保存</button>
            </div>
          </div>
        </Modal>
      )
    }

    return (
      <Modal open onClose={crud.closeForm} title={editing ? '编辑站点' : '添加站点'}>
        <div className="flex flex-col gap-3.5">
          <div>
            <label className={labelCls}>名称</label>
            <input autoFocus value={fd.title ?? ''} onChange={e => crud.setField('title', e.target.value)}
              className={inputCls} placeholder="站点名称" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>外网地址</label>
              <input value={fd.url ?? ''} onChange={e => crud.setField('url', e.target.value)}
                className={inputCls} placeholder="https://example.com" />
            </div>
            <div>
              <label className={labelCls}>内网地址</label>
              <input value={fd.lanUrl ?? ''} onChange={e => crud.setField('lanUrl', e.target.value)}
                className={inputCls} placeholder="http://example.local" />
            </div>
          </div>
          <div>
            <label className={labelCls}>描述 / 备注</label>
            <input value={fd.description ?? ''} onChange={e => crud.setField('description', e.target.value)}
              className={inputCls} placeholder="站点描述" />
          </div>
          <div>
            <label className={labelCls}>图标 URL</label>
            <input value={fd.icon ?? ''} onChange={e => crud.setField('icon', e.target.value)}
              className={inputCls} placeholder="https://example.com/favicon.ico" />
          </div>
          <div className="flex gap-2 pt-2">
            {editing && (
              <button onClick={() => crud.deleteItem(Number(fd.id)).then(() => crud.closeForm())}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">删除</button>
            )}
            <div className="ml-auto flex gap-2">
              <button onClick={crud.closeForm}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-white/[0.06] transition-colors">取消</button>
              <button onClick={crud.saveItem}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/20 transition-all">保存</button>
            </div>
          </div>
        </div>
      </Modal>
    )
  }

  function handleContextMenu(e: React.MouseEvent, item: Item) {
    e.preventDefault()
    setCtxMenu({ x: e.clientX, y: e.clientY, item })
  }

  function openItem(item: Item) {
    const href = item.url.startsWith('http') ? item.url : `https://${item.url}`
    window.open(href, '_blank', 'noopener,noreferrer')
    api.visitItem(item.id).then(() => app.refresh()).catch(() => {})
  }

  function itemHost(item: Item) {
    try { return new URL(item.url.startsWith('http') ? item.url : `https://${item.url}`).host }
    catch { return item.url.replace(/^https?:\/\//, '') }
  }

  function itemIcon(item: Item) {
    const icon = item.icon?.replace(/^\.\//, '/')
    if (icon) return icon
    const host = itemHost(item)
    return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ''
  }

  function renderFrequent() {
    const items = frequentItems.length > 0 ? frequentItems : rankedItems.slice(0, 8)
    return (
      <section className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-mono text-sm font-semibold tracking-[0.18em] text-cyan-100/90">排行榜</h2>
            <p className="mt-1 text-[0.68rem] text-emerald-100/42">
              {frequentItems.length > 0 ? '按访问次数和最近打开自动排序' : '打开几次站点后，这里会自动变成你的常用区'}
            </p>
          </div>
          <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 font-mono text-[0.62rem] tracking-[0.16em] text-emerald-200 shadow-[0_0_18px_rgba(52,211,153,.12)]">
            AUTO RANK
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {items.map(item => (
            <button
              key={item.id}
              onClick={() => openItem(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              className="cyber-card group min-h-[6.2rem] rounded-xl border border-cyan-300/[0.14] bg-slate-950/65 p-3 text-left backdrop-blur-xl transition duration-200 hover:border-cyan-300/45 hover:bg-slate-900/80 hover:shadow-[0_0_34px_rgba(34,211,238,.16)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-lg bg-cyan-300/10 ring-1 ring-cyan-300/15">
                  {itemIcon(item) ? (
                    <img
                      src={itemIcon(item)}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement
                        const host = itemHost(item)
                        const fallback = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ''
                        if (fallback && img.src !== fallback) {
                          img.src = fallback
                          return
                        }
                        img.style.display = 'none'
                      }}
                    />
                  ) : <span className="font-mono text-xs text-cyan-100">{item.title.slice(0, 2)}</span>}
                </div>
                <span className="font-mono text-[0.62rem] tabular-nums text-emerald-200/80">#{item.clickCount || 0}</span>
              </div>
              <div className="truncate text-xs font-semibold text-cyan-50/90">{item.title}</div>
              <div className="mt-1 truncate font-mono text-[0.6rem] text-emerald-100/38">{itemHost(item)}</div>
            </button>
          ))}
        </div>
      </section>
    )
  }

  return (
    <>
      <Background imageUrl={settings.backgroundImage} theme={settings.theme} />

      {/* Noise overlay */}
      <div className="noise-overlay" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 pb-28"
        onContextMenu={e => { if (editMode) e.preventDefault() }}>
        <div className="flex flex-col gap-1.5 mb-5">
          <Header
            logoText={settings.logoText}
            heroText={settings.heroText}
            groupCount={categories.length}
            siteCount={allItems.length}
          />
        </div>

        {renderFrequent()}

        <section className="cyber-panel rounded-xl border border-cyan-300/[0.12] bg-black/30 p-3 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <SearchBox value={searchQuery} onChange={setSearchQuery} />
            {editMode && (
              <button onClick={() => crud.openNewCat()}
                className="px-3.5 py-2.5 rounded-xl font-mono text-xs font-medium tracking-[0.12em]
                  border border-dashed border-cyan-300/[0.24]
                  text-cyan-100/55 hover:text-cyan-100 hover:border-cyan-300/35
                  transition-all bg-white/[0.04] backdrop-blur-xl whitespace-nowrap">
                + CATEGORY</button>
            )}
          </div>

          <FilterBar categories={categories} activeGroup={activeGroup} onSelect={setActiveGroup} />

          <p className="mb-4 font-mono text-[0.68rem] font-normal text-emerald-100/34 tracking-[0.08em]">
            {loading ? '加载中…' :
              activeGroup === '全部'
                ? `当前视图 ${visibleCount} 个站点，分类内按常用程度优先`
                : `分类「${activeGroup}」下 ${visibleCount} 个站点`}
          </p>

          {loading ? <SkeletonLoader />
          : filteredCategories.length === 0 ? <EmptyState />
          : <div className="flex flex-col gap-5">
              {filteredCategories.map((group, i) => (
                <GroupBlock key={group.id} group={group} index={i} editMode={editMode}
                  onAddItem={() => crud.openNewItem(group.id)}
                  onEditGroup={() => crud.openEditCat(group)}
                  onEditItem={crud.openEditItem}
                  onOpenItem={openItem}
                  onContextMenu={handleContextMenu}
                />
              ))}
            </div>
          }
        </section>

        <OpsPanel />
      </div>

      {/* Float bar */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-row-reverse gap-3 items-center">
        <button onClick={() => crud.openNewItem(0)}
          className="w-12 h-12 md:w-14 md:h-14 rounded-full grid place-items-center text-2xl
            bg-linear-to-br from-blue-500 via-indigo-500 to-purple-600 text-white
            shadow-lg shadow-blue-500/40
            hover:shadow-2xl hover:shadow-blue-500/60 hover:scale-110
            active:scale-95 transition-all duration-200
            ring-1 ring-white/10"
          title="添加站点">+</button>
        <button onClick={() => setEditMode(!editMode)}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full grid place-items-center text-base md:text-lg
            backdrop-blur-2xl border-2 transition-all duration-200
            ${editMode
              ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/30'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/40 hover:shadow-xl hover:shadow-white/10'
            }`}
          title={editMode ? '退出编辑' : '编辑模式'}>✎</button>
        <button onClick={() => crud.setSettingsOpen(true)}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full grid place-items-center text-base md:text-lg
            bg-white/10 border-2 border-white/20 text-white
            hover:bg-white/15 hover:border-white/40 hover:shadow-xl hover:shadow-white/10
            transition-all duration-200"
          title="设置">⚙</button>
      </div>

      {renderForm()}
      {crud.settingsOpen && <SettingsPanel open onClose={() => crud.setSettingsOpen(false)} />}

      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y} item={ctxMenu.item}
          onClose={() => setCtxMenu(null)}
          onEdit={() => crud.openEditItem(ctxMenu.item)}
          onOpen={() => openItem(ctxMenu.item)}
          onDelete={() => crud.deleteItem(ctxMenu.item.id)}
        />
      )}
    </>
  )
}

function AuthenticatedApp() {
  const state = useApp()

  return (
    <AppCtx.Provider value={state}>
      <ToastProvider>
        <Page />
      </ToastProvider>
    </AppCtx.Provider>
  )
}

export function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    api.authStatus()
      .then(result => setAuthenticated(result.authenticated))
      .catch(() => setAuthenticated(false))
  }, [])

  if (authenticated === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-950 text-cyan-100">
        <div className="font-mono text-xs tracking-[0.18em] text-cyan-100/60">KINGPANEL</div>
      </div>
    )
  }

  if (!authenticated) {
    return <LoginScreen onLogin={() => setAuthenticated(true)} />
  }

  return <AuthenticatedApp />
}

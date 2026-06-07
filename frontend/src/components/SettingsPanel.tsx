import { useState, useRef } from 'react'
import { Modal } from './Modal'
import { api } from '../api'
import { useAppCtx } from '../hooks/appContext'
import { useToast } from '../hooks/useToast'
import { errorMessage } from '../utils/error'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

const presetWallpapers = [
  { name: '默认深色', url: '' },
  { name: '星辰', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920' },
  { name: '山脉', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920' },
  { name: '海洋', url: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1920' },
  { name: '极光', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920' },
  { name: '森林', url: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=1920' },
]

const themeOptions = [
  { id: 'hacker', name: '黑客风', desc: '青绿终端 / 渗透控制台' },
  { id: 'sci-fi', name: '科幻', desc: '蓝色舰桥 / AI 中控' },
  { id: 'neon', name: '霓虹', desc: '紫粉赛博 / 夜城视觉' },
  { id: 'graphite', name: '石墨', desc: '低调深灰 / 高级工具' },
] as const

export function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const { data, refresh } = useAppCtx()
  const { toast } = useToast()
  const s = data?.settings

  const [logoText, setLogoText] = useState(s?.logoText ?? '')
  const [heroText, setHeroText] = useState(s?.heroText ?? '')
  const [theme, setTheme] = useState(s?.theme === 'dark' ? 'hacker' : s?.theme === 'light' ? 'graphite' : (s?.theme ?? 'hacker'))
  const [bgInput, setBgInput] = useState(s?.backgroundImage ?? '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const importRef = useRef<HTMLInputElement>(null)

  function reset() {
    const s2 = data?.settings
    setLogoText(s2?.logoText ?? '')
    setHeroText(s2?.heroText ?? '')
    setTheme(s2?.theme === 'dark' ? 'hacker' : s2?.theme === 'light' ? 'graphite' : (s2?.theme ?? 'hacker'))
    setBgInput(s2?.backgroundImage ?? '')
  }

  async function handleSave() {
    setSaving(true)
    try {
      await api.updateSettings({ logoText, heroText, theme, backgroundImage: bgInput })
      toast('设置已保存', 'success')
      onClose()
      await refresh()
    } catch (e: unknown) {
      toast(errorMessage(e, '保存失败'), 'error')
    }
    setSaving(false)
  }

  async function handleExport() {
    try {
      const res = await api.exportData()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kingpanel-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast('导出成功', 'success')
    } catch (e: unknown) {
      toast(errorMessage(e, '导出失败'), 'error')
    }
  }

  async function handleImport(file: File) {
    try {
      const result = await api.importData(file)
      toast(result.message || '导入成功', 'success')
      onClose()
      await refresh()
    } catch (e: unknown) {
      toast(errorMessage(e, '导入失败'), 'error')
    }
  }

  async function handleUploadBg(file: File) {
    try {
      const result = await api.uploadFile(file)
      setBgInput(result.path)
      toast('壁纸已上传', 'success')
    } catch (e: unknown) {
      toast(errorMessage(e, '上传失败'), 'error')
    }
  }

  const inputCls = `w-full px-3 py-2 rounded-xl border border-white/[0.08]
    bg-white/[0.06] text-white text-sm outline-none
    focus:border-blue-500/50 focus:bg-white/[0.08] transition-all
    placeholder-white/25`

  return (
    <Modal open={open} onClose={onClose} title="设置">
      <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin">
        {/* Logo text + subtitle */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/50">Logo 文字</label>
            <input value={logoText} onChange={e => setLogoText(e.target.value)}
              className={inputCls} placeholder="网址导航" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-white/50">副标题</label>
            <input value={heroText} onChange={e => setHeroText(e.target.value)}
              className={inputCls} placeholder="收藏你的网络世界" />
          </div>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/50">主题</label>
          <div className="grid grid-cols-2 gap-2">
            {themeOptions.map(t => (
              <button key={t.id}
                onClick={() => setTheme(t.id)}
                className={`rounded-xl border p-3 text-left transition-all
                  ${theme === t.id
                    ? 'border-cyan-300/45 bg-cyan-300/12 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,.12)]'
                    : 'border-white/[0.06] bg-white/[0.04] text-white/58 hover:border-white/15 hover:bg-white/[0.07]'}`}
              >
                <span className="block font-mono text-xs font-semibold tracking-[0.12em]">{t.name}</span>
                <span className="mt-1 block text-[0.65rem] text-white/38">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Background */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/50">背景壁纸</label>
          <div className="flex gap-2">
            <input value={bgInput} onChange={e => setBgInput(e.target.value)}
              placeholder="壁纸 URL..." className={`flex-1 ${inputCls}`} />
            <button onClick={() => fileRef.current?.click()}
              className="px-3 py-2 rounded-xl text-sm font-medium bg-white/[0.06] text-white/60
                hover:bg-white/[0.1] border border-white/[0.06] transition-colors shrink-0"
            >上传</button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleUploadBg(f) }} />
        </div>

        {/* Preset wallpapers */}
        <div>
          <label className="block text-xs font-medium mb-2 text-white/50">预设壁纸</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {presetWallpapers.map(p => (
              <button key={p.name}
                onClick={() => setBgInput(p.url)}
                className={`relative aspect-[3/2] rounded-xl overflow-hidden border-2 transition-all
                  ${bgInput === p.url ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-transparent hover:border-white/15'}`}
              >
                {p.url ? (
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                )}
                <div className="absolute inset-x-0 bottom-0 px-1.5 py-1 bg-black/60 backdrop-blur-sm">
                  <span className="text-[0.6rem] text-white/80 block truncate">{p.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <hr className="border-white/[0.06]" />

        {/* Import / Export */}
        <div>
          <label className="block text-xs font-medium mb-1.5 text-white/50">数据管理</label>
          <div className="flex gap-2">
            <button onClick={handleExport}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-white/[0.06] text-white/60
                border border-white/[0.06] hover:border-blue-500/30 hover:text-blue-400 transition-all"
            >📥 导出 JSON</button>
            <button onClick={() => importRef.current?.click()}
              className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-white/[0.06] text-white/60
                border border-white/[0.06] hover:border-blue-500/30 hover:text-blue-400 transition-all"
            >📤 导入 JSON</button>
          </div>
          <input ref={importRef} type="file" accept=".json" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleImport(f) }} />
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-2 pt-5 mt-2 border-t border-white/[0.06]">
        <button onClick={() => { reset(); onClose() }}
          className="px-4 py-2 rounded-xl text-sm font-medium text-white/50 hover:bg-white/[0.06] transition-colors">
          取消
        </button>
        <button disabled={saving} onClick={handleSave}
          className="px-5 py-2 rounded-xl text-sm font-medium bg-blue-500 text-white
            hover:bg-blue-400 disabled:opacity-50 shadow-lg shadow-blue-500/20 transition-all">
          {saving ? '保存中…' : '保存设置'}
        </button>
      </div>
    </Modal>
  )
}

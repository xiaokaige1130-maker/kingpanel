import type { Item } from '../types'

function getHost(url: string) {
  try { return new URL(url.startsWith('http') ? url : `https://${url}`).host }
  catch { return url || '' }
}

function getIconSrc(item: Item) {
  if (item.icon) return item.icon.replace(/^\.\//, '/')
  const host = getHost(item.url)
  return host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ''
}

function fallbackText(title: string) {
  return (title || '?').replace(/\s+/g, '').slice(0, 2).toUpperCase()
}

interface SiteCardProps {
  item: Item
  index: number
  editMode: boolean
  onEdit: () => void
  onOpen?: (item: Item) => void
  onContextMenu?: (e: React.MouseEvent) => void
}

export function SiteCard({ item, index, editMode, onEdit, onOpen, onContextMenu }: SiteCardProps) {
  const href = item.url.startsWith('http') ? item.url : `https://${item.url}`
  const iconSrc = getIconSrc(item)

  function renderIcon() {
    return iconSrc ? (
      <img src={iconSrc} alt="" className="w-full h-full object-cover rounded-xl"
        onError={e => {
          const img = e.target as HTMLImageElement
          const host = getHost(item.url)
          const fallback = host ? `https://www.google.com/s2/favicons?domain=${host}&sz=64` : ''
          if (fallback && img.src !== fallback) {
            img.src = fallback
            return
          }
          img.style.display = 'none'
          img.parentElement!.querySelector('span')!.classList.remove('hidden')
        }} />
    ) : null
  }

  const inner = (
    <>
      <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-cyan-300/[0.07] ring-1 ring-cyan-300/[0.16] shadow-[0_0_18px_rgba(34,211,238,.08)]">
        {renderIcon()}
        <span className={`${iconSrc ? 'hidden' : ''}
          text-xs font-bold text-cyan-50 w-full h-full grid place-items-center
          bg-[linear-gradient(135deg,rgba(34,211,238,.45),rgba(16,185,129,.22))]`}>
          {fallbackText(item.title)}
        </span>
      </div>
      <div className="min-w-0 w-full text-center">
        <div className="truncate text-[0.78rem] font-semibold leading-tight text-cyan-50/92">
          {item.title}
        </div>
        <div className="mt-1 truncate font-mono text-[0.56rem] font-normal tracking-[0.04em] text-emerald-100/38">
          {getHost(item.url)}
        </div>
      </div>
      {item.clickCount > 0 && (
        <div className="absolute right-2 top-2 rounded-md border border-emerald-300/18 bg-emerald-300/10 px-1.5 py-0.5 font-mono text-[0.56rem] tabular-nums text-emerald-300/78">
          {item.clickCount}
        </div>
      )}
      {editMode && (
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit() }}
          className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-lg
            border border-cyan-300/14 bg-slate-950/80 text-xs text-cyan-100/55
            hover:bg-cyan-300/15 hover:text-cyan-50 transition-colors"
          title="编辑"
        >
          ✎
        </button>
      )}
    </>
  )

  const sharedClasses = `cyber-card relative flex min-h-[7.6rem] flex-col items-center justify-center gap-2.5 px-3 py-3 rounded-xl
    bg-slate-950/62 dark:bg-slate-950/62 light:bg-white/70
    border border-cyan-300/[0.12] dark:border-cyan-300/[0.12] light:border-black/[0.06]
    backdrop-blur-xl
    animate-[cardIn_0.35s_ease_both]`

  if (editMode) {
    return (
      <div
        className={`${sharedClasses}`}
        style={{ animationDelay: `${index * 20}ms` }}
      >
        {inner}
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`${sharedClasses}
        transition-all duration-200
        hover:bg-cyan-300/[0.06]
        hover:border-cyan-300/35
        hover:shadow-[0_0_28px_rgba(34,211,238,.12)]`}
      style={{ animationDelay: `${index * 20}ms` }}
      onContextMenu={onContextMenu}
      onClick={(e) => {
        if (!onOpen) return
        e.preventDefault()
        onOpen(item)
      }}
    >
      {inner}
    </a>
  )
}

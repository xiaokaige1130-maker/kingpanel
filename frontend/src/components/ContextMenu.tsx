import { useEffect, useRef } from 'react'
import type { Item } from '../types'

interface ContextMenuProps {
  x: number
  y: number
  item: Item
  onClose: () => void
  onEdit: () => void
  onOpen: () => void
  onDelete: () => void
}

export function ContextMenu({ x, y, item, onClose, onEdit, onOpen, onDelete }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handle(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent && e.key === 'Escape') { onClose(); return }
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('keydown', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('keydown', handle)
    }
  }, [onClose])

  const ax = Math.min(x, window.innerWidth - 160)
  const ay = Math.min(y, window.innerHeight - 160)

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[140px] rounded-2xl overflow-hidden
        bg-gray-900/95 backdrop-blur-2xl
        border border-white/[0.08]
        shadow-2xl shadow-black/40
        animate-[fadeIn_0.08s_ease]"
      style={{ left: ax, top: ay }}
    >
      <div className="px-4 py-2.5 border-b border-white/[0.06] text-xs font-medium text-white/40 truncate">
        {item.title}
      </div>
      <button onClick={() => { onOpen(); onClose() }}
        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.06] transition-colors flex items-center gap-2">
        <span className="text-xs text-white/40">↗</span> 打开
      </button>
      <button onClick={() => { onEdit(); onClose() }}
        className="w-full text-left px-4 py-2.5 text-sm text-white/80 hover:bg-white/[0.06] transition-colors flex items-center gap-2">
        <span className="text-xs text-white/40">✎</span> 编辑
      </button>
      <button onClick={() => { onDelete(); onClose() }}
        className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/[0.06]">
        <span className="text-xs text-red-400/60">✕</span> 删除
      </button>
    </div>
  )
}

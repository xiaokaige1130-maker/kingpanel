import type { Category, Item } from '../types'
import { SiteCard } from './SiteCard'

interface GroupBlockProps {
  group: Category
  index: number
  editMode: boolean
  onAddItem: () => void
  onEditGroup: () => void
  onEditItem: (item: Item) => void
  onOpenItem?: (item: Item) => void
  onContextMenu: (e: React.MouseEvent, item: Item) => void
}

export function GroupBlock({ group, index, editMode, onAddItem, onEditGroup, onEditItem, onOpenItem, onContextMenu }: GroupBlockProps) {
  return (
    <section
      className="animate-[groupIn_0.4s_ease_both]"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex items-center gap-2.5 mb-3">
        <div className="h-4 w-px shrink-0 bg-cyan-300/70 shadow-[0_0_10px_rgba(34,211,238,.7)]" />
        <h2 className="font-mono text-xs font-semibold tracking-[0.14em] text-cyan-100/72 dark:text-cyan-100/72 light:text-gray-700 truncate">
          {group.title}
        </h2>
        {editMode && (
          <button
            onClick={(e) => { e.preventDefault(); onEditGroup() }}
            className="text-xs text-cyan-300/70 hover:text-cyan-200 transition-colors"
            title="编辑分类"
          >
            ✎
          </button>
        )}
        <span className="ml-auto shrink-0 font-mono text-[0.64rem] text-emerald-100/35 dark:text-emerald-100/35 light:text-gray-400 font-normal">
          {group.items.length} 个站点
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {group.items.map((item, i) => (
          <SiteCard
            key={item.id}
            item={item}
            index={i}
            editMode={editMode}
            onEdit={() => onEditItem(item)}
            onOpen={onOpenItem}
            onContextMenu={(e) => onContextMenu(e, item)}
          />
        ))}
        {editMode && (
          <button
            onClick={(e) => { e.preventDefault(); onAddItem() }}
            className="flex min-h-[7.6rem] flex-col items-center justify-center gap-2 rounded-xl px-3 py-3
              border border-dashed border-cyan-300/[0.16] dark:border-cyan-300/[0.16] light:border-black/[0.08]
              text-cyan-100/32 hover:text-cyan-100 hover:border-cyan-300/35
              transition-colors bg-cyan-300/[0.03] backdrop-blur-xl"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="font-mono text-[0.65rem] tracking-[0.12em]">ADD NODE</span>
          </button>
        )}
      </div>
    </section>
  )
}

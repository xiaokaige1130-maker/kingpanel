import type { Category } from '../types'

interface FilterBarProps {
  categories: Category[]
  activeGroup: string
  onSelect: (name: string) => void
}

export function FilterBar({ categories, activeGroup, onSelect }: FilterBarProps) {
  const names = ['全部', ...categories.map(c => c.title)]

  return (
    <div className="flex flex-wrap gap-1.5 mb-5">
      {names.map(name => (
        <button
          key={name}
          onClick={() => onSelect(name)}
          className={`
            px-3.5 py-1.5 rounded-lg font-mono text-[0.68rem] font-medium tracking-[0.1em] whitespace-nowrap
            transition-all duration-200
            ${name === activeGroup
              ? 'bg-cyan-300/14 text-cyan-50 border border-cyan-300/30 shadow-[0_0_22px_rgba(34,211,238,.12)]'
              : 'border border-transparent text-cyan-100/48 dark:text-cyan-100/48 light:text-gray-600 '
              + 'hover:text-cyan-50 hover:bg-cyan-300/[0.06] hover:border-cyan-300/15'
            }`}
        >
          {name}
        </button>
      ))}
    </div>
  )
}

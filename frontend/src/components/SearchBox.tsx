interface SearchBoxProps {
  value: string
  onChange: (v: string) => void
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <div className="relative flex-1 min-w-48">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        id="global-search"
        type="search"
        placeholder="SEARCH NODE / URL / MEMO..."
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl font-mono text-xs tracking-[0.08em]
          bg-slate-950/62 dark:bg-slate-950/62 light:bg-black/[0.04]
          border border-cyan-300/[0.14] dark:border-cyan-300/[0.14] light:border-black/[0.08]
          text-cyan-50 dark:text-cyan-50 light:text-gray-900
          placeholder-white/30 dark:placeholder-white/30 light:placeholder-black/30
          outline-none focus:border-cyan-300/50 focus:bg-cyan-300/[0.07] transition-all
          backdrop-blur-xl shadow-[inset_0_0_20px_rgba(34,211,238,.04)]"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/10
            grid place-items-center text-xs text-white/50 hover:bg-white/20 transition-colors"
        >
          ✕
        </button>
      )}
    </div>
  )
}

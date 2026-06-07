interface HeaderProps {
  logoText: string
  heroText?: string
  groupCount?: number
  siteCount?: number
}

export function Header({ logoText }: HeaderProps) {
  const title = logoText || 'KingPanel'

  return (
    <header className="graffiti-hero command-hero relative overflow-hidden rounded-2xl border border-[var(--kp-border-strong)] px-4 py-3 shadow-[var(--kp-hero-shadow)] backdrop-blur-xl md:px-5 md:py-4">
      <div className="command-hero-grid absolute inset-0 pointer-events-none" />
      <div className="graffiti-spray graffiti-spray-a absolute pointer-events-none" />
      <div className="graffiti-spray graffiti-spray-b absolute pointer-events-none" />
      <div className="graffiti-tags absolute inset-0 pointer-events-none">
        <span className="tag tag-a">HYPER LINK</span>
        <span className="tag tag-b">NOISE_77</span>
        <span className="tag tag-c">AI ROUTE</span>
      </div>
      <svg className="graffiti-lines pointer-events-none absolute inset-0" viewBox="0 0 960 280" preserveAspectRatio="none" aria-hidden="true">
        <path className="graffiti-stroke graffiti-stroke-a" d="M44 198 C160 68 230 258 356 122 S558 68 704 162 842 215 925 104" />
        <path className="graffiti-stroke graffiti-stroke-b" d="M78 74 C180 126 250 28 348 82 S515 176 640 74 796 45 884 126" />
        <path className="graffiti-stroke graffiti-stroke-c" d="M188 235 L238 188 L290 226 L344 170 L392 220 L458 154" />
      </svg>
      <div className="graffiti-orbit absolute right-4 top-1/2 hidden -translate-y-1/2 lg:block">
        <div className="graffiti-ring graffiti-ring-a" />
        <div className="graffiti-ring graffiti-ring-b" />
        <div className="graffiti-core">
          <span>K</span>
        </div>
      </div>
      <div className="command-hero-beam absolute inset-x-0 top-0 h-px" />
      <div className="command-hero-beam absolute inset-x-0 bottom-0 h-px" />

      <div className="relative z-10 flex min-h-[6.25rem] flex-col justify-center gap-3 lg:pr-[15rem]">
        <div className="flex items-center justify-between gap-4">
          <div className="graffiti-badge inline-flex items-center gap-2 rounded-full border border-[var(--kp-border)] bg-[var(--kp-chip)] px-3 py-1 font-mono text-[0.62rem] tracking-[0.22em] text-[var(--kp-accent-soft)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--kp-accent)] shadow-[0_0_14px_var(--kp-accent)]" />
            CYBER WALL ONLINE
          </div>
          <div className="hidden font-mono text-[0.58rem] tracking-[0.18em] text-[var(--kp-muted)] sm:block">
            ROUTE / OPS / GRAFFITI AI
          </div>
        </div>

        <div>
          <div className="graffiti-kicker mb-2 inline-flex items-center gap-2 font-mono text-[0.56rem] font-black tracking-[0.24em] text-[var(--kp-accent-soft)]">
            <span className="h-px w-10 bg-[var(--kp-accent)]" />
            NEON CONTROL
          </div>
          <h1 className="graffiti-title max-w-4xl text-3xl font-black leading-none text-[var(--kp-text)] md:text-5xl" data-text={title}>
            {title}
          </h1>
        </div>
      </div>
    </header>
  )
}

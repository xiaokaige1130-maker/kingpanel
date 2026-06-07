interface BackgroundProps {
  imageUrl?: string
  theme?: string
}

export function Background({ imageUrl, theme = 'hacker' }: BackgroundProps) {
  const code = ['root@kingpanel:~# scan --ai-nodes', 'ssh node@example.local status=online', 'vector.rank(websites) => hotlist', 'nas.sync.telemetry latency<10ms', 'agent.ops.monitor /proc/loadavg', 'neural route cache warm']
  const normalized = theme === 'dark' ? 'hacker' : theme === 'light' ? 'graphite' : theme
  const overlay = {
    hacker: 'radial-gradient(circle at 50% -20%, rgba(34,211,238,.18), transparent 34%), linear-gradient(180deg, rgba(2,6,23,.76), rgba(2,6,23,.94))',
    'sci-fi': 'radial-gradient(circle at 20% 0%, rgba(56,189,248,.2), transparent 32%), radial-gradient(circle at 85% 18%, rgba(129,140,248,.18), transparent 30%), linear-gradient(180deg, rgba(3,7,18,.76), rgba(8,13,28,.94))',
    neon: 'radial-gradient(circle at 20% -10%, rgba(236,72,153,.18), transparent 32%), radial-gradient(circle at 86% 16%, rgba(34,211,238,.18), transparent 30%), linear-gradient(180deg, rgba(8,3,20,.78), rgba(2,6,23,.94))',
    graphite: 'radial-gradient(circle at 50% -20%, rgba(14,165,233,.12), transparent 32%), linear-gradient(180deg, rgba(15,23,42,.68), rgba(2,6,23,.9))',
  }[normalized] ?? 'linear-gradient(180deg, rgba(2,6,23,.76), rgba(2,6,23,.94))'

  return (
    <>
      {/* Wallpaper layer */}
      <div
        className="fixed inset-0 transition-[background-image] duration-700 z-0"
        style={{
          background: imageUrl
            ? `url("${imageUrl}") center / cover no-repeat`
            : undefined,
        }}
      />
      {/* Gradient overlay */}
      <div className="fixed inset-0 z-[1]
        backdrop-blur-xl"
        style={{ background: overlay }}
      />
      <div
        className="fixed inset-0 z-[2] opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,211,238,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-[3] overflow-hidden opacity-45">
        <div className="code-stream code-stream-a">
          {code.map((line, i) => <span key={i}>{line}</span>)}
        </div>
        <div className="code-stream code-stream-b">
          {code.slice().reverse().map((line, i) => <span key={i}>{line}</span>)}
        </div>
      </div>
      <div className="scanline pointer-events-none fixed inset-0 z-[4]" />
    </>
  )
}

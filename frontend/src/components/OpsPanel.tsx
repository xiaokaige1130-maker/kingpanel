import { useEffect, useState } from 'react'
import { api } from '../api'
import type { OpsHost } from '../types'

function pct(v?: number) {
  return Math.max(0, Math.min(100, v ?? 0))
}

function uptime(seconds?: number) {
  if (!seconds) return '-'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  return d > 0 ? `${d}d ${h}h` : `${h}h`
}

function MetricBar({ label, value, tone }: { label: string; value?: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[0.55rem] text-white/38">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{Math.round(pct(value))}%</span>
      </div>
      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct(value)}%` }} />
      </div>
    </div>
  )
}

function HostCard({ host }: { host: OpsHost }) {
  const online = host.status === 'online'
  const loadPercent = host.load && host.cpuCores ? (host.load[0] / host.cpuCores) * 100 : 0

  return (
    <article className="cyber-card rounded-xl border border-cyan-300/[0.10] bg-slate-950/50 p-3 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-cyan-300/30">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${online ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]' : 'bg-rose-400'}`} />
            <h3 className="truncate font-mono text-xs font-semibold tracking-[0.08em] text-cyan-50">{host.name}</h3>
          </div>
          <p className="mt-1 truncate font-mono text-[0.56rem] text-emerald-100/34">{host.hostname || host.address}</p>
        </div>
        <span className={`rounded-md px-1.5 py-0.5 font-mono text-[0.52rem] uppercase tracking-[0.14em] ${online ? 'text-emerald-200 bg-emerald-400/10' : 'text-rose-200 bg-rose-400/10'}`}>
          {host.status}
        </span>
      </div>

      {online ? (
        <div className="mt-3 grid gap-2">
          <div className="grid grid-cols-3 gap-2">
            <MetricBar label="CPU" value={loadPercent} tone="bg-cyan-300" />
            <MetricBar label="MEM" value={host.memory?.usedPercent} tone="bg-emerald-300" />
            <MetricBar label="DISK" value={host.disk?.usedPercent} tone="bg-amber-300" />
          </div>
          <div className="grid grid-cols-3 gap-2 font-mono text-[0.56rem] text-white/36">
            <div><span className="block text-cyan-50/75 tabular-nums">{host.load?.[0]?.toFixed(2) ?? '-'}</span>load</div>
            <div><span className="block text-cyan-50/75 tabular-nums">{uptime(host.uptimeSeconds)}</span>up</div>
            <div><span className="block text-cyan-50/75 tabular-nums">{host.latencyMs ? `${host.latencyMs}ms` : '-'}</span>ping</div>
          </div>
        </div>
      ) : (
        <p className="mt-3 line-clamp-2 text-[0.65rem] leading-4 text-rose-100/60">{host.error || '无法连接'}</p>
      )}
    </article>
  )
}

export function OpsPanel() {
  const [hosts, setHosts] = useState<OpsHost[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const result = await api.getOpsStatus()
      setHosts(result.hosts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const id = window.setInterval(load, 30000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-mono text-xs font-semibold tracking-[0.18em] text-cyan-100/75">OPS TELEMETRY</h2>
          <p className="mt-0.5 text-[0.62rem] text-emerald-100/34">底部遥测 / 30 秒刷新 / 新分组会自然下推</p>
        </div>
        <button onClick={load} className="rounded-lg border border-cyan-300/18 bg-cyan-300/[0.05] px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.12em] text-cyan-100/62 hover:text-cyan-100">
          REFRESH
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-white/[0.04]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {hosts.map(host => <HostCard key={host.id} host={host} />)}
        </div>
      )}
    </section>
  )
}

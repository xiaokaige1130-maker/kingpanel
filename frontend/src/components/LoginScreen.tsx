import { useState } from 'react'
import { api } from '../api'
import { errorMessage } from '../utils/error'

interface LoginScreenProps {
  onLogin: () => void
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.login(password)
      onLogin()
    } catch (err: unknown) {
      setError(errorMessage(err, '登录失败'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-slate-950 px-4 text-cyan-50">
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(34,211,238,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,.18)_1px,transparent_1px)] [background-size:32px_32px]" />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl border border-cyan-300/18 bg-slate-950/78 p-5 shadow-[0_0_70px_rgba(34,211,238,.16)] backdrop-blur-xl"
      >
        <div className="mb-5">
          <div className="font-mono text-[0.62rem] font-black tracking-[0.28em] text-cyan-200/70">
            KINGPANEL
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-normal text-cyan-50">登录面板</h1>
        </div>
        <label className="mb-1.5 block text-xs text-cyan-100/55">访问密码</label>
        <input
          autoFocus
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-xl border border-cyan-300/18 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none transition focus:border-cyan-300/50"
          placeholder="输入密码"
        />
        {error && <p className="mt-2 text-xs text-rose-200/80">{error}</p>}
        <button
          disabled={loading || !password}
          className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </main>
  )
}

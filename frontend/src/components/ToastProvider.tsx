import { useCallback, useState, type ReactNode } from 'react'
import { ToastCtx, type ToastItem, type ToastType } from '../hooks/toastContext'

let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const colorMap = {
    success: 'border-l-blue-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  } as const

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-5 right-5 z-60 flex flex-col gap-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-2xl text-sm shadow-xl
              bg-gray-900/90 backdrop-blur-2xl border border-white/[0.08]
              border-l-[3px] ${colorMap[t.type]}
              text-white animate-[slideIn_0.2s_ease]`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

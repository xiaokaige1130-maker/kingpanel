import { createContext, useContext } from 'react'
import type { AppState } from './useApp'

export const AppCtx = createContext<AppState | null>(null)

export function useAppCtx() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useAppCtx must be used within App')
  return ctx
}

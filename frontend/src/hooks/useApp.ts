import { useState, useCallback, useEffect } from 'react'
import type { AppData, Theme } from '../types'
import { api } from '../api'

export interface AppState {
  data: AppData | null
  loading: boolean
  editing: boolean
  searchQuery: string
  activeGroup: string
  theme: Theme
  refresh: () => Promise<void>
  setEditing: (v: boolean) => void
  setSearchQuery: (q: string) => void
  setActiveGroup: (g: string) => void
}

export function useApp(): AppState {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeGroup, setActiveGroup] = useState('全部')

  const refresh = useCallback(async () => {
    try {
      const d = await api.getData()
      setData(d)
      setThemeClass((d.settings.theme || 'hacker') as Theme)
    } catch (e) {
      console.error('Failed to load data', e)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      refresh().finally(() => setLoading(false))
    }, 0)
    return () => window.clearTimeout(id)
  }, [refresh])

  const theme = (data?.settings?.theme as Theme) || 'hacker'

  return {
    data,
    loading,
    editing,
    searchQuery,
    activeGroup,
    theme,
    refresh,
    setEditing,
    setSearchQuery,
    setActiveGroup,
  }
}

function setThemeClass(t: Theme) {
  const normalized = t === 'dark' ? 'hacker' : t === 'light' ? 'graphite' : t
  document.documentElement.dataset.theme = normalized
  document.documentElement.classList.toggle('dark', normalized !== 'graphite')
  document.documentElement.classList.toggle('light', normalized === 'graphite')
  for (const name of ['hacker', 'sci-fi', 'neon', 'graphite']) {
    document.documentElement.classList.toggle(`theme-${name}`, normalized === name)
  }
}

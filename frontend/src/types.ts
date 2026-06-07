export interface Item {
  id: number
  categoryId: number
  title: string
  url: string
  lanUrl: string
  description: string
  icon: string
  hostType: string
  clickCount: number
  lastOpenedAt: string
  sortOrder: number
}

export interface Category {
  id: number
  title: string
  sortOrder: number
  items: Item[]
}

export type Theme = 'hacker' | 'sci-fi' | 'neon' | 'graphite' | 'dark' | 'light'

export interface Settings {
  [key: string]: string
  logoText: string
  heroText: string
  backgroundImage: string
  theme: Theme
}

export interface AppData {
  settings: Settings
  categories: Category[]
}

export interface OpsHost {
  id: string
  name: string
  role: string
  address: string
  status: 'online' | 'offline' | 'error'
  hostname?: string
  load?: number[]
  cpuCores?: number
  memory?: {
    totalMb: number
    usedMb: number
    usedPercent: number
  }
  disk?: {
    mount: string
    total: string
    used: string
    usedPercent: number
  }
  uptimeSeconds?: number
  latencyMs?: number
  error?: string
}

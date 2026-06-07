import { API_BASE, request } from './client'

export const api = {
  authStatus: () =>
    request<{ authenticated: boolean }>('/api/auth/status'),
  login: (password: string) =>
    request<{ ok: boolean }>('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    }),
  logout: () =>
    request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),

  getData: () =>
    request<import('../types').AppData>('/api/data'),

  // Items
  createItem: (form: FormData) =>
    request<import('../types').Item>('/api/items', { method: 'POST', body: form }),
  updateItem: (id: number, form: FormData) =>
    request<import('../types').Item>(`/api/items/${id}`, { method: 'PUT', body: form }),
  deleteItem: (id: number) =>
    request<{ ok: boolean }>(`/api/items/${id}`, { method: 'DELETE' }),
  visitItem: (id: number) =>
    request<import('../types').Item>(`/api/items/${id}/visit`, { method: 'POST' }),
  reorderItems: (order: number[]) =>
    request<{ ok: boolean }>('/api/items/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }),

  // Categories
  createCategory: (form: FormData) =>
    request<import('../types').Category>('/api/categories', { method: 'POST', body: form }),
  updateCategory: (id: number, form: FormData) =>
    request<import('../types').Category>(`/api/categories/${id}`, { method: 'PUT', body: form }),
  deleteCategory: (id: number) =>
    request<{ ok: boolean }>(`/api/categories/${id}`, { method: 'DELETE' }),
  reorderCategories: (order: number[]) =>
    request<{ ok: boolean }>('/api/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }),

  // Settings
  getSettings: () =>
    request<Record<string, string>>('/api/settings'),
  updateSettings: (data: Record<string, string>) =>
    request<{ ok: boolean }>('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  // Import/Export
  exportData: () => fetch(`${API_BASE}/api/export`, { credentials: 'include' }),
  importData: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ ok: boolean; message: string }>('/api/import', { method: 'POST', body: form })
  },

  // Upload
  uploadFile: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<{ path: string }>('/api/upload', { method: 'POST', body: form })
  },

  getOpsStatus: () =>
    request<{ hosts: import('../types').OpsHost[] }>('/api/ops/status'),
}

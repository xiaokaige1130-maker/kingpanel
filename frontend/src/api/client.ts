export const API_BASE = ''

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
    ...init,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = res.statusText
    try {
      const parsed = JSON.parse(text) as { detail?: string; message?: string }
      message = parsed.detail || parsed.message || message
    } catch {
      message = text || message
    }
    throw new Error(message)
  }
  return res.json()
}

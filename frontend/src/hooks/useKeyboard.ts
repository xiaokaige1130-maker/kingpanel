import { useEffect } from 'react'

interface UseKeyboardOptions {
  onToggleEdit: () => void
}

export function useKeyboard({ onToggleEdit }: UseKeyboardOptions) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Ctrl+K or Cmd+K → focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const input = document.getElementById('global-search')
        if (input) {
          input.focus()
          if (input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) {
            input.select()
          }
        }
      }

      // Ctrl+E or Cmd+E → toggle edit mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        onToggleEdit()
      }

      // Escape → blur search
      if (e.key === 'Escape') {
        const input = document.getElementById('global-search')
        if (document.activeElement === input) {
          (input as HTMLInputElement)?.blur()
        }
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onToggleEdit])
}

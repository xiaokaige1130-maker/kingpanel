import { useRef, useCallback } from 'react'
import { api } from '../api'
import { useAppCtx } from './appContext'
import { useToast } from './useToast'
import { errorMessage } from '../utils/error'

type ReorderFn = (order: number[]) => Promise<{ ok: boolean }>

const reorderMap: Record<'category' | 'item', ReorderFn> = {
  category: (order: number[]) => api.reorderCategories(order),
  item: (order: number[]) => api.reorderItems(order),
}

export function useDragReorder(type: 'category' | 'item') {
  const dragItem = useRef<{ id: number; fromIndex: number } | null>(null)
  const { refresh } = useAppCtx()
  const { toast } = useToast()

  const onDragStart = useCallback((id: number, index: number) => {
    dragItem.current = { id, fromIndex: index }
  }, [])

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!dragItem.current) return
    // css hover effect handled externally
  }, [])

  const onDrop = useCallback(async (ids: number[]) => {
    if (!dragItem.current) return
    try {
      await reorderMap[type](ids)
      dragItem.current = null
      await refresh()
      toast('排序已保存', 'success')
    } catch (e: unknown) {
      toast(errorMessage(e, '排序失败'), 'error')
    }
  }, [type, refresh, toast])

  return { dragItem, onDragStart, onDragOver, onDrop }
}

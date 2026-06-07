import { useState } from 'react'
import type { Category, Item, Settings } from '../types'
import { api } from '../api'
import { useAppCtx } from './appContext'
import { useToast } from './useToast'
import { errorMessage } from '../utils/error'

type Entity = 'category' | 'item'
type FormValue = string | number

export interface FormState {
  entity: Entity | null
  editing: boolean
  data: Record<string, FormValue>
}

const emptyCategoryForm = { title: '' }
const emptyItemForm = { title: '', url: '', lanUrl: '', description: '', icon: '', categoryId: 0, hostType: 'wan' as const }

function toFormData(obj: Record<string, FormValue | undefined | null>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) {
      fd.append(k, String(v))
    }
  }
  return fd
}

function text(value: FormValue | undefined) {
  return String(value ?? '')
}

function numeric(value: FormValue | undefined) {
  return Number(value ?? 0)
}

export function useCrud() {
  const { refresh } = useAppCtx()
  const { toast } = useToast()
  const [form, setForm] = useState<FormState>({ entity: null, editing: false, data: {} })
  const [settingsOpen, setSettingsOpen] = useState(false)

  function openNewCat() {
    setForm({ entity: 'category', editing: false, data: { ...emptyCategoryForm } })
  }

  function openEditCat(cat: Category) {
    setForm({ entity: 'category', editing: true, data: { id: cat.id, title: cat.title } })
  }

  function openNewItem(categoryId: number) {
    setForm({ entity: 'item', editing: false, data: { ...emptyItemForm, categoryId } })
  }

  function openEditItem(item: Item) {
    setForm({ entity: 'item', editing: true, data: { ...item } })
  }

  function closeForm() {
    setForm({ entity: null, editing: false, data: {} })
  }

  function setField(key: string, value: FormValue) {
    setForm(prev => ({ ...prev, data: { ...prev.data, [key]: value } }))
  }

  async function saveCategory(): Promise<boolean> {
    const { data } = form
    const title = text(data.title).trim()
    if (!title) {
      toast('请输入分类名称', 'error')
      return false
    }
    try {
      if (form.editing) {
        await api.updateCategory(numeric(data.id), toFormData({ title }))
        toast('分类已更新', 'success')
      } else {
        await api.createCategory(toFormData({ title }))
        toast('分类已创建', 'success')
      }
      closeForm()
      await refresh()
      return true
    } catch (e: unknown) {
      toast(errorMessage(e, '保存失败'), 'error')
      return false
    }
  }

  async function deleteCategory(id: number): Promise<boolean> {
    if (!confirm('确定删除此分类？所有站点也将被删除。')) return false
    try {
      await api.deleteCategory(id)
      toast('分类已删除', 'success')
      await refresh()
      return true
    } catch (e: unknown) {
      toast(errorMessage(e, '删除失败'), 'error')
      return false
    }
  }

  async function saveItem(): Promise<boolean> {
    const { data } = form
    const title = text(data.title).trim()
    const url = text(data.url).trim()
    if (!title) { toast('请输入站点名称', 'error'); return false }
    if (!url) { toast('请输入站点地址', 'error'); return false }
    try {
      const fd = toFormData({
        category_id: data.categoryId,
        title,
        url,
        lan_url: text(data.lanUrl).trim(),
        description: text(data.description).trim(),
        icon: text(data.icon),
        host_type: text(data.hostType) || 'wan',
      })
      if (form.editing) {
        await api.updateItem(numeric(data.id), fd)
        toast('站点已更新', 'success')
      } else {
        await api.createItem(fd)
        toast('站点已创建', 'success')
      }
      closeForm()
      await refresh()
      return true
    } catch (e: unknown) {
      toast(errorMessage(e, '保存失败'), 'error')
      return false
    }
  }

  async function deleteItem(id: number): Promise<boolean> {
    if (!confirm('确定删除此站点？')) return false
    try {
      await api.deleteItem(id)
      toast('站点已删除', 'success')
      await refresh()
      return true
    } catch (e: unknown) {
      toast(errorMessage(e, '删除失败'), 'error')
      return false
    }
  }

  async function saveSettings(s: Partial<Settings>): Promise<boolean> {
    try {
      const json: Record<string, string> = {}
      for (const [k, v] of Object.entries(s)) {
        if (v !== undefined && v !== null) json[k] = String(v)
      }
      await api.updateSettings(json)
      toast('设置已保存', 'success')
      setSettingsOpen(false)
      await refresh()
      return true
    } catch (e: unknown) {
      toast(errorMessage(e, '保存失败'), 'error')
      return false
    }
  }

  return {
    form,
    settingsOpen, setSettingsOpen,
    openNewCat, openEditCat,
    openNewItem, openEditItem,
    closeForm, setField,
    saveCategory, deleteCategory,
    saveItem, deleteItem,
    saveSettings,
  }
}

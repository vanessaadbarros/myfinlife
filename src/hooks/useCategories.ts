import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/supabase'
import { useAuth } from '@/contexts/AuthContext'

type Category = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']

export function useCategories(type?: 'income' | 'expense') {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetchCategories()
  }, [user, type])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('categories')
        .select('*')
        .eq('user_id', user!.id)
        .order('name')

      if (type) {
        query = query.eq('type', type)
      }

      const { data, error } = await query

      if (error) throw error
      setCategories(data || [])
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (category: Omit<CategoryInsert, 'user_id'>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ ...category, user_id: user!.id }])
        .select()
        .single()

      if (error) throw error
      setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err as Error }
    }
  }

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user!.id)
        .select()
        .single()

      if (error) throw error
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? data : c)).sort((a, b) => a.name.localeCompare(b.name))
      )
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)

      if (error) throw error
      setCategories((prev) => prev.filter((c) => c.id !== id))
      return { error: null }
    } catch (err) {
      return { error: err as Error }
    }
  }

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  }
}


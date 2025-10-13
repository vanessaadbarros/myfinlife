import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Substitua estas variáveis pelas suas credenciais do Supabase
// Você pode encontrá-las em: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('❌ Supabase URL ou Anon Key não configuradas. Configure as variáveis de ambiente.')
  console.warn('URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltando')
  console.warn('KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Faltando')
} else {
  console.log('✅ Supabase configurado corretamente!')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})


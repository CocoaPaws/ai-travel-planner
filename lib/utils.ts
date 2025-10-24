// lib/utils.ts (最终简化版)

import { createBrowserClient } from '@supabase/ssr'

// 这个函数只用于客户端组件 ('use client')
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
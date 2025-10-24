// lib/supabaseClient.ts

import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取 Supabase 的 URL 和 anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 进行非空检查，如果环境变量不存在则抛出错误
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anon key are missing from .env.local');
}

// 创建并导出 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
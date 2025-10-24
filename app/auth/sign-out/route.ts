// app/auth/sign-out/route.ts
import { createSupabaseServer } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', req.url), {
    status: 302,
  });
}
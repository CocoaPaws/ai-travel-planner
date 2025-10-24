// app/layout.tsx (Notion 风格 - 完整版)

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton';
import styles from './Layout.module.css'; // 导入新的 CSS Module

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Travel Planner',
  description: '你的智能旅行规划助手',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Supabase 认证逻辑 (保持不变)
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  return (
      <html lang="en">
        <body className={inter.className}>
          <nav className={styles.navbar}>
            <Link href="/" className={styles.logo}>
              {/* SVG Logo */}
              <span>AI Travel Planner</span>
            </Link>
            <div>
              {user ? (
                <div className={styles.userActions}>
                  <span className={styles.userInfo}>欢迎, {user.email}</span>
                  <LogoutButton />
                </div>
              ) : (
                <div className={styles.authActions}>
                  <Link href="/login" className={styles.loginButton}>登录</Link>
                  <Link href="/signup" className={styles.signupButton}>注册</Link>
                </div>
              )}
            </div>
          </nav>
          <main>{children}</main>
        </body>
      </html>
    );
  }
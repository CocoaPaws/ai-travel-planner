// components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/utils';
import styles from './LogoutButton.module.css'; // 导入我们刚刚创建的 CSS Module

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.logoutButton} // 应用 CSS Module 中的类
    >
      注销
    </button>
  );
}
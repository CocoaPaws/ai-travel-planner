// components/AuthForm.tsx
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import styles from './AuthForm.module.css';
import Link from 'next/link'; // <--- 1. 导入 Link 组件

interface AuthFormProps {
  isSignUp: boolean;
}

export default function AuthForm({ isSignUp }: AuthFormProps) {
  // ... state 和 handleSubmit 函数保持不变 ...
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     setIsSubmitting(true);
     setError(null);
     try {
       if (isSignUp) {
         const { error } = await supabase.auth.signUp({
           email,
           password,
           options: { emailRedirectTo: `${location.origin}/auth/callback` },
         });
         if (error) throw error;
         alert('注册成功！');
         router.push('/login');
       } else {
         const { error } = await supabase.auth.signInWithPassword({ email, password });
         if (error) throw error;
         router.push('/');
         router.refresh();
       }
     } catch (err: any) {
       setError(err.message);
     } finally {
       setIsSubmitting(false);
     }
  };


  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isSignUp ? '创建账户' : '欢迎回来'}
      </h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* ... 表单输入框保持不变 ... */}
        <div>
          <label htmlFor="email" className={styles.label}>邮箱地址</label>
          <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
        </div>
        <div>
          <label htmlFor="password" className={styles.label}>密码</label>
          <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div>
          <button type="submit" disabled={isSubmitting} className={styles.button}>
            {isSubmitting ? '处理中...' : (isSignUp ? '注册' : '登录')}
          </button>
        </div>
      </form>

      {/* ==================== 2. 在这里添加切换链接 ==================== */}
      <div className={styles.toggleContainer}>
        {isSignUp ? (
          <p>
            已有账户？{' '}
            <Link href="/login" className={styles.toggleLink}>
              立即登录
            </Link>
          </p>
        ) : (
          <p>
            还没有账户？{' '}
            <Link href="/signup" className={styles.toggleLink}>
              免费注册
            </Link>
          </p>
        )}
      </div>
      {/* ========================================================== */}
    </div>
  );
}
// app/login/page.tsx

import AuthForm from '@/components/AuthForm';
import styles from '../PageLayout.module.css'; 

export default function LoginPage() {
  return (
    <div className={styles.container}> {/* 应用居中容器 */}
      <AuthForm isSignUp={false} />
    </div>
  );
}
// components/Sidebar.tsx
import React from 'react';
import styles from './Sidebar.module.css';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { NewPlanIcon, BudgetIcon, SettingsIcon } from './Icons'; // 假设的图标

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  list: any[]; // 计划列表
  onSelectPlan: (plan: any) => void;
}

export default function Sidebar({ isOpen, setIsOpen, list }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.navButton}>
         {/* Toggle Icon */}
         <span>{isOpen ? '‹' : '›'}</span>
      </button>

      <nav className={styles.nav}>
        <button className={styles.navButton}>
          <NewPlanIcon className={styles.navIcon} />
          {isOpen && <span className={styles.navText}>新计划</span>}
        </button>
        <button className={styles.navButton}>
          <BudgetIcon className={styles.navIcon} />
          {isOpen && <span className={styles.navText}>预算</span>}
        </button>
        <button className={styles.navButton}>
          <SettingsIcon className={styles.navIcon} />
          {isOpen && <span className={styles.navText}>偏好</span>}
        </button>
      </nav>
      
      <div className={styles.recentPlans}>
        {isOpen && <div className={styles.recentTitle}>最近计划</div>}
        <div className={styles.recentList}>
          {list.slice(0, 3).map((p) => (
            <Card key={p.id} style={{ padding: '0.75rem' }}>
              <CardHeader style={{ padding: 0 }}>
                <CardTitle style={{ fontSize: '0.875rem' }}>{p.title}</CardTitle>
              </CardHeader>
              {isOpen && (
                <CardContent style={{ padding: 0, marginTop: '0.25rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                    {p.days.length} 天 • 预算 {p.budget} 元
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </aside>
  );
}
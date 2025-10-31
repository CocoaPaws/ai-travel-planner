// components/Sidebar.tsx (持久化与交互修正版)
import Link from 'next/link';
import React from 'react';
import styles from './Sidebar.module.css';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { NewPlanIcon, BudgetIcon, SettingsIcon } from './Icons';

// 1. 更新 Props 接口，添加 isLoadingHistory
interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  list: any[];
  onSelectPlan: (plan: any) => void;
  isLoadingHistory?: boolean;
  onNewPlanClick: () => void; 
}

export default function Sidebar({ isOpen, setIsOpen, list, onSelectPlan, isLoadingHistory,onNewPlanClick  }: SidebarProps) {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      {/* 展开/收起按钮 */}
      <button onClick={() => setIsOpen(!isOpen)} className={styles.navButton}>
         {/* 在按钮内添加一些样式，使其更像一个真正的按钮 */}
         <span className={styles.toggleIcon}>{isOpen ? '‹' : '›'}</span>
         {isOpen && <span className={styles.navText}>收起</span>}
      </button>

      {/* 导航菜单 (未来可以添加点击事件) */}
      <nav className={styles.nav}>
        <button onClick={onNewPlanClick} className={styles.navButton}>
          <NewPlanIcon className={styles.navIcon} />
          {isOpen && <span className={styles.navText}>新增行程</span>}
        </button>
        {/* 2. 用 Link 组件包裹整个按钮区域 */}
        <Link href="/budget" className={styles.navLink}>
          <div className={styles.navButton}> {/* 使用 div 避免 button 的嵌套问题 */}
            <BudgetIcon className={styles.navIcon} />
            {isOpen && <span className={styles.navText}>预算管理</span>}
          </div>
        </Link>
        <button className={styles.navButton}>
          <SettingsIcon className={styles.navIcon} />
          {isOpen && <span className={styles.navText}>偏好设置</span>}
        </button>
      </nav>
      
      {/* 最近计划区域 */}
      <div className={styles.recentPlans}>
        {isOpen && <div className={styles.recentTitle}>最近计划</div>}
        
        {/* 2. 根据 isLoadingHistory 显示不同内容 */}
        {isLoadingHistory ? (
          <div className={styles.loadingText}>{isOpen ? "加载历史中..." : "..."}</div>
        ) : (
          <div className={styles.recentList}>
            {list.length > 0 ? (
              list.slice(0, 5).map((p: any) => (
                // 3. 为整个卡片区域添加 onClick 事件
                <div key={p.id} onClick={() => onSelectPlan(p)} className={styles.cardWrapper}>
                  <Card className={styles.planCard}>
                    <CardHeader style={{ padding: 0 }}>
                      <h4 className={styles.planTitleText}>{p.title}</h4>
                    </CardHeader>
                    {/* 只有在侧边栏展开时才显示详情 */}
                    {isOpen && (
                      <CardContent style={{ padding: 0, marginTop: '0.25rem' }}>
                        <div className={styles.planMetaText}>
                          {p.daily_plan?.length || 0} 天 • 预算 {p.budget || 0} 元
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              ))
            ) : (
              <div className={styles.loadingText}>{isOpen ? "暂无历史记录" : ""}</div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
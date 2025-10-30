// components/RightRail.tsx (预算开销整合版)

import React from 'react';
import styles from './RightRail.module.css';
import timelineStyles from './TripTimeline.module.css';
import { Button } from './ui/Button';
import { CurrencyYenIcon, MapPinIcon, BuildingStorefrontIcon, HomeIcon, CameraIcon, TrashIcon } from './Icons';

interface RightRailProps {
  selectedDayData: any;
  planBudget?: number;
  expenses: any[];
  onOpenExpenseDialog: () => void;
  onDeleteExpense?: (expenseId: number) => void;
}

// 小的辅助组件，根据类型返回图标
function ActivityIcon({ type }: { type: string }) {
  const iconProps = { size: 16, className: styles.activityTypeIcon };
  switch (type) {
    case '景点': return <CameraIcon {...iconProps} />;
    case '餐厅': return <BuildingStorefrontIcon {...iconProps} />;
    case '住宿': return <HomeIcon {...iconProps} />;
    default: return <MapPinIcon {...iconProps} />;
  }
}

export default function RightRail({ selectedDayData, planBudget, expenses, onOpenExpenseDialog, onDeleteExpense }: RightRailProps) {

  // 如果没有选中日的数据，则显示提示
  if (!selectedDayData) {
    return (
      <aside className={styles.rightRail}>
        <div className={styles.railTitle}>点击左侧行程卡片查看每日详情。</div>
      </aside>
    );
  }

  // --- 新的计算逻辑 ---
  const activities = selectedDayData.activities || [];
  const currentDay = selectedDayData.day;
  
  // 1. 计算当日的预估总预算
  const dailyBudgetEstimate = activities.reduce((sum: number, act: any) => sum + (act.estimated_cost || 0), 0);

  // 2. 筛选并计算当日的实际花费
  const todayExpenses = expenses.filter(exp => exp.trip_day === currentDay);
  const todaySpent = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 3. 计算进度条百分比
  let progressPercentage = 0;
  if (dailyBudgetEstimate > 0) {
    progressPercentage = Math.min((todaySpent / dailyBudgetEstimate) * 100, 100);
  }
  // --- 结束新的计算逻辑 ---

  return (
    <aside className={styles.rightRail}>
      {/* 顶部标题区域 */}
      <div className={styles.railHeader}>
        <div>
          <div className={styles.railTitle}>行程详情</div>
          <div className={`${styles.railValue} ${styles.dayTitle}`}>{`Day ${currentDay}`}</div>
        </div>
        <Button variant="outline" onClick={onOpenExpenseDialog}>
          记一笔
        </Button>
      </div>
      
      {/* 时间线展示 */}
      <div className={styles.timelineWrapper}>
        <div className={timelineStyles.activitiesContainer}>
          {activities.map((activity: any, index: number) => (
            <div key={index} className={timelineStyles.activityItem}>
              <div className={timelineStyles.activityDot}></div>
              <div className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <ActivityIcon type={activity.type} />
                  <h4 className={timelineStyles.activityLocation}>{activity.location}</h4>
                </div>
                <p className={styles.activityDescription}>{activity.description}</p>
                {activity.estimated_cost > 0 && (
                  <div className={timelineStyles.activityCost}>
                    <CurrencyYenIcon className={timelineStyles.costIcon} />
                    <span>预估花费: {activity.estimated_cost} 元</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* ================== 新的整合开销/预算模块 ================== */}
      <div className={styles.expensesContainer}>
          
        <div className={styles.expensesHeader}>
          <h4 className={styles.railTitle}>Day {currentDay} 预算追踪</h4>
        </div>

        <div className={styles.budgetStats}>
          <div className={styles.spentValueLarge}>¥{todaySpent.toFixed(2)}</div>
          <div className={styles.totalBudgetValue}>/ 预估 ¥{dailyBudgetEstimate}</div>
        </div>

        <div className={styles.progressBarContainer}>
          <div 
            className={styles.progressBarFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className={styles.expensesList}>
          {todayExpenses.length > 0 ? (
            todayExpenses.map(expense => (
              <div key={expense.id} className={styles.expenseItem}>
                <div className={styles.expenseCategoryIcon}>
                  <span>{expense.category.charAt(0)}</span>
                </div>
                <div className={styles.expenseDetails}>
                  <span className={styles.expenseDescription}>{expense.description || expense.category}</span>
                </div>
                <div className={styles.expenseAmount}>- ¥{expense.amount.toFixed(2)}</div>
                {onDeleteExpense && (
                  <button onClick={() => onDeleteExpense(expense.id)} className={styles.deleteButton}>
                    <TrashIcon size={14} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className={styles.noExpensesText}>今天还没有任何开销记录。</p>
          )}
        </div>
      </div>
      {/* ========================================================= */}
    </aside>
  );
}
// components/RightRail.tsx (功能增强版)
import React, { useState } from 'react';
import styles from './RightRail.module.css';
import timelineStyles from './TripTimeline.module.css';
import { Card, CardContent } from './ui/Card';
import { PlusIcon } from './Icons'; 
import { CurrencyYenIcon, MapPinIcon, BuildingStorefrontIcon, HomeIcon, CameraIcon } from './Icons'; // 确保导入了需要的图标

interface RightRailProps {
  selectedDayData: any;
  planBudget: number;
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

export default function RightRail({ selectedDayData, planBudget }: RightRailProps) {
  const [aiChatOpen, setAiChatOpen] = useState(false);
  if (!selectedDayData) {
    return (
      <aside className={styles.rightRail}>
        <p className={styles.railTitle}>点击左侧行程卡片查看每日详情。</p>
      </aside>
    );
  }

  // 我们需要从 AI 的 `daily_plan` 结构适配到 `selectedDayData`
  // Planner.tsx 传递的 selectedDayData 应该是 { day: 1, activities: [...] } 的结构
  // 如果不是，我们需要在这里做一次转换。假设 Planner.tsx 已经传递了正确的结构。
  const activities = selectedDayData.activities || selectedDayData.items || [];
  const dayBudget = activities.reduce((sum: number, act: any) => sum + (act.estimated_cost || 0), 0);

  return (
    <aside className={styles.rightRail}>
      {/* 顶部标题 */}
      <div>
        <div className={styles.railTitle}>行程详情</div>
        <div className={`${styles.railValue} ${styles.dayTitle}`}>{selectedDayData.title || `Day ${selectedDayData.day}`}</div>
      </div>
      
      {/* 时间线展示 (功能增强) */}
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
                {/* 小字描述 */}
                <p className={timelineStyles.activityDescription}>{activity.description}</p>
                {/* 预估花费 */}
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

      {/* 预算信息卡片 */}
      <Card>
        <CardContent style={{ paddingTop: '1rem' }}>
          <div className={styles.railTitle}>预算追踪</div>
          <p className="mt-2 text-sm">
            当日预估花费: <span className="font-semibold text-primary">¥{dayBudget}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            总预算: ¥{planBudget}
          </p>
        </CardContent>
      </Card>
    

      {/* 添加 */}
      <div className={styles.fabWrapper}>
        <button className={styles.fab} onClick={() => setAiChatOpen(true)}>
          <PlusIcon size={24} />
        </button>
        <span className={styles.fabTooltip}>新增行程</span>
      </div>
    </aside>
  );
}
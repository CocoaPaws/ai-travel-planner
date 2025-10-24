// components/TripTimeline.tsx
'use client';

import React from 'react'; // 确保导入 React
import { AiTripPlan } from '@/lib/aiService';
import { CameraIcon, HomeIcon, BuildingStorefrontIcon, MapPinIcon, CurrencyYenIcon } from '@heroicons/react/24/solid';
import styles from './TripTimeline.module.css'; // 导入我们刚刚创建的 CSS Module

// 活动图标组件 (保持不变，因为它不含样式类)
function ActivityIcon({ type }: { type: string }) {
  const iconProps = { height: 24, width: 24, color: 'white' };
  switch (type) {
    case '景点': return <CameraIcon {...iconProps} />;
    case '住宿': return <HomeIcon {...iconProps} />;
    case '餐厅': return <BuildingStorefrontIcon {...iconProps} />;
    default: return <MapPinIcon {...iconProps} />;
  }
}

interface TripTimelineProps {
  plan: AiTripPlan;
}

export default function TripTimeline({ plan }: TripTimelineProps) {
  if (!plan || !plan.daily_plan) {
    return null;
  }

  return (
    <div className={styles.timelineContainer}>
      {plan.daily_plan.map((dayPlan) => (
        <div key={dayPlan.day} className={styles.dayWrapper}>
          {/* 每日标题 */}
          <div className={styles.dayHeader}>
            <span className={styles.dayCircle}>
              {dayPlan.day}
            </span>
            <h3 className={styles.dayTitle}>Day {dayPlan.day}</h3>
          </div>

          {/* 时间线主体 */}
          <div className={styles.activitiesContainer}>
            {dayPlan.activities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                {/* 时间线上的圆点 */}
                <div className={styles.activityDot}></div>
                
                {/* 活动内容 */}
                <div className={styles.activityContent}>
                  <h4 className={styles.activityLocation}>{activity.location}</h4>
                  <p className={styles.activityDescription}>{activity.description}</p>
                  {activity.estimated_cost > 0 && (
                    <div className={styles.activityCost}>
                      <CurrencyYenIcon className={styles.costIcon} />
                      <span>{activity.estimated_cost} 元</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
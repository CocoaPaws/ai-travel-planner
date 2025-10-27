// components/MainContent.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import styles from './MainContent.module.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { CoffeeIcon, MapPinIcon } from './Icons';
import LoadingSkeleton from './LoadingSkeleton'; // 假设您已创建 LoadingSkeleton

const Map = dynamic(() => import('./Map'), { ssr: false });

// 1. 更新类型定义
interface MainContentProps {
  plan: any;
  onSave: () => void;
  onChat: () => void;
  locations: any[];
  isLoading: boolean;
  error: string | null;
}

export default function MainContent({ plan, onSave, onChat, locations, isLoading, error }: MainContentProps) {
  
  // 2. 添加条件渲染
  if (isLoading) {
    return <section className={styles.mainContent}><LoadingSkeleton /></section>;
  }

  if (error) {
    return (
      <section className={styles.mainContent}>
        <div style={{ padding: '1rem', backgroundColor: '#FFFBEB', color: '#B45309', borderRadius: '0.5rem' }}>
          <h4 style={{ fontWeight: '600' }}>生成失败</h4>
          <p>{error}</p>
        </div>
      </section>
    );
  }
  
  if (!plan) {
    return <section className={styles.mainContent}><p>请生成一个计划以查看详情。</p></section>;
  }

  const budgetData = plan.days.map((d: any, idx: number) => ({ name: `D${idx + 1}`, value: d.budget }));

  // 3. 正常渲染
  return (
    <section className={styles.mainContent}>
      {/* 地图卡片 */}
      <Card className={styles.mapCard}>
        <CardContent style={{ padding: 0, height: '100%', position: 'relative' }}>
          <Map locations={locations} />
        </CardContent>
      </Card>

      {/* 操作栏 */}
      <div className={styles.actionBar}>
        <h2 className={styles.planTitle}>{plan.title}</h2>
        <div className={styles.actionBarButtons}>
          <Button variant="outline" onClick={onSave}>保存计划</Button>
          <Button onClick={onChat}>与 AI 聊天</Button>
        </div>
      </div>

      {/* 行程列表 */}
      <div className={styles.itineraryContainer}>
        {plan.days.map((day: any, idx: number) => (
          <Card key={idx} className={styles.dayCard}>
            <div className={styles.dayHeader}>
              <div>
                <h3 className={styles.dayTitle}>{day.title}</h3>
                <div className={styles.itemsGrid}>
                  {day.items.map((item: any, i: number) => (
                    <div key={i} className={styles.item}>
                      <span className={styles.itemIcon}>
                        {item.type === "food" ? <CoffeeIcon size={14} /> : <MapPinIcon size={14} />}
                      </span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.dayMeta}>预算：¥{day.budget}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* 预算图表 */}
      <Card>
        <CardHeader>
          <CardTitle>预算概览</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={budgetData}>
                <Area type="monotone" dataKey="value" stroke="#4A90E2" fillOpacity={0.2} fill="#4A90E2" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
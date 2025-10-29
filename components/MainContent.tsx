// components/MainContent.tsx
'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import {AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import styles from './MainContent.module.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { CoffeeIcon, MapPinIcon } from './Icons';
import LoadingSkeleton from './LoadingSkeleton'; // 假设您已创建 LoadingSkeleton

const Map = dynamic(() => import('./Map'), { ssr: false });

// 1. 更新类型定义
interface MainContentProps {
  plan: any;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  onSave: () => void;
  onChat: () => void;
  locations: any[];
  isLoading: boolean;
  error: string | null;
}
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #E2E8F0',
        borderRadius: '0.5rem',
        padding: '0.5rem 0.75rem',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}>
        <p style={{ fontWeight: '600', color: '#0F172A' }}>{`第 ${label.substring(1)} 天`}</p>
        <p style={{ color: '#4A90E2' }}>{`预算: ¥${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};
export default function MainContent({ 
  plan, 
  onSave, 
  onChat, 
  locations, 
  isLoading, 
  error,
  onSelectDay,      // <--- 确保在这里解构
  selectedDayIndex  // <--- 确保在这里解构
}: MainContentProps) {
  
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

  const budgetData = plan.daily_plan.map((day: any, idx: number) => ({ name: `D${day.day}`, value: day.activities.reduce((sum: number, act: any) => sum + (act.estimated_cost || 0), 0) }));

  // 3. 正常渲染
return (
    <section className={styles.mainContent}>
      {/* 1. 固定的地图卡片 */}
      <Card className={styles.mapCard}>
        <CardContent style={{ padding: 0, height: '100%', position: 'relative' }}>
          <Map locations={locations} />
        </CardContent>
      </Card>

      {/* 2. 固定的操作栏 */}
      <div className={styles.actionBar}>
        <h2 className={styles.planTitle}>{plan.title}</h2>
        <div className={styles.actionBarButtons}>
          <Button variant="outline" onClick={onSave}>保存计划</Button>
          <Button onClick={onChat}>与 AI 聊天</Button>
        </div>
      </div>

      {/* ================== 关键修改在这里 ================== */}
      {/* 3. 新增一个 div，包裹所有需要滚动的内容 */}
      <div className={styles.scrollableContent}>

        {/* 行程列表 */}
        <div className={styles.itineraryContainer}>
          {plan.daily_plan.map((day: any, idx: number) => (
            <div key={day.day} onClick={() => onSelectDay(idx)}>
              <Card
                className={styles.dayCard}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  border: selectedDayIndex === idx ? '2px solid #4A90E2' : '1px solid #E2E8F0',
                  boxShadow: selectedDayIndex === idx ? '0 4px 12px rgba(74, 144, 226, 0.2)' : '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className={styles.dayHeader}>
                  <div className={styles.dayContent}>
                    <h3 className={styles.dayTitle}>Day {day.day}</h3>
                    <div className={styles.itemsGrid}>
                      {day.activities.map((activity: any, i: number) => (
                        <div key={i} className={styles.item}>
                          <span className={styles.itemIcon}>
                            {activity.type === "food" ? <CoffeeIcon size={14} /> : <MapPinIcon size={14} />}
                          </span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {activity.location}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.dayMeta}>
                    预算：¥{day.activities.reduce((sum: number, act: any) => sum + (act.estimated_cost || 0), 0)}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* 预算图表 */}
        <Card>
          <CardHeader>
            <CardTitle>预算概览</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 之前修复过的图表容器 */}
            <div className={styles.chartContainer}>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={budgetData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }} // 为坐标轴留出一些空间
                  >
                    {/* 1. 添加网格线，让图表更易读 */}
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    
                    {/* 2. 定义 X 轴，显示 "D1", "D2" 等标签 */}
                    <XAxis 
                      dataKey="name" 
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    
                    {/* (可选) 定义 Y 轴，显示预算范围 */}
                    <YAxis 
                      stroke="#94A3B8"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `¥${value}`} // 将数字格式化为 "¥1500"
                    />
                    
                    {/* 3. 添加 Tooltip 组件，这是核心 */}
                    <Tooltip
                      content={<CustomTooltip />} // 使用一个自定义的 Tooltip 组件来美化
                    />
                    
                    {/* 4. Area 组件保持不变 */}
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4A90E2" 
                      fillOpacity={0.2} 
                      fill="#4A90E2" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>
      {/* ====================================================== */}
    </section>
  );
}
// components/Planner.tsx (结构修正版)
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import TripTimeline from './TripTimeline';
import LoadingSkeleton from './LoadingSkeleton';
import { getAiTripPlan, TripRequest, AiTripPlan } from '@/lib/aiService';
import { MapLocation } from '@/lib/mapService';
import { SparklesIcon } from '@heroicons/react/24/outline';
import styles from './Planner.module.css'; // 导入 Planner 的样式
import formStyles from './AuthForm.module.css'; // 复用 AuthForm 的表单样式

// 动态导入 Map 组件
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-base flex items-center justify-center"><p className="text-secondary">地图加载中...</p></div>
});

// 结果展示区组件 (保持不变)
function ResultDisplay({ isLoading, error, tripPlan }: { isLoading: boolean; error: string | null; tripPlan: AiTripPlan | null; }) {
  if (isLoading) return <LoadingSkeleton />;
  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg animate-fade-in">
      <h4 className="font-bold">发生错误</h4>
      <p className="text-sm">{error}</p>
    </div>
  );
  if (tripPlan) return (
    <div className="animate-fade-in">
      <TripTimeline plan={tripPlan} />
    </div>
  );
  return (
    <div className="text-center text-secondary py-10">
      <SparklesIcon className="w-12 h-12 mx-auto text-gray-300" />
      <p className="mt-2 text-sm">您的旅行计划将在这里呈现</p>
    </div>
  );
}

export default function Planner() {
  // state 和函数逻辑 (保持不变)
  const [destination, setDestination] = useState('日本东京');
  const [days, setDays] = useState(5);
  const [budget, setBudget] = useState(10000);
  const [companion, setCompanion] = useState('带孩子的一家三口');
  const [preferences, setPreferences] = useState('喜欢宫崎骏动漫、日式拉面和购物');
  const [tripPlan, setTripPlan] = useState<AiTripPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTripPlan(null);
    const request: TripRequest = { destination, days, budget, companion, preferences };
    try {
      const plan = await getAiTripPlan(request);
      setTripPlan(plan);
    } catch (err: any) {
      setError(err.message || '发生未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  const getLocationsFromPlan = (plan: AiTripPlan | null): MapLocation[] => {
    if (!plan) return [];
    const locations: MapLocation[] = [];
    plan.daily_plan.forEach(day => {
      day.activities.forEach(activity => {
        if (activity.coordinates?.latitude && activity.coordinates?.longitude) {
          locations.push({
            name: activity.location,
            coordinates: [activity.coordinates.longitude, activity.coordinates.latitude],
          });
        }
      });
    });
    return locations;
  };

  return (
    <div className={styles.plannerContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.header}>
          <h1 className={styles.title}>旅行计划</h1>
          <p className={styles.subtitle}>告诉我们您的想法，让 AI 为您规划</p>
        </div>
        
        <form onSubmit={handleSubmit} className={`${formStyles.form} ${styles.form}`}>
          {/* 表单内容 */}
          <div>
            <label className={formStyles.label}>目的地</label>
            <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} required className={formStyles.input}/>
          </div>
          {/* ... 其他表单项也使用 formStyles ... */}
          <button type="submit" disabled={isLoading} className={formStyles.button}>
            {isLoading ? '正在规划中...' : '生成智能行程'}
          </button>
        </form>

        <div className={styles.divider}></div>

        <div className={styles.results}>
          <ResultDisplay isLoading={isLoading} error={error} tripPlan={tripPlan} />
        </div>
      </aside>

      <main className={styles.mainContent}>
        <Map locations={getLocationsFromPlan(tripPlan)} />
      </main>
    </div>
  );
}
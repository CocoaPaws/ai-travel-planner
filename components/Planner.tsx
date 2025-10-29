// components/Planner.tsx (自然语言解析版)
'use client';

import React, { useState, useEffect , useMemo} from 'react';

// 布局和 UI 组件
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightRail from './RightRail';
import { Dialog } from './ui/Dialog';
import NewPlanForm from './NewPlanForm';
import type { NewPlanRequest } from './NewPlanForm'; // 导入新的接口
import styles from './Planner.module.css';
import rightRailStyles from './RightRail.module.css';

// 图标、服务和类型定义
import { PlusIcon } from './Icons';
import { createSupabaseBrowserClient } from '@/lib/utils';
import { getAiTripPlan, TripRequest, AiTripPlan } from '@/lib/aiService';
import { MapLocation } from '@/lib/mapService';

export default function Planner() {
  // === 核心状态管理 ===
  const [plan, setPlan] = useState<AiTripPlan | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // === 数据加载 Effect ===
  useEffect(() => {
    const fetchTripHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: trips, error } = await supabase
            .from('trips')
            .select('id, created_at, generated_plan')
            .order('created_at', { ascending: false })
            .limit(10);
          if (error) throw error;
          if (trips) {
            const historyList = trips.map(trip => ({
              ...(trip.generated_plan as AiTripPlan),
              id: trip.id,
            }));
            setList(historyList);
           if (historyList.length > 0) {
              setPlan(historyList[0]);
            }
          }
        }
      } catch (error) {
        console.error("获取行程历史失败:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchTripHistory();
  }, []);

  // === 核心功能函数 ===

  // 1. 现在只有一个 handleGenerate 函数，它接收来自 NewPlanForm 的请求对象
  const handleGenerate = async (requestData: NewPlanRequest) => {
    setIsNewPlanOpen(false); // 关闭弹窗
    if (!requestData.mainQuery.trim()) return;

    setIsLoading(true);
    setError(null);
    //setPlan(null);

    // 2. 将主查询和偏好标签合并成一个完整的文本字符串
    const fullPreferences = requestData.preferences.join(', ');
    const fullRequestText = fullPreferences 
      ? `${requestData.mainQuery}, 偏好: ${fullPreferences}` 
      : requestData.mainQuery;
    
    // 3. 构建发送给后端代理的请求体，只包含一个字段
    const requestForAI: TripRequest = {
      destination: fullRequestText,
      days: 0, budget: 0, companion: '', preferences: '', // 其他字段留空
    };

    try {
      console.log("正在向 AI 服务发送自然语言请求...", requestForAI);
      const newPlanData = await getAiTripPlan(requestForAI);
      console.log("成功从 AI 服务接收到数据:", newPlanData);

      // 4. 为新计划补充前端需要的元数据
      const fullPlan = {
        ...newPlanData,
        id: `plan_${Date.now()}`,
        title: `${requestData.mainQuery.slice(0, 15)}...`,
        budget: newPlanData.daily_plan.reduce((total, day) => total + day.activities.reduce((sum, act) => sum + (act.estimated_cost || 0), 0), 0),
        generatedFrom: fullRequestText,
      };

      setPlan(fullPlan);
      setList((currentList) => [fullPlan, ...currentList]);
      setSelectedDayIndex(0);

    } catch (err: any) {
      setError(err.message || 'AI 生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async () => {
    if (!plan) return alert("没有可保存的行程。");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alert("请先登录再保存行程。");

      const tripData = {
        destination: plan.title?.split(' - ')[0],
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setDate(new Date().getDate() + (plan.daily_plan?.length || 0))).toISOString(),
        budget: plan.budget,
        preferences_text: plan.generatedFrom,
        generated_plan: plan,
      };
      
      const { error } = await supabase.from('trips').insert([tripData]);
      if (error) throw error;
      alert("行程已成功保存到云端！");
    } catch (error: any) {
      alert(`保存失败: ${error.message}`);
    }
  };

const getLocationsFromPlan = (currentPlan: AiTripPlan | null, dayIndex: number): MapLocation[] => {
  // 1. 检查计划和选中的日期是否存在
  if (!currentPlan?.daily_plan || !currentPlan.daily_plan[dayIndex]) {
    return [];
  }

  // 2. 只获取选中那一天的 "activities"
  const selectedDayActivities = currentPlan.daily_plan[dayIndex].activities;
  
  // 3. 从当天的活动中提取有坐标的地点
  const locations: MapLocation[] = selectedDayActivities
    .filter(activity => activity.coordinates) // 过滤掉没有坐标的活动
    .map(activity => ({
      name: activity.location,
      coordinates: [activity.coordinates!.longitude, activity.coordinates!.latitude],
    }));
    
  return locations;
};
  
  const openChat = () => alert("打开 AI 聊天窗口（模拟）。");

  // 在 return 语句之前，添加 useMemo
  const locationsForMap = useMemo(() => {
    console.log("Planner: Memoizing locations. plan 或 selectedDayIndex 已改变。");
    return getLocationsFromPlan(plan, selectedDayIndex);
  }, [plan, selectedDayIndex]); 

  return (
    <div className={styles.appContainer}>
      <div className={styles.mainWrapper}>
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          list={list}
          isLoadingHistory={isLoadingHistory}
          onSelectPlan={(selectedPlan) => {
            setPlan({ ...selectedPlan }); 
            setSelectedDayIndex(0);
          }}
        />
        <div className={styles.contentArea}>
          <MainContent 
            locations={locationsForMap}
            plan={plan}
            selectedDayIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
            onSave={savePlan}
            onChat={openChat}
            //locations={getLocationsFromPlan(plan, selectedDayIndex)}
            isLoading={isLoading}
            error={error}
          />
          <RightRail 
            selectedDayData={plan?.daily_plan?.[selectedDayIndex]}
            planBudget={plan?.budget || 0}
          />
        </div>
      </div>

      {/* FAB 按钮和弹窗 */}
      <div className={rightRailStyles.fabWrapper} onClick={() => setIsNewPlanOpen(true)}>
        <button className={rightRailStyles.fab}>
          <PlusIcon size={24} />
        </button>
        <span className={rightRailStyles.fabTooltip}>新增行程</span>
      </div>

      <Dialog open={isNewPlanOpen} onOpenChange={setIsNewPlanOpen}>
        <NewPlanForm 
          onGenerate={handleGenerate} // 直接传递新的 handleGenerate
          onClose={() => setIsNewPlanOpen(false)}
        />
      </Dialog>
    </div>
  );
}
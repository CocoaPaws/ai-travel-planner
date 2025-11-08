// components/Planner.tsx (最终整合版)
'use client';

import React, { useState, useEffect, useMemo } from 'react';

// 布局和 UI 组件
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightRail from './RightRail';
import { Dialog } from './ui/Dialog';
import NewPlanForm from './NewPlanForm';
import type { NewPlanRequest } from './NewPlanForm';
import ExpenseForm from './ExpenseForm';
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
  const [expenses, setExpenses] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // AI 生成的加载状态
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isNewPlanOpen, setIsNewPlanOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true); // 新增：历史记录的加载状态
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  // === 数据加载 Effect ===
// components/Planner.tsx -> useEffect

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingHistory(true);
      setError(null); // 在开始获取前，清空旧的错误信息
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        // 如果用户未登录，则直接结束
        if (!user) {
          setIsLoadingHistory(false);
          return; 
        }

        // --- 1. 获取行程历史 ---
        const { data: trips, error: tripsError } = await supabase
          .from('trips')
          .select('id, created_at, generated_plan')
          .order('created_at', { ascending: false })
          .limit(10);

        // 明确地处理 trips 查询的错误
        if (tripsError) {
          // 不要直接 throw，而是构造一个更明确的错误
          throw new Error(`获取行程失败: ${tripsError.message}`);
        }
        
        // 如果没有行程，则设置为空状态并结束
        if (!trips || trips.length === 0) {
          console.log("用户没有任何历史行程。");
          setList([]);
          setPlan(null);
          setExpenses([]);
          setIsLoadingHistory(false);
          return;
        }

        // --- 2. 处理获取到的行程数据 ---
        const historyList = trips.map(trip => ({
          ...(trip.generated_plan as AiTripPlan),
          id: trip.id,
        }));
        setList(historyList);
        
        const latestPlan = historyList[0];
        setPlan(latestPlan);

        // --- 3. 获取最新行程的开销 ---
        // (我们复用之前创建的 fetchExpensesForTrip 函数，避免代码重复)
        if (latestPlan.id) {
          await fetchExpensesForTrip(latestPlan.id);
        } else {
          setExpenses([]); // 如果最新计划没有ID，清空开销
        }

      } catch (error: any) {
        // 4. 更明确的错误日志
        console.error("获取初始数据时发生错误:", error);
        setError("加载历史数据失败，请刷新页面重试。"); // 在UI上显示一个友好的错误信息
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchData();
  }, []); // 依赖项保持为空

  // === 核心功能函数 ===
  const handleGenerate = async (requestData: NewPlanRequest) => {
    setIsNewPlanOpen(false);
    if (!requestData.mainQuery.trim()) return;
    setIsLoading(true);
    setError(null);
    setPlan(null); // 清空旧计划以触发加载状态

    const fullPreferences = requestData.preferences.join(', ');
    const fullRequestText = fullPreferences 
      ? `${requestData.mainQuery}, 偏好: ${fullPreferences}` 
      : requestData.mainQuery;
    
    const requestForAI: TripRequest = {
      destination: fullRequestText,
      days: 0, budget: 0, companion: '', preferences: '',
    };

    try {
      const newPlanData = await getAiTripPlan(requestForAI);
      const fullPlan = {
        ...newPlanData,
        id: `plan_${Date.now()}`, // 这是一个临时 ID
        title: `${requestData.mainQuery.slice(0,30)}...`,
        //budget: newPlanData.daily_plan.reduce((total, day) => total + day.activities.reduce((sum, act) => sum + (act.estimated_cost || 0), 0), 0),
        generatedFrom: fullRequestText,
      };
      
      setPlan(fullPlan);
      setList((currentList) => [fullPlan, ...currentList]);
      setSelectedDayIndex(0);
      setExpenses([]); // 新计划开始时清空开销

    } catch (err: any) {
      setError(err.message || 'AI 生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  const savePlan = async () => {
    if (!plan) {
      alert("没有可保存的行程。");
      return;
    }

    // 1. 检查 plan.id 的类型，防止重复保存
    if (typeof plan.id === 'number') {
      alert("✓ 计划已在云端，无需重复保存。");
      return; // 提前终止函数
    }

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("请先登录再保存行程。");
        return;
      }

      // 准备要插入数据库的数据 (与您之前的代码一致)
      const tripData = {
        destination: plan.title?.split(' - ')[0],
        start_date: new Date().toISOString(),
        end_date: new Date(new Date().setDate(new Date().getDate() + (plan.daily_plan?.length || 0))).toISOString(),
        budget: plan.budget, // 确保您的 trips 表有 budget 列
        preferences_text: plan.generatedFrom,
        generated_plan: plan,
      };
      
      // ================== 核心修改在这里 ==================
      // 2. 在 insert 后面链式调用 .select() 和 .single()
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()   // <-- 这会返回刚刚被插入的数据行
        .single();  // <-- 这会将结果从数组 [ {..} ] 转换为对象 {..}

      if (error) throw error;
      if (!data) throw new Error("保存后未能从数据库返回行程数据");
      
      console.log("保存成功，并从数据库返回了新数据:", data);

      // 3. 用返回的、带有真实 ID 的数据，更新前端的 plan state
      const newlySavedPlan = {
        ...(data.generated_plan as AiTripPlan),
        id: data.id, // 使用从数据库返回的真实 ID
      };
      setPlan(newlySavedPlan);

      // 4. (推荐) 同步更新左侧历史记录列表中的对应项
      setList(currentList => {
        const newList = [...currentList];
        // 找到列表中具有旧的临时 ID 的那一项
        const indexToUpdate = newList.findIndex(p => p.id === plan.id); 
        if (indexToUpdate !== -1) {
          // 用带有真实 ID 的新数据替换它
          newList[indexToUpdate] = newlySavedPlan; 
        }
        return newList;
      });
      // ======================================================

      alert("行程已成功保存到云端！现在可以为它记账了。");

    } catch (error: any) {
      console.error("保存行程失败:", error);
      alert(`保存失败: ${error.message}`);
    } finally {
      setIsSaving(false); // <--- 在 finally 中设置为 false
    }
  };

  const handleSaveExpense = async (expense: any) => {
    if (!plan?.id || typeof plan.id !== 'number') {
      alert("请先将当前行程保存到云端，才能记录开销。");
      // await savePlan(); // (可选) 尝试自动保存
      // 注意：自动保存后，plan.id 仍是临时的，需要重新获取才能关联
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      const expenseData = { ...expense, trip_id: plan.id };
      const { data, error } = await supabase.from('expenses').insert([expenseData]).select();
      if (error) throw error;
      if (data) {
        setExpenses(currentExpenses => [...currentExpenses, data[0]]);
      }
    } catch (error) {
      console.error("保存开销失败:", error);
    }
  };

  const getLocationsFromPlan = (currentPlan: AiTripPlan | null, dayIndex: number): MapLocation[] => {
    if (!currentPlan?.daily_plan || !currentPlan.daily_plan[dayIndex]) return [];
    const selectedDayActivities = currentPlan.daily_plan[dayIndex].activities;
    return selectedDayActivities
      .filter(activity => activity.coordinates)
      .map(activity => ({
        name: activity.location,
        coordinates: [activity.coordinates!.longitude, activity.coordinates!.latitude],
      }));
  };
  
  const openChat = () => alert("打开 AI 聊天窗口（模拟）。");

  const locationsForMap = useMemo(() => {
    return getLocationsFromPlan(plan, selectedDayIndex);
  }, [plan, selectedDayIndex]); 

    const fetchExpensesForTrip = async (tripId: number | string) => {
    if (!tripId || typeof tripId !== 'number') {
      // 如果是临时的 plan_... ID，则没有开销
      setExpenses([]);
      return;
    }

    console.log(`正在为行程 ID: ${tripId} 获取开销...`);
    setIsLoadingExpenses(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', tripId) // 使用传入的 tripId 进行查询
        .order('created_at', { ascending: true }); // 按时间正序排列

      if (error) throw error;
      
      console.log(`获取到 ${data?.length || 0} 条开销记录`);
      setExpenses(data || []);
    } catch (error) {
      console.error("获取开销数据失败:", error);
      setExpenses([]); // 出错时清空
    } finally {
      setIsLoadingExpenses(false);
    }
  };

  return (
    <div className={styles.appContainer}>
      <div className={styles.mainWrapper}>
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          list={list}
          isLoadingHistory={isLoadingHistory}
          onSelectPlan={async (selectedPlan) => {
            console.log("切换到计划:", selectedPlan.title);
            setPlan({ ...selectedPlan }); 
            setSelectedDayIndex(0);
        // 2. 不再是简单清空，而是调用 fetch 函数加载新的开销
            if (selectedPlan.id) {
              await fetchExpensesForTrip(selectedPlan.id);
            } else {
              // 如果选中的计划没有 ID (不太可能发生)，则清空
              setExpenses([]);
            }
          }}
          // 关键改动：将打开“新计划”弹窗的函数传递给 Sidebar
          onNewPlanClick={() => setIsNewPlanOpen(true)}
        />
        <div className={styles.contentArea}>
          <MainContent 
            plan={plan}
            selectedDayIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
            isSaving={isSaving} 
            onSave={savePlan}
            onChat={openChat}
            locations={locationsForMap}
            isLoading={isLoading}
            error={error}
          />
          <RightRail 
            selectedDayData={plan?.daily_plan?.[selectedDayIndex]}
            planBudget={
              plan?.daily_plan?.reduce((total, day) => 
                total + day.activities.reduce((sum, act) => sum + (act.estimated_cost || 0), 0)
              , 0) || 0
            }
            expenses={expenses}
            onOpenExpenseDialog={() => setIsExpenseDialogOpen(true)}
          />
        </div>
      </div>

      {/* 
        FAB 按钮的 JSX 已被移除。
        下面的 Dialog 组件现在由 Sidebar 中的按钮控制。
      */}
      <Dialog open={isNewPlanOpen} onOpenChange={setIsNewPlanOpen}>
        <NewPlanForm 
          onGenerate={handleGenerate}
          onClose={() => setIsNewPlanOpen(false)}
        />
      </Dialog>
      
      {/* 记账弹窗 (保持不变) */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <ExpenseForm 
          day={plan?.daily_plan?.[selectedDayIndex]?.day || selectedDayIndex + 1}
          onClose={() => setIsExpenseDialogOpen(false)}
          onSave={handleSaveExpense}
        />
      </Dialog>
    </div>
  );
}
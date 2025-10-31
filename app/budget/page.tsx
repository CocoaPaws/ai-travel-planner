// app/budget/page.tsx
'use client';

import React from 'react'; // 确保 React 的导入是正确的
import { useState, useEffect } from 'react'; // 确保 hooks 的导入是正确的
import { createSupabaseBrowserClient } from '@/lib/utils';
import TripExpensesCard from './TripExpensesCard';
import styles from './BudgetPage.module.css';
import { EditIcon } from '@/components/Icons';
// 定义我们将要获取的数据的 TypeScript 类型，增强代码健壮性
interface Expense {
  id: number;
  amount: number;
  category: string;
  description: string;
  trip_day: number;
}

interface TripWithExpenses {
  id: number;
  title: string;
  created_at: string;
  expenses: Expense[];
}

export default function BudgetPage() {
  // --- State 管理 ---
  const [tripsWithExpenses, setTripsWithExpenses] = useState<TripWithExpenses[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);
  // --- 数据获取 Effect ---
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setError("请先登录以查看预算信息。");
          return;
        }

        // 使用 JOIN 查询一次性获取所有行程及其关联的所有开销
        const { data, error: fetchError } = await supabase
          .from('trips')
          .select(`
            id,
            title:generated_plan->>title,
            created_at,
            expenses (
              id,
              amount,
              category,
              description,
              trip_day
            )
          `)
          .order('created_at', { ascending: false }); // 最新的行程在最前面

        if (fetchError) {
          throw fetchError;
        }

        console.log("获取到的所有行程及开销:", data);
        if (data) {
          setTripsWithExpenses(data);
        }

      } catch (err: any) {
        console.error("获取预算数据失败:", err);
        setError("加载数据失败，请稍后重试。");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []); // 空依赖数组 `[]` 确保这个 effect 只在组件首次挂载时运行一次

  // --- 渲染逻辑 ---

  // 1. 处理加载状态
  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>预算管理中心</h1>
        <p className={styles.loadingText}>正在加载预算数据...</p>
      </div>
    );
  }

  // 2. 处理错误状态
  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>预算管理中心</h1>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

    // ================== 1. 创建删除处理函数 ==================
  const handleDeleteExpense = async (expenseIdToDelete: number, tripId: number) => {
    // a. 弹出确认框
    if (!window.confirm("您确定要删除这条开销记录吗？此操作无法撤销。")) {
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();
      
      // b. 调用 Supabase API 删除数据
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseIdToDelete);

      if (error) throw error;

      // c. 实时更新前端 UI，无需刷新
      setTripsWithExpenses(currentTrips => {
        // 创建一个深拷贝以避免直接修改 state
        const updatedTrips = JSON.parse(JSON.stringify(currentTrips));
        // 找到对应的行程
        const targetTrip = updatedTrips.find((t: TripWithExpenses) => t.id === tripId);
        if (targetTrip) {
          // 从该行程的 expenses 数组中过滤掉被删除的项
          targetTrip.expenses = targetTrip.expenses.filter((exp: Expense) => exp.id !== expenseIdToDelete);
        }
        return updatedTrips;
      });
      
      console.log(`成功删除开销 ID: ${expenseIdToDelete}`);

    } catch (error: any) {
      console.error("删除开销失败:", error);
      alert(`删除失败: ${error.message}`);
    }
  };
  // ================== 2. 创建更新处理函数 ==================
  const handleUpdateExpense = async (updatedExpense: Expense) => {
    if (!updatedExpense.id) return;

    try {
      const supabase = createSupabaseBrowserClient();
      
      // a. 准备要更新的数据 (不包括 id 和 created_at 等)
      const { id, ...dataToUpdate } = updatedExpense;

      // b. 调用 Supabase API 更新数据，并使用 .select() 返回更新后的行
      const { data, error } = await supabase
        .from('expenses')
        .update(dataToUpdate)
        .eq('id', id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("更新后未能返回数据");

      const returnedExpense = data[0];

      // c. 实时更新前端 UI
      setTripsWithExpenses(currentTrips => {
        const updatedTrips = JSON.parse(JSON.stringify(currentTrips));
        // 遍历所有行程和开销，找到并替换被更新的那一项
        for (const trip of updatedTrips) {
          const expenseIndex = trip.expenses.findIndex((exp: Expense) => exp.id === returnedExpense.id);
          if (expenseIndex !== -1) {
            trip.expenses[expenseIndex] = returnedExpense;
            break; // 找到后即可跳出循环
          }
        }
        return updatedTrips;
      });

      // d. 退出编辑模式
      setEditingExpenseId(null);
      console.log("成功更新开销:", returnedExpense);

    } catch (error: any) {
      console.error("更新开销失败:", error);
      alert(`更新失败: ${error.message}`);
    }
  };
  // ==========================================================
  // 3. 正常渲染
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>我的预算管理</h1>
      
      <div className={styles.tripsList}>
        {tripsWithExpenses.length > 0 ? (
          // 遍历数据，为每个行程渲染一个 TripExpensesCard
          tripsWithExpenses.map(trip => (
            <TripExpensesCard key={trip.id} trip={trip} 
                onDeleteExpense={handleDeleteExpense}
                editingExpenseId={editingExpenseId}
                onSetEditingExpenseId={setEditingExpenseId}
                onUpdateExpense={handleUpdateExpense}
            />
          ))
        ) : (
          // 如果没有任何行程数据
          <div className={styles.noRecordText} style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>您还没有任何行程记录</h2>
            <p style={{ marginTop: '0.5rem' }}>点击左侧“我的行程”按钮，开始创建您的第一个AI旅行计划吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
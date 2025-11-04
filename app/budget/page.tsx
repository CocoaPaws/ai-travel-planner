'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/utils';
import TripExpensesCard from './TripExpensesCard';
import styles from './BudgetPage.module.css';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
} from 'recharts';

interface TripLite {
  id: number;
  title: string;
  created_at: string;
}

interface Expense {
  id: number;
  trip_id: number;
  trip_day: number;
  category: string | null;
  description: string | null;
  amount: number;
  created_at: string;
}

interface TripWithExpenses extends TripLite {
  expenses: Expense[];
}

const COLORS = ['#60a5fa', '#34d399', '#facc15', '#f87171', '#a78bfa', '#14b8a6', '#f472b6', '#fb7185'];

export default function BudgetPage() {
  const supabase = createSupabaseBrowserClient();
  const [trips, setTrips] = useState<TripLite[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<TripWithExpenses | null>(null);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null);

  // 加载行程列表
  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoadingTrips(true);
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return setError('请先登录以查看预算信息。');
        const { data, error: tripsErr } = await supabase
          .from('trips')
          .select('id, created_at, generated_plan')
          .order('created_at', { ascending: false });
        if (tripsErr) throw tripsErr;
        const normalized = (data || []).map((t: any) => ({
          id: t.id,
          created_at: t.created_at,
          title: (t.generated_plan?.title ?? t.generated_plan?.['title']) || '未命名行程',
        }));
        setTrips(normalized);
        if (normalized.length > 0) setSelectedTripId(normalized[0].id);
      } catch (e: any) {
        setError('加载行程失败，请稍后重试。');
      } finally {
        setLoadingTrips(false);
      }
    };
    loadTrips();
  }, []);

  // 加载对应行程的支出
  useEffect(() => {
    const loadExpensesForTrip = async (tripId: number) => {
      try {
        setLoadingExpenses(true);
        const tripInfo = trips.find(t => t.id === tripId);
        if (!tripInfo) return;
        const { data: expenses, error: expErr } = await supabase
          .from('expenses')
          .select('id, trip_id, trip_day, category, description, amount, created_at')
          .eq('trip_id', tripId)
          .order('trip_day', { ascending: true })
          .order('created_at', { ascending: true });
        if (expErr) throw expErr;
        setSelectedTrip({ ...tripInfo, expenses: expenses || [] });
      } catch (e: any) {
        setError('加载费用失败，请稍后重试。');
      } finally {
        setLoadingExpenses(false);
      }
    };
    if (selectedTripId != null) loadExpensesForTrip(selectedTripId);
  }, [selectedTripId, trips]);

  const totalSpent = useMemo(() => selectedTrip?.expenses.reduce((s, e) => s + Number(e.amount || 0), 0) || 0, [selectedTrip]);
  const dailyTotals = useMemo(() => {
    if (!selectedTrip) return [];
    const byDay = new Map<number, number>();
    for (const e of selectedTrip.expenses) {
      const day = e.trip_day || 0;
      byDay.set(day, (byDay.get(day) || 0) + Number(e.amount || 0));
    }
    return Array.from(byDay.entries()).sort((a, b) => a[0] - b[0]).map(([day, total]) => ({ day: `Day ${day}`, total }));
  }, [selectedTrip]);
  const avgPerDay = useMemo(() => dailyTotals.length ? totalSpent / dailyTotals.length : 0, [totalSpent, dailyTotals]);
  const maxPerDay = useMemo(() => dailyTotals.length ? Math.max(...dailyTotals.map(d => d.total)) : 0, [dailyTotals]);
  const pieData = useMemo(() => {
    if (!selectedTrip) return [];
    const byCat = new Map<string, number>();
    selectedTrip.expenses.forEach(e => {
      const key = (e.category || '其他').trim();
      byCat.set(key, (byCat.get(key) || 0) + Number(e.amount || 0));
    });
    return Array.from(byCat.entries()).map(([name, value]) => ({ name, value }));
  }, [selectedTrip]);

  const handleUpdateExpense = async (updatedExpense: Expense) => {
    const { id, ...rest } = updatedExpense;
    const { data, error: err } = await supabase.from('expenses').update(rest).eq('id', id).select();
    if (err) return alert('更新失败');
    setSelectedTrip(prev => prev ? { ...prev, expenses: prev.expenses.map(e => e.id === id ? data[0] : e) } : prev);
    setEditingExpenseId(null);
  };

  const handleDeleteExpense = async (expenseId: number) => {
    if (!confirm('确认删除？')) return;
    const { error: err } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (err) return alert('删除失败');
    setSelectedTrip(prev => prev ? { ...prev, expenses: prev.expenses.filter(e => e.id !== expenseId) } : prev);
  };

  if (loadingTrips) return <div className={styles.pageContainer}>加载中...</div>;
  if (error) return <div className={styles.pageContainer}>{error}</div>;

  return (
    <div className={styles.pageContainer}>
      {/* 顶部：行程选择 */}
      <div className={styles.header}>
        <h1 className="text-2xl font-semibold">预算管理</h1>
        <select value={selectedTripId ?? ''} onChange={(e) => setSelectedTripId(Number(e.target.value))} className={styles.select}>
          {trips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
      </div>

      {/* 主体 */}
      <div className={styles.mainGrid}>
        {/* 左栏 */}
        <div className={`${styles.leftCol} ${styles.scrollbar}`}>
          {loadingExpenses ? <p>加载中...</p> : selectedTrip &&
            <TripExpensesCard
              trip={selectedTrip}
              editingExpenseId={editingExpenseId}
              onSetEditingExpenseId={setEditingExpenseId}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={(id) => handleDeleteExpense(id)}
            />}
        </div>

        {/* 右栏 */}
        <div className={styles.rightCol}>
          {/* 顶部统计卡 */}
          <div className={`${styles.statGrid} ${styles.fadeIn}`}>
            <div className={`${styles.statCard} ${styles.fadeDelay1}`}>
              <div className={styles.statLabel}>总支出</div>
              <div className={styles.statValue} style={{ color: '#ef4444' }}>¥{totalSpent.toFixed(2)}</div>
            </div>
            <div className={`${styles.statCard} ${styles.fadeDelay2}`}>
              <div className={styles.statLabel}>平均每日</div>
              <div className={styles.statValue} style={{ color: '#2563eb' }}>¥{avgPerDay.toFixed(2)}</div>
            </div>
            <div className={`${styles.statCard} ${styles.fadeDelay3}`}>
              <div className={styles.statLabel}>最高单日</div>
              <div className={styles.statValue} style={{ color: '#10b981' }}>¥{maxPerDay.toFixed(2)}</div>
            </div>
          </div>

          {/* 分类支出饼图 */}
          <div className={`${styles.cardShadow} ${styles.fadeIn} ${styles.fadeDelay1}`}>
            <div className="p-4 border-b border-slate-200/70">
              <div className="font-semibold">分类支出占比</div>
            </div>
            <div className="p-4" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                    {pieData.map((_, i) => (
                      <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 每日支出趋势 */}
          <div className={`${styles.cardShadow} ${styles.fadeIn} ${styles.fadeDelay2}`}>
            <div className="p-4 border-b border-slate-200/70">
              <div className="font-semibold">每日支出趋势</div>
            </div>
            <div className="p-4" style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyTotals}>
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="total" fill="#60a5fa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

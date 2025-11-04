import React, { useMemo } from 'react';
import styles from './BudgetPage.module.css';
import ExpenseRow from './ExpenseRow';

interface Expense {
  id: number;
  trip_id: number;
  trip_day: number;
  category: string | null;
  description: string | null;
  amount: number;
  created_at: string;
}

interface TripWithExpenses {
  id: number;
  title: string;
  created_at: string;
  expenses: Expense[];
}

interface TripExpensesCardProps {
  trip: TripWithExpenses;
  editingExpenseId: number | null;
  onSetEditingExpenseId: (id: number | null) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: number) => void;
}

const groupByDay = (expenses: Expense[]) => {
  return expenses.reduce((acc: Record<number, Expense[]>, e) => {
    const d = e.trip_day || 0;
    (acc[d] ||= []).push(e);
    return acc;
  }, {});
};

export default function TripExpensesCard({
  trip,
  editingExpenseId,
  onSetEditingExpenseId,
  onUpdateExpense,
  onDeleteExpense,
}: TripExpensesCardProps) {
  const grouped = useMemo(() => groupByDay(trip.expenses), [trip.expenses]);
  const totalTrip = useMemo(
    () => trip.expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [trip.expenses]
  );

  return (
    <div className={`${styles.tripCard} ${styles.fadeIn}`}>
      <div className={styles.tripHeader}>
        <div>
          <div className={styles.tripTitle}>{trip.title}</div>
          <div className={styles.tripMeta}>创建时间：{new Date(trip.created_at).toLocaleString()}</div>
        </div>
        <div className={styles.tripTotal}>总花费：¥{totalTrip.toFixed(2)}</div>
      </div>

      <div className={styles.tripContent}>
        {trip.expenses.length === 0 ? (
          <p className={styles.noRecordText}>本行程暂无开销记录</p>
        ) : (
          Object.entries(grouped)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, items], idx) => {
              const dayTotal = items.reduce((s, e) => s + Number(e.amount || 0), 0);
              const percent = totalTrip > 0 ? (dayTotal / totalTrip) * 100 : 0;

              return (
                <div key={day} className={`${styles.fadeIn} ${idx % 3 === 0 ? styles.fadeDelay1 : idx % 3 === 1 ? styles.fadeDelay2 : styles.fadeDelay3}`}>
                  {/* Day 头部 + 进度条 */}
                  <div className={styles.dayHeader}>
                    <h3 className={styles.dayTitle}>Day {day}</h3>
                    <div className={styles.dayMeta}>
                      {items.length} 笔 · 当日合计 <span className="font-semibold">¥{dayTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${percent}%` }} />
                  </div>

                  {/* 时间线列表 */}
                  <div className={`${styles.expensesList} ${styles.scrollbar}`}>
                    {items.map((expense, i) => (
                      <ExpenseRow
                        key={expense.id}
                        expense={expense}
                        isEditing={editingExpenseId === expense.id}
                        onSetEditing={onSetEditingExpenseId}
                        onUpdate={onUpdateExpense}
                        onDelete={() => onDeleteExpense(expense.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}

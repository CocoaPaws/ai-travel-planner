// app/budget/TripExpensesCard.tsx (编辑功能版)

import React from 'react';
import styles from './BudgetPage.module.css';
import ExpenseRow from './ExpenseRow'; // 1. 导入新的行组件

// 2. 类型定义保持清晰
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

// 3. 更新 Props 接口，接收所有与编辑相关的 state 和函数
interface TripExpensesCardProps {
  trip: TripWithExpenses;
  editingExpenseId: number | null;
  onSetEditingExpenseId: (id: number | null) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: number, tripId: number) => void;
}

// groupExpensesByDay 函数 (保持不变)
const groupExpensesByDay = (expenses: Expense[]): { [key: number]: Expense[] } => {
  return expenses.reduce((acc, expense) => {
    const day = expense.trip_day;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(expense);
    return acc;
  }, {} as { [key: number]: Expense[] });
};


export default function TripExpensesCard({ 
  trip, 
  editingExpenseId, 
  onSetEditingExpenseId, 
  onUpdateExpense, 
  onDeleteExpense 
}: TripExpensesCardProps) {

  const groupedExpenses = groupExpensesByDay(trip.expenses);
  const totalTripSpent = trip.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className={styles.tripCard}>
      <div className={styles.tripHeader}>
        <h2 className={styles.tripTitle}>{trip.title}</h2>
        <div className={styles.tripTotal}>总花费: ¥{totalTripSpent.toFixed(2)}</div>
      </div>
      
      <div className={styles.tripContent}>
        {trip.expenses.length > 0 ? (
          Object.entries(groupedExpenses)
            .sort(([dayA], [dayB]) => parseInt(dayA) - parseInt(dayB))
            .map(([day, expensesOnDay]) => (
              <div key={day}>
                <h3 className={styles.dayTitle}>Day {day}</h3>
                <div className={styles.expensesList}>
                  {expensesOnDay.map(expense => (
                    // 4. 使用新的 ExpenseRow 组件来渲染每一行
                    <ExpenseRow 
                      key={expense.id}
                      expense={expense}
                      // 判断当前行是否正在被编辑
                      isEditing={editingExpenseId === expense.id}
                      // 将所有操作函数“透传”给子组件
                      onSetEditing={onSetEditingExpenseId}
                      onUpdate={onUpdateExpense}
                      onDelete={() => onDeleteExpense(expense.id, trip.id)}
                    />
                  ))}
                </div>
              </div>
            ))
        ) : (
          <p className={styles.noRecordText}>本行程暂无开销记录</p>
        )}
      </div>
    </div>
  );
}
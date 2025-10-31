// app/budget/ExpenseRow.tsx
'use client';
import React, { useState, useEffect } from 'react';
import styles from './BudgetPage.module.css';
import { TrashIcon, EditIcon, SaveIcon, CancelIcon } from '@/components/Icons';

// 定义 props 类型
interface ExpenseRowProps {
  expense: any;
  isEditing: boolean;
  onSetEditing: (id: number | null) => void;
  onUpdate: (expense: any) => void;
  onDelete: () => void;
}

export default function ExpenseRow({ expense, isEditing, onSetEditing, onUpdate, onDelete }: ExpenseRowProps) {
  const [editedExpense, setEditedExpense] = useState(expense);

  // 当外部的 isEditing prop 变化时，重置内部的编辑状态
  useEffect(() => {
    if (!isEditing) {
      setEditedExpense(expense);
    }
  }, [isEditing, expense]);

  const handleSave = () => {
    onUpdate(editedExpense);
  };
  
  // 如果当前行正在被编辑
  if (isEditing) {
    return (
      <div className={`${styles.expenseItem} ${styles.editingItem}`}>
        <input 
          value={editedExpense.category} 
          onChange={(e) => setEditedExpense({...editedExpense, category: e.target.value})}
          className={styles.editInput}
        />
        <input 
          value={editedExpense.description}
          onChange={(e) => setEditedExpense({...editedExpense, description: e.target.value})}
          className={styles.editInput}
        />
        <input 
          type="number"
          value={editedExpense.amount}
          onChange={(e) => setEditedExpense({...editedExpense, amount: parseFloat(e.target.value) || 0})}
          className={`${styles.editInput} ${styles.amountInput}`}
        />
        <div className={styles.actionButtons}>
          <button onClick={handleSave} className={styles.editButton} title="保存"><SaveIcon size={16} /></button>
          <button onClick={() => onSetEditing(null)} className={styles.editButton} title="取消"><CancelIcon size={16} /></button>
        </div>
      </div>
    );
  }
  
  // 默认的只读状态
  return (
    <div className={styles.expenseItem}>
      <span className={styles.expenseCategory}>{expense.category}</span>
      <span className={styles.expenseDescription}>{expense.description}</span>
      <span className={styles.expenseAmount}>- ¥{expense.amount.toFixed(2)}</span>
      <div className={styles.actionButtons}>
        <button onClick={() => onSetEditing(expense.id)} className={styles.editButton} title="编辑"><EditIcon size={16} /></button>
        <button onClick={onDelete} className={styles.deleteButton} title="删除"><TrashIcon size={16} /></button>
      </div>
    </div>
  );
}
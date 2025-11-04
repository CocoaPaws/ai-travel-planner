'use client';

import React, { useEffect, useState } from 'react';
import styles from './BudgetPage.module.css';
import { FiEdit2, FiTrash2,  FiCheck, FiX } from 'react-icons/fi';
interface Expense {
  id: number;
  trip_id: number;
  trip_day: number;
  category: string | null;
  description: string | null;
  amount: number;
  created_at: string;
}

interface Props {
  expense: Expense;
  isEditing: boolean;
  onSetEditing: (id: number | null) => void;
  onUpdate: (expense: Expense) => void;
  onDelete: () => void;
}

const pickEmoji = (category?: string | null, description?: string | null) => {
  const src = `${category || ''} ${description || ''}`;
  if (/餐|食|饭|美食|吃|酒/i.test(src)) return '🍜';
  if (/住|酒店|宾馆|民宿|住宿/i.test(src)) return '🏨';
  if (/购|买|购物|纪念品|商店/i.test(src)) return '🛍️';
  if (/交|车|地铁|火车|打车|交通|出租/i.test(src)) return '🚗';
  if (/门票|票|景区|入场/i.test(src)) return '🎟️';
  return '💰';
};

export default function ExpenseRow({ expense, isEditing, onSetEditing, onUpdate, onDelete }: Props) {
  const [edited, setEdited] = useState<Expense>(expense);

  useEffect(() => {
    if (!isEditing) setEdited(expense);
  }, [isEditing, expense]);

  const handleSave = () => onUpdate(edited);

  // 编辑态
  if (isEditing) {
    return (
      <div className={`${styles.expenseItem} ${styles.editingItem}`}>
        <input
          value={edited.category || ''}
          onChange={(e) => setEdited({ ...edited, category: e.target.value })}
          className={styles.editInput}
          placeholder="类别（如 餐饮/交通/门票）"
        />
        <input
          value={edited.description || ''}
          onChange={(e) => setEdited({ ...edited, description: e.target.value })}
          className={styles.editInput}
          placeholder="描述（如 午餐/地铁）"
        />
        <input
          type="number"
          value={edited.amount}
          onChange={(e) => setEdited({ ...edited, amount: parseFloat(e.target.value) || 0 })}
          className={`${styles.editInput} ${styles.amountInput}`}
          placeholder="金额"
        />
        <div className={styles.actionButtons}>
          <button onClick={handleSave} className={styles.editButton} title="保存">
            <FiCheck size={16} />
          </button>
          <button onClick={() => onSetEditing(null)} className={styles.editButton} title="取消">
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 只读态
  return (
    <div className={styles.expenseItem}>
      <span className={styles.expenseCategory}>
        <span style={{ marginRight: 6 }}>{pickEmoji(expense.category, expense.description)}</span>
        {expense.category || '未分类'}
      </span>
      <span className={styles.expenseDescription}>{expense.description || '—'}</span>
      <span className={styles.expenseAmount}>- ¥{Number(expense.amount).toFixed(2)}</span>
      <div className={styles.actionButtons}>
        <button onClick={() => onSetEditing(expense.id)} className={styles.editButton} title="编辑">
          <FiEdit2 size={16} />
        </button>
        <button onClick={onDelete} className={styles.deleteButton} title="删除">
          <FiTrash2 size={16} />
        </button>
      </div>
    </div>
  );
}

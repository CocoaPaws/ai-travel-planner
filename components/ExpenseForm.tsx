// components/ExpenseForm.tsx
'use client';
import React, { useState } from 'react';
import styles from './ExpenseForm.module.css';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { MicIcon } from './Icons';
import { useSpeechRecognition } from './hooks/useSpeechRecognition'; 
import axios from 'axios'; 

const CATEGORIES = ["餐饮", "交通", "门票", "购物", "住宿", "其他"];

interface ExpenseFormProps {
  day: number; // 接收当前是第几天
  onSave: (expense: any) => void;
  onClose: () => void;
}

export default function ExpenseForm({ day, onSave, onClose }: ExpenseFormProps) {
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // --- 新增 state for 语音记账 ---
  const [isListening, setIsListening] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false); // AI 正在解析的状态

  // --- 语音识别 Hook ---
  const onSpeechResult = async (text: string) => {
    setIsListening(false);
    if (!text) return;

    console.log("语音识别结果:", text);
    setIsExtracting(true); // 开始 AI 解析
    try {
      // 调用我们新的后端 API
      const response = await axios.post('/api/extract-expense', { text });
      const extractedData = response.data.data;
      
      console.log("AI 提取结果:", extractedData);

      // 自动填充表单
      if (extractedData.amount) setAmount(extractedData.amount);
      if (extractedData.category) setCategory(extractedData.category);
      if (extractedData.description) setDescription(extractedData.description);

    } catch (error) {
      console.error("AI 提取开销信息失败:", error);
      alert("无法智能解析您的语音，请手动输入。");
    } finally {
      setIsExtracting(false);
    }
  };
  const { start, stop, supported } = useSpeechRecognition(onSpeechResult);
  
  const toggleListening = () => {
    if (!supported) return alert("浏览器不支持语音识别。");
    if (isListening) {
      stop();
    } else {
      // 在开始前清空表单
      setAmount('');
      setCategory('');
      setDescription('');
      start();
      setIsListening(true);
    }
  };

  const handleSubmit = () => {
    if (!amount || !category) {
      alert("请输入金额和类别！");
      return;
    }
    
    // 关键修改：不再传递 expense_date，而是传递 trip_day
    onSave({ 
      amount, 
      category, 
      description,
      trip_day: day // <--- 将从 prop 接收到的 day 传递出去
    }); 
    
    onClose();
  };

  return (
    <div className={styles.formContainer}>
      {/* 1. 标题和麦克风按钮被包裹在一个新的 flex 容器中 */}
      <div className={styles.titleWrapper}>
        <h3 className={styles.title}>为 Day {day} 记一笔</h3>
        <button 
          onClick={toggleListening} 
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`}
          title="语音记账"
          disabled={isExtracting || isListening} // 在解析或正在聆听时禁用
        >
          <MicIcon size={20} />
        </button>
      </div>
      
      {/* 2. 当 AI 正在解析语音时，显示加载提示 */}
      {isExtracting && (
        <p className={styles.extractingText}>
          AI 正在解析您的语音...
        </p>
      )}

      {/* 金额输入框 */}
      <div className={styles.grid}>
        <div>
          <label className={styles.label}>金额 (元)</label>
          <Input 
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : '')}
            disabled={isExtracting} // 在解析时禁用手动输入
          />
        </div>
      </div>
      
      {/* 类别选择 */}
      <div>
        <label className={styles.label}>类别</label>
        <div className={styles.categoryContainer}>
          {CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setCategory(cat)}
              className={`${styles.categoryTag} ${category === cat ? styles.categoryTagSelected : ''}`}
              disabled={isExtracting} // 在解析时禁用手动输入
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      {/* 描述输入框 */}
      <div>
        <label className={styles.label}>描述 (可选)</label>
        <Input 
          type="text"
          placeholder="例如: 一兰拉面"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isExtracting} // 在解析时禁用手动输入
        />
      </div>

      {/* 底部按钮 */}
      <div className={styles.buttonContainer}>
        <Button onClick={onClose} variant="ghost" style={{ marginRight: '0.5rem' }}>取消</Button>
        <Button onClick={handleSubmit} disabled={isExtracting || !amount}>
          {isExtracting ? '解析中...' : '保存'}
        </Button>
      </div>
    </div>
  );
}
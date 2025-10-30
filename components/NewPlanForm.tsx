// components/NewPlanForm.tsx (极简交互版)
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import styles from './NewPlanForm.module.css';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { MicIcon, PaperAirplaneIcon } from './Icons';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

// 预设的偏好标签
const PRESET_PREFERENCES = ["美食", "动漫", "历史古迹", "自然风光", "购物", "亲子"];

// 1. 更新接口定义，现在只传递一个主查询字符串和偏好数组
export interface NewPlanRequest {
  mainQuery: string;
  preferences: string[];
}

interface NewPlanFormProps {
  onGenerate: (request: NewPlanRequest) => void;
  onClose: () => void;
}

export default function NewPlanForm({ onGenerate, onClose }: NewPlanFormProps) {
  // 2. 移除 days, budget, companion 等 state，只保留一个核心输入状态
  const [mainQuery, setMainQuery] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState('');
  const [isListening, setIsListening] = useState(false);
  
  // --- 语音识别逻辑 ---
  const onSpeechResult = useCallback((text: string) => {
    setMainQuery(text);
    setIsListening(false);
  }, []);
  const { start, stop, supported } = useSpeechRecognition(onSpeechResult);
  
  const toggleListening = () => {
    if (!supported) return alert("当前浏览器不支持语音识别。");
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      start();
      setIsListening(true);
    }
  };

  // --- 偏好标签逻辑 (保持不变) ---
  const handleAddPref = (prefToAdd: string) => {
    const newPref = prefToAdd.trim();
    if (newPref && !selectedPrefs.includes(newPref)) {
      setSelectedPrefs(prev => [...prev, newPref]);
    }
    setCustomPref('');
  };

  const handleCustomPrefKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddPref(customPref);
    }
  };
  
  const handleRemovePref = (prefToRemove: string) => {
    setSelectedPrefs(prev => prev.filter(p => p !== prefToRemove));
  };

  // --- 提交逻辑 ---
  const handleSubmit = () => {
    if (!mainQuery.trim()) {
      alert("请输入您的旅行想法！");
      return;
    }
    // 3. 传递新的、简化的数据结构
    onGenerate({ mainQuery, preferences: selectedPrefs });
    onClose();
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.title}>创建新行程</h3>
      
      {/* 核心自然语言输入框 */}
      <div className={styles.inputWrapper}>
        <Input 
          value={mainQuery}
          onChange={(e) => setMainQuery(e.target.value)}
          placeholder="例如：去东京玩5天，预算1万元，喜欢动漫"
          style={{ paddingRight: '2.5rem' }}
        />
        <button onClick={toggleListening} className={`${styles.micButton} ${isListening ? styles.listening : ''}`} title="语音输入">
          <MicIcon size={18} />
        </button>
      </div>

      {/* 偏好选择 */}
      <div className={styles.preferences}>
        <h4 className={styles.prefTitle}>添加偏好 (可选，按回车添加)</h4>
        <div className={styles.tagsContainer}>
          {selectedPrefs.map(pref => (
            <div key={pref} className={`${styles.tag} ${styles.tagSelected}`}>
              <span>{pref}</span>
              <button onClick={() => handleRemovePref(pref)} className={styles.tagRemoveBtn}>×</button>
            </div>
          ))}
          <input
            type="text"
            value={customPref}
            onChange={(e) => setCustomPref(e.target.value)}
            onKeyDown={handleCustomPrefKeyDown}
            placeholder="自定义标签..."
            className={styles.tagInput}
          />
        </div>
        
        <div className={styles.tagsContainer} style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}>
          {PRESET_PREFERENCES.filter(p => !selectedPrefs.includes(p)).map(pref => (
            <button key={pref} onClick={() => handleAddPref(pref)} className={styles.tag}>
              + {pref}
            </button>
          ))}
        </div>
      </div>

      {/* 提交按钮 */}
      <div className={styles.buttonContainer}>
        <Button onClick={onClose} variant="ghost" style={{ marginRight: '0.5rem' }}>取消</Button>
        <Button onClick={handleSubmit}>
          <PaperAirplaneIcon size={16} />
          <span style={{ marginLeft: '0.5rem' }}>生成行程</span>
        </Button>
      </div>
    </div>
  );
}
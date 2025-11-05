// components/NewPlanForm.tsx (极简交互版)
'use client';

import React, { useState, useCallback } from 'react';
import styles from './NewPlanForm.module.css';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
// 确保 LoadingSpinnerIcon 已经被导入
import { MicIcon, PaperAirplaneIcon, LoadingSpinnerIcon } from './Icons'; 
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

// 预设的偏好标签
const PRESET_PREFERENCES = ["美食", "动漫", "历史古迹", "自然风光", "购物", "亲子"];

export interface NewPlanRequest {
  mainQuery: string;
  preferences: string[];
}

// 接口定义：onGenerate 现在返回一个 Promise
interface NewPlanFormProps {
  onGenerate: (request: NewPlanRequest) => Promise<void>;
  onClose: () => void;
}

export default function NewPlanForm({ onGenerate, onClose }: NewPlanFormProps) {
  const [mainQuery, setMainQuery] = useState('');
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([]);
  const [customPref, setCustomPref] = useState('');
  const [isListening, setIsListening] = useState(false);

  // 1. 添加用于控制加载状态的 state
  const [isGenerating, setIsGenerating] = useState(false);
  
  // --- 语音识别逻辑 (无变动) ---
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

  // --- 偏好标签逻辑 (无变动) ---
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

  // --- 2. 修正后的提交逻辑 ---
  const handleSubmit = async () => {
    console.log("1. handleSubmit triggered."); 
    if (!mainQuery.trim()) {
      alert("请输入您的旅行想法！");
      return;
    }
    console.log("2. Setting isGenerating to TRUE.");
    // 开始生成，设置加载状态
    setIsGenerating(true); 
    
    try {
      console.log("3. Calling parent's onGenerate function (awaiting...).");
      // 等待父组件的 onGenerate 异步函数执行完成
      await onGenerate({ mainQuery, preferences: selectedPrefs });
      console.log("5. onGenerate has finished. Closing modal.");
      onClose(); // 仅在成功后关闭弹窗
    } catch (error) {
      // 如果生成失败，可以在这里处理错误
      console.error("生成行程失败:", error);
      alert("生成行程失败，请稍后重试。");
    } finally {
      // 无论成功还是失败，最后都将加载状态重置
      console.log("6. In 'finally' block. Setting isGenerating to FALSE.");
      setIsGenerating(false); 
    }
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
          disabled={isGenerating} // 在加载时禁用输入框
        />
        <button 
          onClick={toggleListening} 
          className={`${styles.micButton} ${isListening ? styles.listening : ''}`} 
          title="语音输入"
          disabled={isGenerating} // 在加载时禁用麦克风
        >
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
              {/* 在加载时不允许移除标签 */}
              {!isGenerating && (
                <button onClick={() => handleRemovePref(pref)} className={styles.tagRemoveBtn}>×</button>
              )}
            </div>
          ))}
          <input
            type="text"
            value={customPref}
            onChange={(e) => setCustomPref(e.target.value)}
            onKeyDown={handleCustomPrefKeyDown}
            placeholder="自定义标签..."
            className={styles.tagInput}
            disabled={isGenerating} // 在加载时禁用
          />
        </div>
        
        {!isGenerating && ( // 在加载时隐藏预设标签区域
          <div className={styles.tagsContainer} style={{ border: 'none', background: 'transparent', paddingLeft: 0 }}>
            {PRESET_PREFERENCES.filter(p => !selectedPrefs.includes(p)).map(pref => (
              <button key={pref} onClick={() => handleAddPref(pref)} className={styles.tag}>
                + {pref}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. 更新后的提交按钮区域 */}
      <div className={styles.buttonContainer}>
        <Button 
          onClick={onClose} 
          variant="ghost" 
          style={{ marginRight: '0.5rem' }} 
          disabled={isGenerating} // 加载时禁用
        >
          取消
        </Button>
        <Button onClick={handleSubmit} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <LoadingSpinnerIcon size={16} />
              <span style={{ marginLeft: '0.5rem' }}>正在生成...</span>
            </>
          ) : (
            <>
              <PaperAirplaneIcon size={16} />
              <span style={{ marginLeft: '0.5rem' }}>生成行程</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
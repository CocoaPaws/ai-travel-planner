// components/Planner.tsx (完整版 - 第3阶段)
'use client';

import React, { useState, useEffect } from 'react';

// 布局和 UI 组件
import Header from './Header';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import RightRail from './RightRail';
import styles from './Planner.module.css';

// 服务和类型定义
import { getAiTripPlan, TripRequest, AiTripPlan } from '@/lib/aiService';
import { MapLocation } from '@/lib/mapService';

// Speech Recognition Hook (保持不变)
function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = React.useRef<any>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      onResult(transcript);
    };
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
    };
  }, [onResult]);

  const start = () => recognitionRef.current?.start();
  const stop = () => recognitionRef.current?.stop();
  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  return { start, stop, supported };
}

// 完整的 MOCK_PLAN 数据，用于初始展示
const MOCK_PLAN = {
  id: "plan_1",
  title: "日本 - 5天经典游 (家庭)",
  budget: 10000,
  days: [
    {
      title: "Day 1 - 东京初见",
      items: [
        { type: "place", label: "浅草寺", coordinates: { latitude: 35.7148, longitude: 139.7967 } },
        { type: "place", label: "秋叶原", coordinates: { latitude: 35.7022, longitude: 139.7741 } },
        { type: "food", label: "一兰拉面 (午餐)" },
        { type: "stay", label: "新宿格兰酒店" },
      ],
      budget: 1500,
    },
    {
      title: "Day 2 - 京都古韵",
      items: [
        { type: "place", label: "清水寺", coordinates: { latitude: 34.9949, longitude: 135.7850 } },
        { type: "place", label: "伏见稻荷大社", coordinates: { latitude: 34.9671, longitude: 135.7727 } },
        { type: "food", label: "汤豆腐嵯峨野 (午餐)" },
      ],
      budget: 1700,
    },
    {
      title: "Day 3 - 大阪美食",
      items: [
        { type: "place", label: "道顿堀", coordinates: { latitude: 34.6687, longitude: 135.5013 } },
        { type: "food", label: "黑门市场 (街头小吃)" },
      ],
      budget: 1600,
    },
  ],
  generatedFrom: "示例：我想去日本，5天，带孩子，喜欢美食和动漫"
};


export default function Planner() {
  // 核心状态管理
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<any>(MOCK_PLAN);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [list, setList] = useState([MOCK_PLAN]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 语音识别 Hook
  const onSpeechResult = (text: string) => {
    setQuery(text);
    handleGenerate(text);
    setIsListening(false);
  };
  const { start, stop, supported } = useSpeechRecognition(onSpeechResult);

  const toggleListening = () => {
    if (!supported) return alert("当前浏览器不支持语音识别。");
    if (!isListening) {
      start();
      setIsListening(true);
    } else {
      stop();
      setIsListening(false);
    }
  };

  // 处理 AI 生成逻辑
  const handleGenerate = async (inputText: string) => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      // NOTE: 暂时注释掉真实 AI 调用，以便快速预览 UI
      // const request: TripRequest = { destination: inputText, days: 5, budget: 10000, companion: '', preferences: inputText };
      // const newPlan = await getAiTripPlan(request);

      const newPlan = { ...MOCK_PLAN, title: `${inputText.slice(0, 15)}...`, generatedFrom: inputText, id: `plan_${Date.now()}` };
      setPlan(newPlan);
      setList((currentList) => [newPlan, ...currentList.filter(p => p.id !== newPlan.id)]);
    } catch (err: any) {
      setError(err.message || 'AI 生成失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 从行程中提取地理位置坐标
  const getLocationsFromPlan = (currentPlan: any | null): MapLocation[] => {
    if (!currentPlan) return [];
    const locations: MapLocation[] = [];
    currentPlan.days.forEach((day: any) => {
      day.items.forEach((item: any) => {
        if (item.coordinates) {
          locations.push({
            name: item.label,
            coordinates: [item.coordinates.longitude, item.coordinates.latitude],
          });
        }
      });
    });
    return locations;
  };
  
  // 模拟的事件处理函数
  const savePlan = () => alert("已保存到云端（模拟）。");
  const openChat = () => alert("打开 AI 聊天窗口（模拟）。");

  return (
    <div className={styles.appContainer}>
      <Header 
        query={query} 
        setQuery={setQuery} 
        isListening={isListening}
        toggleListening={toggleListening}
        onGenerate={() => handleGenerate(query)}
      />
      <div className={styles.mainWrapper}>
        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen}
          list={list}
          onSelectPlan={(selectedPlan) => setPlan(selectedPlan)}
        />
        <div className={styles.contentArea}>
          <MainContent 
            plan={plan}
            onSave={savePlan}
            onChat={openChat}
            locations={getLocationsFromPlan(plan)}
            isLoading={isLoading} // 将加载状态传递给 MainContent
            error={error}       // 将错误状态传递给 MainContent
          />
          <RightRail 
            plan={plan} 
          />
        </div>
      </div>
    </div>
  );
}
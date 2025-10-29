// components/hooks/useSpeechRecognition.ts

import { useRef, useEffect } from 'react'; // 确保从 'react' 导入 hooks

/**
 * 一个自定义 React Hook，用于处理浏览器的 Web Speech API。
 * @param onResult - 当语音识别产生最终结果时调用的回调函数。
 */
export function useSpeechRecognition(onResult: (text: string) => void) {
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // 确保只在客户端（浏览器）环境中执行
    if (typeof window === 'undefined') return;

    // 检查浏览器是否支持 SpeechRecognition API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("当前浏览器不支持 Web Speech API。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false; // 我们只关心最终结果
    recognition.continuous = false;   // 只识别一次，而不是连续识别

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      
      onResult(transcript);
    };

    // 其他事件处理（可选，但有助于调试）
    recognition.onerror = (event: any) => {
      console.error("语音识别错误:", event.error);
    };

    recognitionRef.current = recognition;

    // 组件卸载时的清理函数
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResult]); // 依赖项数组，确保 onResult 变化时能重新设置

  const start = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    }
  };
  
  const stop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  
  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { start, stop, supported };
}
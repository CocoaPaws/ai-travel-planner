// components/hooks/useSpeechRecognition.ts (健壮版)

import { useRef, useEffect, useCallback } from 'react';

export function useSpeechRecognition(onResult: (text: string) => void) {
  // recognitionRef 现在只用来存储当前的实例，以便可以中止它
  const recognitionRef = useRef<any>(null);
  
  // onResultCallbackRef 用于确保在事件监听器中始终能调用到最新的 onResult 函数
  const onResultCallbackRef = useRef(onResult);
  useEffect(() => {
    onResultCallbackRef.current = onResult;
  }, [onResult]);

  const start = useCallback(() => {
    // 1. 每次开始时，都创建一个全新的实例
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("当前浏览器不支持 Web Speech API。");
      return;
    }

    // 如果上一次的识别还在进行，先中止它
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    console.log("▶️ 创建新的 SpeechRecognition 实例并启动...");
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.continuous = false;

    // 2. 将所有事件监听器都绑定到这个新实例上
    recognition.onaudiostart = () => console.log("🎤 麦克风已启动，正在监听...");
    recognition.onspeechstart = () => console.log("🗣️ 检测到语音开始...");
    recognition.onspeechend = () => console.log("🤫 语音结束。");
    recognition.onnomatch = () => console.warn("🤷‍♂️ 未匹配到任何可识别的语音。");

    recognition.onresult = (event: any) => {
      console.log("✅ 识别到结果！", event.results);
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      console.log("  - 识别出的文本:", transcript);
      // 使用 ref 来调用回调，避免依赖问题
      onResultCallbackRef.current(transcript);
    };

    recognition.onerror = (event: any) => {
      // 忽略 'aborted' 错误，因为这是我们主动触发的
      if (event.error !== 'aborted') {
        console.error("🔥 语音识别错误:", event.error);
      }
    };
    
    // 3. 启动这个新实例
    recognition.start();
    // 4. 将这个新实例存入 ref，以便可以从外部中止
    recognitionRef.current = recognition;

  }, []); // start 函数本身是稳定的，不需要依赖

  const stop = useCallback(() => {
    if (recognitionRef.current) {
      console.log("⏹️ 正在调用 recognition.stop()...");
      recognitionRef.current.stop();
    }
  }, []);
  
  const supported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { start, stop, supported };
}
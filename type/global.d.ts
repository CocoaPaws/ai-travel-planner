// types/global.d.ts

// 我们在这里扩展全局的 Window 接口
declare interface Window {
  SpeechRecognition: typeof SpeechRecognition;
  webkitSpeechRecognition: typeof SpeechRecognition;
}
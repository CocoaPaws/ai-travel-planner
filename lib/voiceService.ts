// lib/voiceService.ts

/**
 * 这是一个语音识别服务的封装模块。
 * 当前阶段我们只定义接口，不实现具体功能。
 * 后续将在此处集成科大讯飞的实时语音识别SDK。
 */

// 定义回调函数的类型，当识别到结果时调用
type OnResultCallback = (result: string) => void;
// 定义错误回调
type OnErrorCallback = (error: Error) => void;

/**
 * 开始语音识别
 * @param onResult 识别到一句话的最终结果时的回调函数
 * @param onError 发生错误时的回调函数
 */
export const startRecognition = (onResult: OnResultCallback, onError: OnErrorCallback) => {
  console.log("开始语音识别（模拟）...");
  
  // TODO: 在此实现科大讯飞 Web API 的 WebSocket 连接和认证逻辑。
  // 1. 获取麦克风权限。
  // 2. 创建到讯飞服务器的 WebSocket 连接。
  // 3. 将麦克风的音频流发送给服务器。
  // 4. 监听服务器返回的识别结果。

  // 使用 setTimeout 模拟在 3 秒后识别出了一句话
  setTimeout(() => {
    const mockResult = "我想去日本玩5天，预算1万元，喜欢美食和动漫，带孩子。";
    console.log("模拟识别结果:", mockResult);
    onResult(mockResult);
  }, 3000);
};

/**
 * 停止语音识别
 */
export const stopRecognition = () => {
  console.log("停止语音识别（模拟）...");
  // TODO: 在此实现关闭 WebSocket 连接和释放麦克风资源的逻辑。
};
// lib/aiService.ts

import axios from 'axios';

// ==========================================================
// 类型定义保持不变，因为前后端都需要它们
// ==========================================================
export interface TripRequest {
  destination: string;
  days: number;
  budget: number;
  companion: string;
  preferences: string;
}

export interface Activity {
  location: string;
  type: '景点' | '餐厅' | '住宿' | string;
  description: string;
  estimated_cost: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface DailyPlan {
  day: number;
  activities: Activity[];
}

export interface AiTripPlan {
  daily_plan: DailyPlan[];
  id?: string;
  title?: string;
  budget?: number;
  generatedFrom?: string;
}

// ==========================================================
// getAiTripPlan 函数被重写
// ==========================================================
export const getAiTripPlan = async (request: TripRequest): Promise<AiTripPlan> => {
  try {
    console.log("前端服务: 正在向我们的代理 API (/api/generate-plan) 发送请求...", request);

    // 1. 发送 POST 请求到我们自己的后端 API 路由
    const response = await axios.post('/api/generate-plan', {
      // 将所有旅行要求包裹在一个对象里发送
      tripRequest: request 
    });
    
    console.log("前端服务: 成功从代理 API 接收到数据:", response.data);

    // 2. 检查响应数据是否存在，并直接返回它
    // 我们期望的结构是 { data: { daily_plan: [...] } }
    if (response.data && response.data.data) {
      return response.data.data;
    } else {
      throw new Error("从代理 API 返回的数据格式不正确");
    }

  } catch (error: any) {
    // 错误处理：捕获请求我们自己 API 时发生的错误
    console.error("前端服务: 请求代理 API 失败:", error.response?.data || error.message);
    
    // 将后端返回的错误信息（如果有的话）或一个通用错误信息抛出，以便 UI 层捕获
    const errorMessage = error.response?.data?.error || '生成行程失败，请稍后再试。';
    throw new Error(errorMessage);
  }
};
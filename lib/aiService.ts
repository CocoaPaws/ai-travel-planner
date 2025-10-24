// lib/aiService.ts

import axios from 'axios';

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
}

export const getAiTripPlan = async (request: TripRequest): Promise<AiTripPlan> => {
  const endpoint = 'https://bailian.aliyuncs.com/v2/app/completion';
  
  const prompt = `
你是一个专业的旅行规划师。请根据以下要求，为我生成一份详细的旅行计划。
严格按照以下JSON格式返回，不要包含任何额外说明或\`\`\`json标记。
JSON结构为: {"daily_plan": [{"day": 数字, "activities": [{"location": "地点名称", "type": "景点|餐厅|住宿", "description": "简短描述", "estimated_cost": 数字, "coordinates": {"latitude": 纬度, "longitude": 经度}}]}]}

旅行要求：
- 目的地: ${request.destination}
- 旅行天数: ${request.days}
- 总预算: ${request.budget} 元人民币
- 同行人员: ${request.companion}
- 旅行偏好: ${request.preferences}
  `;

  try {
    console.log('正在向阿里云百炼发送请求...');
    
    const response = await axios.post(
      endpoint,
      {
        requestId: `req_${Date.now()}`,
        prompt: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_ALIYUN_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('成功收到AI响应:', response.data);

    const aiContent = response.data.Data.Text;

    try {
      const parsedPlan: AiTripPlan = JSON.parse(aiContent);
      return parsedPlan;
    } catch (parseError) {
      console.error('解析AI返回的JSON失败:', parseError);
      throw new Error('AI 返回的格式不正确。');
    }
  } catch (error) {
    console.error('请求阿里云百炼服务失败:', error);
    throw new Error('AI 行程规划失败，请稍后再试。');
  }
};
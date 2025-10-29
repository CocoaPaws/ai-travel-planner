// app/api/generate-plan/route.ts (自然语言解析版)

import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';
import type { TripRequest } from '@/lib/aiService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // 接收到的 tripRequest 现在只包含一个包含了所有信息的 'destination' 字段
    const tripRequest: TripRequest = body.tripRequest;

    if (!tripRequest || !tripRequest.destination) {
      return new NextResponse(JSON.stringify({ error: '无效的请求参数' }), { status: 400 });
    }

    // 1. 从环境变量中安全地获取 API Key
    const apiKey = process.env.ALIYUN_DASHSCOPE_API_KEY;
    if (!apiKey) {
      throw new Error('未在服务器端配置 ALIYUN_DASHSCOPE_API_KEY');
    }
    
    // 2. 使用文档中提供的 Base URL
    const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    
    // ================== 3. 构造新的、更强大的 Prompt ==================
    const prompt = `
你是一个顶级的旅行规划AI助手。你的核心任务是从用户提供的自然语言描述中，智能地提取出所有关键的旅行要素（例如：目的地、旅行天数、预算、同行人员、兴趣偏好等），然后基于这些要素生成一份详细、合理且个性化的旅行计划。

严格按照以下JSON格式返回，不要在JSON代码块之外添加任何额外说明、注释或 \`\`\`json 标记。
JSON结构为: {"daily_plan": [{"day": 数字, "activities": [{"location": "地点名称", "type": "景点|餐厅|住宿", "description": "简短描述", "estimated_cost": 数字, "coordinates": {"latitude": 纬度, "longitude": 经度}}]}]}

这是用户的完整旅行需求描述:
"${tripRequest.destination}"

请仔细分析上述需求并开始规划。
    `;
    // =================================================================

    // 4. 从后端服务器发送请求到 DashScope
    console.log('API Route: 正在向 DashScope 发送请求...');
    const dashScopeResponse = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: "qwen-plus", // 请确保这是您在阿里云上使用的正确模型名称
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        // 强制模型返回 JSON 格式，这对确保数据解析成功至关重要
        response_format: { "type": "json_object" } 
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('API Route: 成功收到 DashScope 响应');

    // 5. 从响应结构中提取内容
    const aiContent = dashScopeResponse.data?.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('从 DashScope 响应中未找到有效的行程内容');
    }

    // 6. 解析并返回
    const parsedPlan = JSON.parse(aiContent);
    return NextResponse.json({ data: parsedPlan });

  } catch (error: any) {
    console.error("API Route - AI 请求失败:", error.response?.data || error.message);
    return new NextResponse(
      JSON.stringify({ error: 'AI 服务调用失败，请检查服务器日志。' }),
      { status: 500 }
    );
  }
}
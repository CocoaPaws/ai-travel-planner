// app/api/extract-expense/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;

    if (!text) {
      return new NextResponse(JSON.stringify({ error: '缺少文本参数' }), { 
        status: 400 
      });
    }

    const apiKey = process.env.ALIYUN_DASHSCOPE_API_KEY;
    if (!apiKey) throw new Error('未配置 ALIYUN_DASHSCOPE_API_KEY');

    const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    
    // --- 专门用于信息提取的 Prompt ---
    const prompt = `
你是一个智能记账助手。你的任务是从用户提供的一段关于消费的自然语言描述中，提取出三个关键信息：'amount' (金额，必须是数字), 'category' (类别，从['餐饮', '交通', '购物', '门票', '住宿', '其他']中选择一个最合适的), 和 'description' (具体描述)。
严格按照以下JSON格式返回，不要包含任何额外说明或\`\`\`json标记。
JSON结构为: {"amount": 数字, "category": "预设类别", "description": "字符串"}
这是用户的消费描述:
"${text}"
请提取信息。如果某个信息无法提取，请将其值设为 null。
`;

    const dashScopeResponse = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: "qwen-plus", // 或者使用更轻量的模型，如 qwen-turbo
        messages: [{ role: "user", content: prompt }],
        response_format: { "type": "json_object" }
      },
      { 
        headers: { 
          'Authorization': `Bearer ${apiKey}` 
        } 
      }
    );

    const aiContent = dashScopeResponse.data?.choices?.[0]?.message?.content;
    if (!aiContent) throw new Error('AI未能提取信息');

    const parsedData = JSON.parse(aiContent);
    return NextResponse.json({ data: parsedData });

  } catch (error: any) {
    console.error("API Route - 提取开销信息失败:", error.response?.data || error.message);
    return new NextResponse(
      JSON.stringify({ error: 'AI 服务调用失败' }), 
      { status: 500 }
    );
  }
}
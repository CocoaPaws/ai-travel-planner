// test-ai-api.js

// 1. 导入必要的库
const axios = require('axios');
require('dotenv').config({ path: '.env.local' }); // 加载 .env.local 文件中的环境变量

// 2. 定义测试函数
async function testDashScopeAPI() {
  console.log('--- 开始测试阿里云 DashScope API 调用 ---');

  // 3. 从环境变量中获取 API Key
  const apiKey = process.env.ALIYUN_DASHSCOPE_API_KEY;

  if (!apiKey) {
    console.error('❌ 错误：未在 .env.local 文件中找到 ALIYUN_DASHSCOPE_API_KEY。');
    console.log('请确保 .env.local 文件中有这样一行：ALIYUN_DASHSCOPE_API_KEY=sk-xxxxxxxxxxxx');
    return;
  }
  console.log('✅ 成功加载 API Key。');

  // 4. 定义 API Endpoint 和模型名称 (请根据您的实际情况修改)
  const baseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
  const modelName = 'qwen-plus'; // !! 请确认这是您在阿里云上使用的模型名称
  
  console.log(`- Base URL: ${baseUrl}`);
  console.log(`- 模型名称: ${modelName}`);

  // 5. 构造一个简单的 Prompt 用于测试
  const testPrompt = '你好，请用一句话介绍你自己。';
  console.log(`- 测试 Prompt: "${testPrompt}"`);

  try {
    console.log('\n🚀 正在发送请求到 DashScope...');

    // 6. 使用 axios 发送 POST 请求
    const response = await axios.post(
      `${baseUrl}/chat/completions`,
      {
        model: modelName,
        messages: [
          {
            role: "user",
            content: testPrompt
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        // 添加超时设置，防止请求一直卡住
        timeout: 20000 // 20秒超时
      }
    );

    console.log('\n🎉 成功！收到服务器响应。');
    
    // 7. 打印完整的响应数据，以便分析
    console.log('--- 完整的响应数据 (response.data) ---');
    console.log(JSON.stringify(response.data, null, 2));

    // 8. 提取并打印核心内容
    const aiContent = response.data?.choices?.[0]?.message?.content;
    if (aiContent) {
      console.log('\n--- 提取的核心 AI 回复 ---');
      console.log(aiContent);
      console.log('\n✅✅✅ 测试成功！API 调用工作正常。✅✅✅');
    } else {
      console.error('❌ 错误：响应数据结构不符合预期，未找到 choices[0].message.content。');
    }

  } catch (error) {
    console.error('\n🔥🔥🔥 测试失败！请求过程中发生错误。🔥🔥🔥');
    
    // 打印详细的错误信息
    if (error.response) {
      // 请求已发出，但服务器返回了错误状态码 (如 401, 403, 404, 500)
      console.error('--- 服务器错误响应详情 ---');
      console.error(`- 状态码: ${error.response.status}`);
      console.error('- 响应头:', error.response.headers);
      console.error('- 响应体 (response.data):', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      // 请求已发出，但没有收到响应 (例如网络问题、DNS问题、超时)
      console.error('--- 网络请求错误 ---');
      console.error('请求已发出但未收到响应。请检查您的网络连接、防火墙设置，以及 Base URL 是否正确。');
      console.error(error.message);
    } else {
      // 在设置请求时触发了错误
      console.error('--- 请求设置错误 ---');
      console.error('在创建请求时发生错误:', error.message);
    }
  } finally {
    console.log('\n--- 测试结束 ---');
  }
}

// 9. 运行测试函数
testDashScopeAPI();
// Simple test script to verify Kimi API connection
const axios = require('axios');

const API_KEY = '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';
const MODEL = 'deepseek/deepseek-chat';
const BASE_URL = 'https://openrouter.ai/api/v1';

async function testKimiAPI() {
  try {
    console.log('🧪 Testing Kimi API connection...');
    console.log(`📡 Model: ${MODEL}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 20)}...`);
    
    const response = await axios.post(`${BASE_URL}/chat/completions`, {
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant for creating educational content in Thai language.'
        },
        {
          role: 'user',
          content: 'สร้างตัวอย่างคำถามภาษาไทยสั้น ๆ เกี่ยวกับคณิตศาสตร์ระดับ ม.1'
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000', // Optional: for tracking
        'X-Title': 'GenCouce Study Sheet Generator' // Optional: for tracking
      },
      timeout: 30000
    });

    if (response.data && response.data.choices && response.data.choices[0]) {
      console.log('✅ API connection successful!');
      console.log('📝 Response:', response.data.choices[0].message.content);
      console.log('📊 Usage:', response.data.usage);
      return true;
    } else {
      console.log('❌ Unexpected response format:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ API connection failed:');
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
    return false;
  }
}

// Run the test
testKimiAPI().then(success => {
  if (success) {
    console.log('🎉 Kimi API is ready to use in GenCouce!');
  } else {
    console.log('🔧 Please check the API configuration.');
  }
  process.exit(success ? 0 : 1);
});
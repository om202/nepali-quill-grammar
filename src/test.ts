import axios from 'axios';

async function testAnalyze() {
  try {
    const response = await axios.post('http://localhost:3000/api/v1/analyze', {
      text: 'नेपाली भाषा राम्रो छ।'
    });
    
    console.log('Analysis Result:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error:', error.response?.data || error.message);
    } else {
      console.error('Error:', error);
    }
  }
}

testAnalyze();
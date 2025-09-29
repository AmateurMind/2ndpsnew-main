const axios = require('axios');

async function testAIAuth() {
  try {
    console.log('🔍 Testing AI Authentication...\n');

    // Step 1: Login to get token
    console.log('Step 1: Logging in...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'aarav.sharma@college.edu',
      password: 'demo123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!');
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Step 2: Test AI health endpoint (should work with OR without auth)
    console.log('\nStep 2: Testing AI health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/ai/health', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ AI Health check successful!');
    console.log('Services:', Object.keys(healthResponse.data.services));
    
    // Step 3: Test protected AI endpoint
    console.log('\nStep 3: Testing protected AI endpoint (resume analysis)...');
    const resumeResponse = await axios.post('http://localhost:5000/api/ai/analyze-resume-text', {
      resumeText: 'John Doe, Software Engineer with 2 years experience in React and Node.js',
      provider: 'gemini'
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resume analysis successful!');
    console.log('Analysis received:', resumeResponse.data.message);
    
  } catch (error) {
    console.error('❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      console.error('Request made but no response:', error.request);
    } else {
      console.error('Error:', error.message);
      console.error('Full error:', error);
    }
  }
}

testAIAuth();
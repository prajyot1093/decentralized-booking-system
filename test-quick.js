// Simple API test
const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testing Backend API...');
    
    // Test health
    const health = await axios.get('http://localhost:3001/api/health');
    console.log('✅ Health:', health.data);
    
    // Test services
    const services = await axios.get('http://localhost:3001/api/services');
    console.log('✅ Services:', services.data);
    
    if (services.data.data && services.data.data.length > 0) {
      const serviceId = services.data.data[0].id;
      const service = await axios.get(`http://localhost:3001/api/services/${serviceId}`);
      console.log('✅ Service Detail:', service.data);
    }
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error.response ? error.response.data : error.message);
  }
}

testAPI();
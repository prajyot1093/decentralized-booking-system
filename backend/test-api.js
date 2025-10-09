const axios = require('axios');

async function testBackendAPI() {
  const baseUrl = 'http://localhost:3001';
  
  try {
    console.log('🧪 Testing Backend API...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const health = await axios.get(`${baseUrl}/api/health`);
    console.log('✅ Health check:', health.data);
    
    // Test services endpoint
    console.log('\n2. Testing services endpoint...');
    const services = await axios.get(`${baseUrl}/api/services`);
    console.log('✅ Services:', services.data);
    
    // Test specific service
    console.log('\n3. Testing specific service...');
    const service = await axios.get(`${baseUrl}/api/services/1`);
    console.log('✅ Service 1:', service.data);
    
    // Test seat availability
    console.log('\n4. Testing seat availability...');
    const seats = await axios.get(`${baseUrl}/api/services/1/seats`);
    console.log('✅ Seats for Service 1:', seats.data);
    
    // Test platform stats
    console.log('\n5. Testing platform stats...');
    const stats = await axios.get(`${baseUrl}/api/services/stats/platform`);
    console.log('✅ Platform stats:', stats.data);
    
    // Test indexer status
    console.log('\n6. Testing indexer status...');
    const indexerStatus = await axios.get(`${baseUrl}/api/indexer/status`);
    console.log('✅ Indexer status:', indexerStatus.data);
    
    console.log('\n🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run if called directly
if (require.main === module) {
  testBackendAPI();
}

module.exports = testBackendAPI;
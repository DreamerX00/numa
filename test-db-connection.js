const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-db',
  method: 'GET'
};

console.log('🔍 Testing database connection...');

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ Response received:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('\n🎉 Database connection is working locally!');
        console.log('📊 Test results:');
        console.log(`- Environment: ${result.environment}`);
        console.log(`- Category count: ${result.tests?.categoryCount || 'N/A'}`);
        console.log(`- Sample data: ${result.tests?.sampleData?.length || 0} items`);
      } else {
        console.log('\n❌ Database connection failed locally!');
        console.log('🔍 Error details:', result.error);
      }
    } catch (parseError) {
      console.log('❌ Failed to parse response:', parseError.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ Request failed:', error.message);
  console.log('🚨 Make sure the dev server is running on http://localhost:3000');
});

req.end();
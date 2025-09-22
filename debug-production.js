// Debug script to test production APIs
const fetch = require('node-fetch');

async function debugProduction() {
  console.log('🔍 Debugging NUMA Production Deployment\n');
  console.log('Site: https://numaiin.vercel.app\n');
  
  const tests = [
    {
      name: 'Health Check',
      url: 'https://numaiin.vercel.app/api/health',
      expect: 'healthy status'
    },
    {
      name: 'Products API',
      url: 'https://numaiin.vercel.app/api/products',
      expect: 'products array'
    },
    {
      name: 'Categories API', 
      url: 'https://numaiin.vercel.app/api/categories',
      expect: 'categories array'
    },
    {
      name: 'Carousel API',
      url: 'https://numaiin.vercel.app/api/carousel',
      expect: 'carousel slides'
    }
  ];
  
  for (const test of tests) {
    try {
      console.log(`🧪 Testing ${test.name}...`);
      const response = await fetch(test.url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${test.name}: OK (${response.status})`);
        
        if (test.name === 'Products API') {
          console.log(`   Products found: ${data.products?.length || 'N/A'}`);
        } else if (test.name === 'Categories API') {
          console.log(`   Categories found: ${data.length || 'N/A'}`);
        } else if (test.name === 'Carousel API') {
          console.log(`   Slides found: ${data.length || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${test.name}: Error ${response.status}`);
        console.log(`   ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
    console.log('');
  }
  
  console.log('🎯 Next Steps:');
  console.log('1. Check Vercel environment variables');
  console.log('2. Add numaiin.vercel.app to Firebase authorized domains');
  console.log('3. Verify NEXT_PUBLIC_APP_URL in Vercel env vars');
  console.log('4. Check browser console for client-side errors');
}

debugProduction();
#!/usr/bin/env node

/**
 * 🚀 Vercel Deployment & Database Test Script
 * 
 * This script helps you deploy to Vercel and immediately test
 * the MongoDB connection to diagnose any issues.
 */

const { execSync } = require('child_process');
const https = require('https');

console.log('🚀 Starting Vercel deployment and database test...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testDatabaseConnection(domain) {
  return new Promise((resolve, reject) => {
    const url = `https://${domain}/api/test-db`;
    
    log(`🔍 Testing database connection at: ${url}`, 'blue');
    
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          
          if (result.success) {
            log('✅ Database connection successful!', 'green');
            log(`📊 Environment: ${result.environment}`);
            log(`📈 Categories found: ${result.tests?.categoryCount || 'N/A'}`);
            log(`📦 Sample data: ${result.tests?.sampleData?.length || 0} items`);
            resolve(result);
          } else {
            log('❌ Database connection failed!', 'red');
            log(`🔍 Error: ${result.error}`);
            log(`💡 Troubleshooting tips:`, 'yellow');
            result.troubleshooting?.nextSteps?.forEach((step, i) => {
              log(`   ${i + 1}. ${step}`);
            });
            reject(new Error(result.error));
          }
        } catch (parseError) {
          log('❌ Failed to parse response', 'red');
          log(`Raw response: ${data}`);
          reject(parseError);
        }
      });
    }).on('error', (error) => {
      log(`❌ Request failed: ${error.message}`, 'red');
      reject(error);
    });
  });
}

async function main() {
  try {
    // Step 1: Build locally to catch any issues
    log('📦 Building project locally...', 'blue');
    try {
      execSync('npm run build', { stdio: 'inherit' });
      log('✅ Local build successful!', 'green');
    } catch (buildError) {
      log('❌ Local build failed! Fix errors before deploying.', 'red');
      process.exit(1);
    }
    
    // Step 2: Deploy to Vercel
    log('\n🚀 Deploying to Vercel...', 'blue');
    let deployOutput;
    try {
      deployOutput = execSync('vercel --prod', { encoding: 'utf8' });
      log('✅ Deployment successful!', 'green');
    } catch (deployError) {
      log('❌ Deployment failed!', 'red');
      console.log(deployError.stdout || deployError.message);
      process.exit(1);
    }
    
    // Extract domain from Vercel output
    const domainMatch = deployOutput.match(/https:\/\/([^\s]+)/);
    if (!domainMatch) {
      log('❌ Could not extract domain from Vercel output', 'red');
      log('Please manually test: https://your-domain.vercel.app/api/test-db');
      return;
    }
    
    const domain = domainMatch[1];
    log(`🌐 Deployed to: https://${domain}`, 'green');
    
    // Step 3: Wait a moment for deployment to be ready
    log('\n⏳ Waiting for deployment to be ready...', 'yellow');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Step 4: Test database connection
    log('\n🧪 Testing database connection...', 'blue');
    await testDatabaseConnection(domain);
    
    log('\n🎉 All tests passed! Your application is ready.', 'green');
    log(`🔗 Visit your app: https://${domain}`, 'blue');
    
  } catch (error) {
    log(`\n❌ Process failed: ${error.message}`, 'red');
    log('\n🔧 Next steps:', 'yellow');
    log('1. Check Vercel environment variables');
    log('2. Verify MongoDB Atlas cluster is active');
    log('3. Check Vercel function logs');
    log('4. Test connection string locally first');
    process.exit(1);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { testDatabaseConnection };
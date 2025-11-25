#!/usr/bin/env node
/**
 * Test Supabase Setup
 * 
 * This script tests all Supabase connections and configurations
 * Run: node test-supabase-setup.js
 */

const https = require('https');
const http = require('http');

// Test URLs - update these to match your production domains
const BASE_URLS = [
  'https://dashmemories.com',
  'https://www.dashqrcodes.com'
];

// Test endpoints
const TEST_ENDPOINTS = [
  '/api/test-supabase',
  '/api/test-heaven-supabase'
];

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, error: 'Invalid JSON' });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint}`;
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Testing: ${url}`, 'blue');
  log('='.repeat(60), 'cyan');
  
  try {
    const result = await makeRequest(url);
    
    if (result.status === 200) {
      if (result.data.success) {
        log('✅ SUCCESS', 'green');
      } else {
        log('⚠️  WARNING', 'yellow');
      }
      
      log('\nStatus Code:', 'cyan');
      console.log(`  ${result.status}`);
      
      log('\nResponse:', 'cyan');
      console.log(JSON.stringify(result.data, null, 2));
      
      // Check specific fields
      if (result.data.details) {
        log('\nDetails:', 'cyan');
        if (result.data.details.url) {
          if (result.data.details.url.includes('supabase.co')) {
            log(`  URL: ${result.data.details.url} ✅`, 'green');
          } else {
            log(`  URL: ${result.data.details.url || 'Missing'} ❌`, 'red');
          }
        }
        
        if (result.data.details.hasAnonKey !== undefined) {
          if (result.data.details.hasAnonKey) {
            log(`  Anon Key: Configured ✅`, 'green');
          } else {
            log(`  Anon Key: Missing ❌`, 'red');
          }
        }
      }
      
      return { success: result.data.success, details: result.data };
    } else {
      log(`❌ FAILED - Status Code: ${result.status}`, 'red');
      log('\nResponse:', 'cyan');
      console.log(JSON.stringify(result.data, null, 2));
      return { success: false, error: `HTTP ${result.status}` };
    }
  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('SUPABASE SETUP TEST SUITE', 'blue');
  log('='.repeat(60), 'cyan');
  log('\nTesting Supabase configuration on all domains...\n', 'yellow');
  
  const results = [];
  
  for (const baseUrl of BASE_URLS) {
    log(`\n${'─'.repeat(60)}`, 'cyan');
    log(`Testing Domain: ${baseUrl}`, 'blue');
    log('─'.repeat(60), 'cyan');
    
    for (const endpoint of TEST_ENDPOINTS) {
      const result = await testEndpoint(baseUrl, endpoint);
      results.push({
        domain: baseUrl,
        endpoint: endpoint,
        ...result
      });
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('TEST SUMMARY', 'blue');
  log('='.repeat(60), 'cyan');
  
  let allPassed = true;
  
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`\n${status}: ${result.domain}${result.endpoint}`, color);
    
    if (!result.success) {
      allPassed = false;
      if (result.error) {
        log(`  Error: ${result.error}`, 'red');
      }
    }
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    log('✅ ALL TESTS PASSED!', 'green');
  } else {
    log('❌ SOME TESTS FAILED', 'red');
    log('\nTo fix:', 'yellow');
    log('1. Check Vercel environment variables:', 'yellow');
    log('   - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('   - NEXT_PUBLIC_SUPABASE_ANON_KEY', 'yellow');
    log('2. Redeploy your Vercel project', 'yellow');
    log('3. Run HEAVEN_SIMPLIFIED_SUPABASE_SETUP.sql in Supabase', 'yellow');
  }
  log('='.repeat(60), 'cyan');
  
  return allPassed;
}

// Run tests
runAllTests().then((success) => {
  process.exit(success ? 0 : 1);
}).catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  process.exit(1);
});


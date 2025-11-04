#!/usr/bin/env node
/**
 * Script to find Oct 31 deployments on Vercel
 * Run: node find-oct31-deployments.js
 */

const https = require('https');
const { execSync } = require('child_process');

console.log('🔍 Finding Oct 31 deployments on Vercel...\n');

// Get Vercel token
let token;
try {
  // Try to get token from Vercel CLI
  const vercelConfig = execSync('vercel whoami 2>&1', { encoding: 'utf-8' });
  console.log('✅ Vercel CLI authenticated\n');
  
  // Note: Vercel CLI doesn't expose token directly, so we'll use the CLI
  console.log('📋 Listing all deployments...\n');
  const deployments = execSync('vercel ls --debug 2>&1 | head -50', { encoding: 'utf-8' });
  console.log(deployments);
  
} catch (error) {
  console.log('❌ Need to authenticate with Vercel first.');
  console.log('Run: vercel login');
  console.log('\nThen run this script again.\n');
  process.exit(1);
}

console.log('\n💡 To find Oct 31 deployments:');
console.log('1. Go to: https://vercel.com/dashboard');
console.log('2. Click on project: nextjs-auth-app');
console.log('3. Click "Deployments" tab');
console.log('4. Filter by date: Oct 31, 2024');
console.log('5. Click on each deployment to see details\n');

console.log('🔧 Or use Vercel CLI:');
console.log('   vercel ls --help');


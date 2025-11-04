#!/usr/bin/env node
/**
 * Script to fetch detailed deployment info with dates
 * This will help identify Oct 31 deployments
 */

const { execSync } = require('child_process');

const deployments = [
  'https://nextjs-auth-8zwhnmrvg-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-4vfacu7hm-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-cz71mqyqc-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-muvqvqicw-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-4awkephsw-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-fdsbdj9wo-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-ipx7z124w-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-fg8ztyvhe-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-myevthcch-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-mtpn3p95d-david-gastelums-projects.vercel.app',
  'https://nextjs-auth-1omq3por0-david-gastelums-projects.vercel.app',
];

console.log('🔍 Fetching detailed deployment information...\n');
console.log('Looking for Oct 31, 2024 deployments...\n');

deployments.forEach((url, index) => {
  console.log(`\n${index + 1}. ${url}`);
  try {
    const info = execSync(`vercel inspect ${url} 2>&1`, { encoding: 'utf-8' });
    // Look for date info
    if (info.includes('created') || info.includes('2024-10-31') || info.includes('Oct 31')) {
      console.log('   ✅ Possible Oct 31 deployment!');
    }
    // Extract key info
    const lines = info.split('\n');
    lines.slice(0, 15).forEach(line => {
      if (line.includes('created') || line.includes('date') || line.includes('time') || line.includes('commit')) {
        console.log(`   ${line}`);
      }
    });
  } catch (error) {
    console.log('   ⚠️  Could not fetch details');
  }
});

console.log('\n\n💡 To see full details:');
console.log('   1. Go to: https://vercel.com/dashboard');
console.log('   2. Click on your project');
console.log('   3. Click "Deployments" tab');
console.log('   4. Filter by Oct 31, 2024');
console.log('   5. Click on each deployment to see files and commits\n');


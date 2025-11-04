#!/usr/bin/env node
/**
 * Script to help download/view files from Oct 31 Vercel deployments
 */

console.log('📥 How to Access Your Oct 31 Work from Vercel:\n');

const deployments = [
  {
    url: 'https://nextjs-auth-8zwhnmrvg-david-gastelums-projects.vercel.app',
    id: 'dpl_CF4NEwxykLA6HqHC9hSUrkcMzR84',
    time: 'Nov 1, 10:45 PM (late Oct 31 evening)'
  },
  {
    url: 'https://nextjs-auth-4vfacu7hm-david-gastelums-projects.vercel.app',
    id: 'dpl_mwiLLEgZbeaHxwqAZfyAuZR6ZHjL',
    time: 'Nov 1, 3:10 PM'
  }
];

console.log('✅ Your Oct 31 deployments are STILL ACTIVE!\n');

deployments.forEach((dep, i) => {
  console.log(`${i + 1}. ${dep.url}`);
  console.log(`   Created: ${dep.time}`);
  console.log(`   ID: ${dep.id}`);
  console.log(`   🌐 View in browser: ${dep.url}`);
  console.log('');
});

console.log('\n📥 TO DOWNLOAD FILES FROM THESE DEPLOYMENTS:\n');

console.log('OPTION 1: Via Vercel Dashboard (Easiest)');
console.log('   1. Go to: https://vercel.com/dashboard');
console.log('   2. Click on project: nextjs-auth-app');
console.log('   3. Click "Deployments" tab');
console.log('   4. Find deployment by ID or URL');
console.log('   5. Click on the deployment');
console.log('   6. Click "Source" tab → See all files');
console.log('   7. Click "Download" or clone the repo\n');

console.log('OPTION 2: Via Vercel CLI');
console.log('   vercel pull <deployment-url>');
console.log('   OR');
console.log('   vercel inspect <deployment-url> --wait\n');

console.log('OPTION 3: View Source Code');
console.log('   Each deployment URL shows the built app.');
console.log('   Right-click → View Page Source to see HTML');
console.log('   Check Network tab for CSS/JS files\n');

console.log('💡 QUICK TEST:');
console.log('   Open these URLs in your browser:');
deployments.forEach(dep => {
  console.log(`   • ${dep.url}/cards`);
  console.log(`   • ${dep.url}/design-carousel`);
});

console.log('\n🎯 These deployments contain your Oct 31 evening work!');


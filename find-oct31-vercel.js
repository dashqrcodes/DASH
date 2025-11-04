#!/usr/bin/env node
/**
 * Script to find and help restore Oct 31 Vercel deployments
 */

const { execSync } = require('child_process');

console.log('🔍 Finding Oct 31 deployments on Vercel...\n');

// Get all deployments
const deployments = execSync('vercel ls 2>&1', { encoding: 'utf-8' });
const lines = deployments.split('\n');

const deploymentUrls = lines
  .filter(line => line.includes('https://nextjs-auth-'))
  .map(line => line.trim());

console.log(`Found ${deploymentUrls.length} deployments\n`);

console.log('📋 Checking each deployment for Oct 31 date...\n');

const oct31Deployments = [];

for (const url of deploymentUrls.slice(0, 15)) { // Check first 15
  try {
    const info = execSync(`vercel inspect "${url}" 2>&1`, { encoding: 'utf-8' });
    
    // Look for date info
    const createdMatch = info.match(/created\s+([^\n]+)/);
    if (createdMatch) {
      const created = createdMatch[1];
      console.log(`\n${url}`);
      console.log(`  Created: ${created}`);
      
      // Check if it's Oct 31 or Nov 1 (late Oct 31 evening)
      if (created.includes('Oct 31') || created.includes('2024-10-31') || 
          (created.includes('Nov 01') && created.includes('2025'))) {
        const idMatch = info.match(/id\s+([^\n]+)/);
        const id = idMatch ? idMatch[1].trim() : 'unknown';
        
        oct31Deployments.push({ url, id, created });
        console.log(`  ✅ OCT 31 DEPLOYMENT FOUND!`);
        console.log(`  ID: ${id}`);
      }
    }
  } catch (error) {
    // Skip errors
  }
}

console.log('\n\n==========================');
console.log('OCT 31 DEPLOYMENTS FOUND:');
console.log('==========================\n');

if (oct31Deployments.length > 0) {
  oct31Deployments.forEach((dep, i) => {
    console.log(`${i + 1}. ${dep.url}`);
    console.log(`   ID: ${dep.id}`);
    console.log(`   Created: ${dep.created}`);
    console.log(`   Access: ${dep.url}`);
    console.log('');
  });
  
  console.log('\n💡 TO RESTORE/ACCESS THESE DEPLOYMENTS:');
  console.log('   1. Open the URL in your browser to see the live version');
  console.log('   2. Or use: vercel inspect <deployment-url>');
  console.log('   3. Or go to Vercel dashboard → Deployments → Find by date');
  console.log('\n📥 TO DOWNLOAD FILES FROM DEPLOYMENT:');
  console.log('   Use Vercel dashboard:');
  console.log('   1. Go to https://vercel.com/dashboard');
  console.log('   2. Click on your project');
  console.log('   3. Find the deployment');
  console.log('   4. Click "Source" tab to see files');
  console.log('   5. Clone/download the code');
} else {
  console.log('No Oct 31 deployments found in recent list.');
  console.log('\n💡 Try checking Vercel dashboard directly:');
  console.log('   https://vercel.com/dashboard → Your Project → Deployments');
  console.log('   Filter by date: Oct 31, 2024');
}


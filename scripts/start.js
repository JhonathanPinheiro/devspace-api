#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure Prisma client is generated
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

async function start() {
  console.log('\n🚀 Starting devspace-api...');
  
  // Try to run migrations
  console.log('📦 Attempting database migrations...');
  try {
    execSync('npx prisma migrate deploy', { 
      stdio: 'inherit',
      cwd: path.dirname(__dirname) 
    });
    console.log('✅ Migrations completed successfully\n');
  } catch (error) {
    console.warn('\n⚠️  Migrations failed - this is expected on first deploy');
    console.warn('   The database may still be initializing in Railway');
    console.warn('   Continuing with server startup...\n');
  }

  // Start the server
  console.log('🌐 Starting HTTP server on port', process.env.PORT || 3333);
  try {
    execSync('node dist/server.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('❌ Server failed to start:', error.message);
    process.exit(1);
  }
}

start().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});

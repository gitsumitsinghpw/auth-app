#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🚀 Setting up OAuth Environment Variables...\n');

// Generate secure random secret
const generateSecret = () => crypto.randomBytes(32).toString('base64');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExamplePath = path.join(process.cwd(), '.env.example');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local already exists. Backup your current file before proceeding.\n');
}

if (!fs.existsSync(envExamplePath)) {
  console.log('❌ .env.example not found. Creating basic environment template...\n');
  
  const template = `# Database Configuration
MONGODB_URI=mongodb://localhost:27017/auth-app

# Authentication Secrets
NEXTAUTH_SECRET=${generateSecret()}
NEXTAUTH_URL=http://localhost:3000
JWT_SECRET=${generateSecret()}
IRON_PASSWORD=${generateSecret()}

# Google OAuth (Get from: https://console.cloud.google.com/)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth (Get from: https://github.com/settings/developers)
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here

# Environment
NODE_ENV=development`;

  fs.writeFileSync(envPath, template);
  console.log('✅ Created .env.local with secure secrets generated!\n');
} else {
  // Copy .env.example to .env.local and generate secrets
  let content = fs.readFileSync(envExamplePath, 'utf8');
  
  // Replace placeholder secrets with generated ones
  content = content.replace(/your-nextauth-secret-key-minimum-32-characters/g, generateSecret());
  content = content.replace(/your-jwt-secret-key-minimum-32-characters/g, generateSecret());
  content = content.replace(/your-iron-session-password-minimum-32-chars/g, generateSecret());
  
  fs.writeFileSync(envPath, content);
  console.log('✅ Created .env.local from template with secure secrets generated!\n');
}

console.log('📋 Next Steps:');
console.log('1. Edit .env.local and add your OAuth credentials:');
console.log('   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
console.log('   - GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET');
console.log('');
console.log('2. Setup instructions:');
console.log('   📖 Read OAUTH_SETUP.md for detailed setup guide');
console.log('   🔗 Google: https://console.cloud.google.com/');
console.log('   🔗 GitHub: https://github.com/settings/developers');
console.log('');
console.log('3. Restart your development server after adding credentials');
console.log('');
console.log('🎉 OAuth setup is ready! Just add your credentials and you\'re good to go!');

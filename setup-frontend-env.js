import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envTemplate = `# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
`;

const envPath = path.join(__dirname, '.env.local');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env.local file already exists. Please update it manually with the following template:');
  console.log('\n' + envTemplate);
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env.local file created successfully!');
  console.log('📝 Please update the .env.local file with your Google OAuth Client ID');
}

console.log('\n🔧 Frontend Setup Instructions:');
console.log('1. Copy your Google OAuth Client ID from Google Cloud Console');
console.log('2. Update VITE_GOOGLE_CLIENT_ID in .env.local file');
console.log('3. Restart your frontend development server'); 
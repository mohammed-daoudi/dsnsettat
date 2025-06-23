import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envTemplate = `# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=dsn_settat
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_at_least_32_characters

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASSWORD=your_16_character_app_password_here

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Please update it manually with the following template:');
  console.log('\n' + envTemplate);
} else {
  fs.writeFileSync(envPath, envTemplate);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the .env file with your actual credentials:');
  console.log('   - Gmail address and app password');
  console.log('   - MySQL password');
  console.log('   - JWT secret (generate a random string)');
}

console.log('\n🔧 Setup Instructions:');
console.log('1. Get Gmail app password from: https://myaccount.google.com/apppasswords');
console.log('2. Update the .env file with your real values');
console.log('3. Run: npm run setup (to set up the database)'); 
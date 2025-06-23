import { createPool } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  console.log('🚀 Setting up Academic Vault Database...\n');

  // Create connection without database first
  const connection = createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    // Read schema file
    const schemaPath = join(__dirname, 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Creating database schema...');
    
    // Execute schema
    const statements = schema.split(';').filter(stmt => stmt.trim());
    for (const statement of statements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database schema created successfully!\n');

    // Read seed file
    const seedPath = join(__dirname, 'database', 'seed.sql');
    const seed = readFileSync(seedPath, 'utf8');
    
    console.log('🌱 Seeding database with initial data...');
    
    // Execute seed data
    const seedStatements = seed.split(';').filter(stmt => stmt.trim());
    for (const statement of seedStatements) {
      if (statement.trim()) {
        await connection.execute(statement);
      }
    }
    
    console.log('✅ Database seeded successfully!\n');

    // Create uploads directory
    const uploadsDir = join(__dirname, 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('📁 Uploads directory created successfully!\n');
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
      console.log('📁 Uploads directory already exists!\n');
    }

    console.log('🎉 Database setup completed successfully!');
    console.log('\n📝 Default admin credentials can be found in backend/database/seed.sql');
    console.log('\n🚀 You can now start the server with: npm run dev:full');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

setupDatabase(); 
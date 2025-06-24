import { createClerkClient } from '@clerk/clerk-sdk-node';
import { createPool } from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

// Database connection
const db = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dsn_settat',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Sync existing database users with Clerk users
 * This function helps match existing users with their Clerk accounts
 */
async function syncUsersWithClerk() {
  try {
    console.log('🔄 Starting user synchronization with Clerk...');

    // Get all existing database users
    const [dbUsers] = await db.execute(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      WHERE deleted_at IS NULL
    `);

    console.log(`📊 Found ${dbUsers.length} users in database`);

    // Get all Clerk users
    const clerkUsers = await clerk.users.getUserList({ limit: 100 });
    console.log(`📊 Found ${clerkUsers.length} users in Clerk`);

    let matched = 0;
    let unmatched = 0;
    let clerksWithoutDb = 0;

    // Try to match database users with Clerk users by email
    for (const dbUser of dbUsers) {
      const clerkUser = clerkUsers.find(cu =>
        cu.emailAddresses.some(ea => ea.emailAddress === dbUser.email)
      );

      if (clerkUser) {
        // Update database user with clerk_id
        await db.execute(
          'UPDATE users SET clerk_id = ?, updated_at = NOW() WHERE id = ?',
          [clerkUser.id, dbUser.id]
        );

        // Update Clerk user with role metadata if not already set
        const currentRole = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role;
        if (!currentRole && dbUser.role) {
          await clerk.users.updateUserMetadata(clerkUser.id, {
            publicMetadata: { role: dbUser.role }
          });
          console.log(`✅ Updated role for ${dbUser.email}: ${dbUser.role}`);
        }

        matched++;
        console.log(`✅ Matched: ${dbUser.email} -> ${clerkUser.id}`);
      } else {
        unmatched++;
        console.log(`❌ No Clerk account found for: ${dbUser.email}`);
      }
    }

    // Find Clerk users without database records
    for (const clerkUser of clerkUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const dbUser = dbUsers.find(du => du.email === email);

      if (!dbUser && email) {
        clerksWithoutDb++;
        console.log(`🆕 Clerk user without DB record: ${email}`);

        // Optionally create database record for Clerk user
        const role = clerkUser.publicMetadata?.role || clerkUser.privateMetadata?.role || 'student';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() ||
                    email.split('@')[0];

        await db.execute(`
          INSERT INTO users (clerk_id, name, email, role, email_verified, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [clerkUser.id, name, email, role, true]);

        console.log(`✅ Created DB record for: ${email} with role: ${role}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`✅ Matched users: ${matched}`);
    console.log(`❌ Unmatched DB users: ${unmatched}`);
    console.log(`🆕 New DB records created: ${clerksWithoutDb}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

/**
 * Update roles for Clerk users based on email patterns or manual mapping
 */
async function updateClerkUserRoles(roleMapping = {}) {
  try {
    console.log('🔄 Updating Clerk user roles...');

    const clerkUsers = await clerk.users.getUserList({ limit: 100 });

    for (const user of clerkUsers) {
      const email = user.emailAddresses[0]?.emailAddress;
      if (!email) continue;

      let role = 'student'; // default role

      // Check manual mapping first
      if (roleMapping[email]) {
        role = roleMapping[email];
      }
      // Auto-assign based on email patterns
      else if (email.includes('admin') || email.includes('director')) {
        role = 'admin';
      } else if (email.includes('prof') || email.includes('teacher') || email.includes('instructor')) {
        role = 'teacher';
      }

      // Update metadata if role is different
      const currentRole = user.publicMetadata?.role || user.privateMetadata?.role;
      if (currentRole !== role) {
        await clerk.users.updateUserMetadata(user.id, {
          publicMetadata: { role: role }
        });
        console.log(`✅ Updated ${email}: ${currentRole || 'none'} -> ${role}`);
      }
    }

  } catch (error) {
    console.error('❌ Role update failed:', error);
  }
}

/**
 * Generate a report of current user status
 */
async function generateUserReport() {
  try {
    console.log('📊 Generating user report...\n');

    // Database stats
    const [dbStats] = await db.execute(`
      SELECT
        COUNT(*) as total_users,
        COUNT(clerk_id) as users_with_clerk,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
        COUNT(CASE WHEN role = 'student' THEN 1 END) as students
      FROM users
      WHERE deleted_at IS NULL
    `);

    const stats = dbStats[0];

    console.log('📊 Database Users:');
    console.log(`   Total: ${stats.total_users}`);
    console.log(`   With Clerk ID: ${stats.users_with_clerk}`);
    console.log(`   Admins: ${stats.admins}`);
    console.log(`   Teachers: ${stats.teachers}`);
    console.log(`   Students: ${stats.students}\n`);

    // Clerk stats
    const clerkUsers = await clerk.users.getUserList({ limit: 100 });
    const clerkRoles = {};

    clerkUsers.forEach(user => {
      const role = user.publicMetadata?.role || user.privateMetadata?.role || 'unknown';
      clerkRoles[role] = (clerkRoles[role] || 0) + 1;
    });

    console.log('📊 Clerk Users:');
    console.log(`   Total: ${clerkUsers.length}`);
    Object.entries(clerkRoles).forEach(([role, count]) => {
      console.log(`   ${role}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Report generation failed:', error);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'sync':
    await syncUsersWithClerk();
    break;
  case 'roles':
    // Example role mapping - customize as needed
    const roleMapping = {
      'admin@dsnsettat.com': 'admin',
      'director@dsnsettat.com': 'admin',
      // Add more mappings as needed
    };
    await updateClerkUserRoles(roleMapping);
    break;
  case 'report':
    await generateUserReport();
    break;
  default:
    console.log(`
Usage: node user-migration.js [command]

Commands:
  sync     - Sync database users with Clerk users
  roles    - Update Clerk user roles based on mapping
  report   - Generate user status report

Examples:
  node user-migration.js sync
  node user-migration.js roles
  node user-migration.js report
`);
}

// Close database connection
await db.end();

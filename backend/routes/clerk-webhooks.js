import express from 'express';
import { Webhook } from 'svix';
import { db } from '../server.js';

const router = express.Router();

// Middleware to parse raw body for webhook verification
const rawBodyMiddleware = express.raw({ type: 'application/json' });

// Clerk webhook handler
router.post('/webhooks/clerk', rawBodyMiddleware, async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      console.error('Missing CLERK_WEBHOOK_SECRET');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Get headers
    const svix_id = req.headers['svix-id'];
    const svix_timestamp = req.headers['svix-timestamp'];
    const svix_signature = req.headers['svix-signature'];

    // Check if headers exist
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: 'Missing webhook headers' });
    }

    // Get the body
    const body = req.body;

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // Verify the webhook
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      });
    } catch (err) {
      console.error('Webhook verification failed:', err);
      return res.status(400).json({ error: 'Webhook verification failed' });
    }

    // Handle the webhook
    const { type, data } = evt;

    console.log(`Webhook received: ${type}`);

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      default:
        console.log(`Unhandled webhook event: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle user creation
async function handleUserCreated(user) {
  try {
    const userId = user.id;
    const email = user.email_addresses?.[0]?.email_address;
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const name = `${firstName} ${lastName}`.trim() || email?.split('@')[0] || 'User';

    // Get role from metadata (default to 'student')
    const role = user.public_metadata?.role || user.private_metadata?.role || 'student';

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE clerk_id = ? OR email = ?',
      [userId, email]
    );

    if (existingUsers.length > 0) {
      console.log(`User already exists: ${email}`);
      return;
    }

    // Insert new user
    await db.execute(
      `INSERT INTO users (
        clerk_id, name, email, role, email_verified,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [userId, name, email, role, true]
    );

    console.log(`User created: ${email} with role: ${role}`);
  } catch (error) {
    console.error('Error handling user creation:', error);
  }
}

// Handle user updates
async function handleUserUpdated(user) {
  try {
    const userId = user.id;
    const email = user.email_addresses?.[0]?.email_address;
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    const name = `${firstName} ${lastName}`.trim() || email?.split('@')[0] || 'User';

    // Get role from metadata
    const role = user.public_metadata?.role || user.private_metadata?.role || 'student';

    // Update existing user
    await db.execute(
      `UPDATE users SET
        name = ?, email = ?, role = ?, updated_at = NOW()
      WHERE clerk_id = ?`,
      [name, email, role, userId]
    );

    console.log(`User updated: ${email}`);
  } catch (error) {
    console.error('Error handling user update:', error);
  }
}

// Handle user deletion
async function handleUserDeleted(user) {
  try {
    const userId = user.id;

    // Soft delete by marking user as deleted or hard delete
    // For this example, we'll soft delete by setting a deleted_at timestamp
    await db.execute(
      'UPDATE users SET deleted_at = NOW() WHERE clerk_id = ?',
      [userId]
    );

    console.log(`User deleted: ${userId}`);
  } catch (error) {
    console.error('Error handling user deletion:', error);
  }
}

export default router;

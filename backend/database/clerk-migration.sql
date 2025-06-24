-- Clerk Integration Migration
-- This script adds Clerk-related fields to the existing users table

-- Add clerk_id field to users table
ALTER TABLE users
ADD COLUMN clerk_id VARCHAR(255) UNIQUE AFTER id;

-- Add deleted_at field for soft deletion
ALTER TABLE users
ADD COLUMN deleted_at TIMESTAMP NULL;

-- Update email_verified to be compatible with Clerk (already verified users from Clerk)
ALTER TABLE users
MODIFY COLUMN email_verified TINYINT DEFAULT 1;

-- Make password optional (since Clerk handles authentication)
ALTER TABLE users
MODIFY COLUMN password VARCHAR(255) NULL;

-- Create index on clerk_id for better performance
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Create index on deleted_at for soft deletion queries
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Optional: Update existing users to be compatible with Clerk
-- (This would be run manually based on your migration strategy)
-- UPDATE users SET email_verified = 1 WHERE email_verified = 0;

-- Add constraint to ensure either clerk_id or password exists (hybrid authentication)
-- ALTER TABLE users ADD CONSTRAINT chk_auth_method
-- CHECK (clerk_id IS NOT NULL OR password IS NOT NULL);

# Clerk Authentication Integration Setup Guide

## Overview

This guide covers the setup and migration to Clerk authentication for the DSN Settat Academic Vault project. The integration provides a hybrid approach that supports both Clerk authentication and legacy JWT authentication during the transition period.

## ✅ What's Already Implemented

### Frontend Integration
- ✅ Clerk React components and hooks integrated
- ✅ All components updated to use Clerk authentication
- ✅ Role-based access control using Clerk metadata
- ✅ Protected routes using Clerk

### Backend Integration
- ✅ Clerk Node.js SDK installed and configured
- ✅ Hybrid authentication middleware (supports both Clerk and legacy JWT)
- ✅ Clerk webhook handlers for user synchronization
- ✅ Database schema migration for Clerk compatibility
- ✅ User migration utilities
- ✅ Role-based access control with Clerk metadata

## 🚀 Setup Instructions

### 1. Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Choose your preferred authentication methods (Email/Password, Google, etc.)
4. Note down your API keys

### 2. Environment Configuration

Update your environment files with Clerk credentials:

**Frontend (.env):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
```

**Backend (.env):**
```env
CLERK_SECRET_KEY=sk_test_your_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Database Migration

Run the database migration to add Clerk-related fields:

```bash
cd backend
mysql -u your_user -p your_database < database/clerk-migration.sql
```

### 4. Clerk Webhook Setup

1. In Clerk Dashboard, go to Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy the webhook secret to your environment variables

### 5. User Migration

Use the migration script to sync existing users with Clerk:

```bash
cd backend

# Generate a report of current users
node scripts/user-migration.js report

# Sync database users with Clerk users
node scripts/user-migration.js sync

# Update Clerk user roles
node scripts/user-migration.js roles
```

### 6. Start the Application

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 🔧 Configuration Options

### Role Assignment

Users can be assigned roles in three ways:

1. **Automatic (Email patterns):**
   - `admin@domain.com` → admin role
   - `prof.name@domain.com` → teacher role
   - Others → student role

2. **Manual mapping in migration script:**
   ```javascript
   const roleMapping = {
     'director@dsnsettat.com': 'admin',
     'prof.smith@dsnsettat.com': 'teacher'
   };
   ```

3. **Via Clerk Dashboard:**
   - Edit user metadata in Clerk Dashboard
   - Add `role` field to public metadata

### Authentication Flow

The system supports hybrid authentication:

1. **Clerk Authentication (Primary):** For new users and migrated accounts
2. **Legacy JWT (Fallback):** For existing sessions during transition

## 📊 Migration Strategies

### Option 1: Gradual Migration
- Keep both authentication systems running
- Migrate users gradually as they log in
- Use hybrid authentication middleware

### Option 2: Complete Migration
- Export all existing users
- Create Clerk accounts for all users
- Force all users to sign up through Clerk
- Disable legacy authentication

### Option 3: Hybrid Permanent
- Use Clerk for new registrations
- Keep legacy system for existing users
- Maintain both systems long-term

## 🧪 Testing

### Test Authentication Flows

1. **New User Registration:**
   - Register with Clerk
   - Verify user appears in database
   - Check role assignment

2. **Existing User Login:**
   - Test legacy JWT authentication
   - Test Clerk authentication for migrated users

3. **Role-Based Access:**
   - Test admin access to admin features
   - Test teacher access to submission reviews
   - Test student access restrictions

4. **API Endpoints:**
   - Test protected routes with Clerk tokens
   - Test protected routes with legacy JWT tokens
   - Verify proper error handling

### Test Commands

```bash
# Test user migration
node scripts/user-migration.js report

# Test authentication endpoints
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
     http://localhost:5000/api/submissions

# Test webhook endpoint
curl -X POST http://localhost:5000/api/webhooks/clerk \
     -H "Content-Type: application/json" \
     -d '{"test": "webhook"}'
```

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid token" errors:**
   - Check if Clerk secret key is correct
   - Verify token format (should start with Clerk's format)
   - Check token expiration

2. **User not found in database:**
   - Run user migration script
   - Check webhook endpoint is receiving events
   - Verify database connection

3. **Role access denied:**
   - Check user metadata in Clerk Dashboard
   - Verify role is set in public or private metadata
   - Check role values match expected roles

4. **Webhook verification failed:**
   - Verify webhook secret is correct
   - Check webhook URL is accessible
   - Ensure raw body parsing for webhook endpoint

### Debug Commands

```bash
# Check user status
node scripts/user-migration.js report

# Test database connection
mysql -u your_user -p -e "SELECT COUNT(*) FROM users;"

# Check Clerk user metadata
# (Use Clerk Dashboard or API)
```

## 📝 Next Steps

1. **Complete Testing:** Test all authentication flows thoroughly
2. **Remove Legacy Code:** Once confident, remove old authentication files
3. **Update Documentation:** Update API documentation with Clerk authentication
4. **Monitor:** Set up monitoring for authentication failures
5. **Backup:** Ensure user data is backed up before final migration

## 🔗 Useful Links

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React Hooks](https://clerk.com/docs/references/react/overview)
- [Clerk Node.js SDK](https://clerk.com/docs/references/nodejs/overview)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)

## 📧 Support

For issues or questions:
1. Check Clerk documentation
2. Review error logs in browser console and server logs
3. Test with curl commands
4. Check user migration script output

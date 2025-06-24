import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createClerkClient } from '@clerk/clerk-sdk-node';

// Initialize Clerk client
const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '24h' }
  );
};

export const verifyClerkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify the Clerk session token
    const payload = await clerk.verifyToken(token);

    // Get user details from Clerk
    const user = await clerk.users.getUser(payload.sub);

    // Extract role from user metadata
    const role = user.publicMetadata?.role || user.privateMetadata?.role || 'student';

    // Set user info in request
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
      clerkUser: user
    };

    next();
  } catch (error) {
    console.error('Clerk token verification error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireClerkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// Hybrid authentication middleware - tries Clerk first, falls back to legacy JWT
export const hybridAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Try Clerk authentication first
    const payload = await clerk.verifyToken(token);
    const user = await clerk.users.getUser(payload.sub);

    // Extract role from user metadata
    const role = user.publicMetadata?.role || user.privateMetadata?.role || 'student';

    // Set user info in request (Clerk format)
    req.user = {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: role,
      authType: 'clerk',
      clerkUser: user
    };

    next();
  } catch (clerkError) {
    // Fall back to legacy JWT authentication
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      req.user = {
        ...decoded,
        authType: 'legacy'
      };
      next();
    } catch (jwtError) {
      console.error('Both Clerk and JWT authentication failed:', { clerkError: clerkError.message, jwtError: jwtError.message });
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
};

// Hybrid role checking middleware
export const hybridRequireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

-- Academic Vault Database Schema

-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  google_id VARCHAR(255) UNIQUE,
  email_verified TINYINT DEFAULT 0,
  email_verification_token VARCHAR(255),
  email_verification_expires DATETIME,
  password_reset_token VARCHAR(255),
  password_reset_expires DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Professors table
CREATE TABLE professors (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  department VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Modules table
CREATE TABLE modules (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(10) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Submissions table
CREATE TABLE submissions (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_name VARCHAR(255),
  file_size BIGINT,
  author_id VARCHAR(36) NOT NULL,
  supervisor_id VARCHAR(36) NOT NULL,
  module_id VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES professors(id) ON DELETE CASCADE,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE
);

-- IP Usage Logs table
CREATE TABLE ip_usage_logs (
  id VARCHAR(36) PRIMARY KEY,
  ip_rights_id VARCHAR(36),
  submission_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('download', 'view')),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  purpose TEXT,
  approved TINYINT DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_submissions_author ON submissions(author_id);
CREATE INDEX idx_submissions_supervisor ON submissions(supervisor_id);
CREATE INDEX idx_submissions_module ON submissions(module_id);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_ip_logs_submission ON ip_usage_logs(submission_id);
CREATE INDEX idx_ip_logs_user ON ip_usage_logs(user_id);
CREATE INDEX idx_ip_logs_timestamp ON ip_usage_logs(timestamp); 
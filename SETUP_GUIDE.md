# 🚀 Complete Setup Guide: Email Verification Only

## 📋 **Prerequisites**
- Node.js and npm installed
- MySQL database running
- Gmail account (for sending emails)

---

## 📧 **Step 1: Email Configuration (Gmail)**

### 1.1 Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable "2-Step Verification" if not already enabled

### 1.2 Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (Custom name)"
3. Name: `Academic Vault`
4. Click "Generate"
5. **Copy the 16-character password**

---

## ⚙️ **Step 2: Environment Configuration**

### 2.1 Backend Environment
1. Navigate to the `backend` folder
2. Run: `node setup-env.js`
3. Edit the `.env` file with your real values:

```env
# Database Configuration
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
```

### 2.2 Frontend Environment
1. Navigate to the project root
2. Run: `node setup-frontend-env.js`
3. Edit the `.env.local` file:

```env
# Frontend Environment Variables
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🗄️ **Step 3: Database Setup**

### 3.1 Create Database
1. Open MySQL Workbench or phpMyAdmin
2. Create a new database named `dsn_settat`
3. Run the SQL from `backend/database/schema.sql`

### 3.2 Run Setup Script
```bash
cd backend
npm run setup
```

---

## 🚀 **Step 4: Start the Application**

### 4.1 Start Backend
```bash
cd backend
npm install
npm run dev
```

### 4.2 Start Frontend
```bash
# In a new terminal
npm install
npm run dev
```

---

## 🧪 **Step 5: Test the Setup**

### 5.1 Test Email Registration
1. Go to `http://localhost:5173/login`
2. Click "Sign up"
3. Fill in your details
4. Check your email for verification link
5. Click the verification link

### 5.2 Test Email Functionality
- Registration emails should be sent to your inbox
- All emails should come from your configured Gmail address

---

## 🔍 **Troubleshooting**

### Common Issues:

#### 1. **Email Not Sending**
- Double-check your Gmail app password and email address in the `.env` file
- Make sure less secure app access is enabled if using a non-app password
- Check your spam folder

#### 2. **Database Connection Issues**
- Make sure MySQL is running and credentials are correct
- Check that the database `dsn_settat` exists

#### 3. **Frontend/Backend Not Connecting**
- Make sure the API base URL in `.env.local`
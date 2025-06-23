# Academic Intellectual Vault

A comprehensive academic submission management system with IP rights tracking and user role management.

## Features

- **User Management**: Student, Teacher, and Admin roles
- **Submission Management**: Upload, review, and approve academic submissions
- **IP Rights Tracking**: Monitor document access and downloads
- **File Upload**: Support for PDF, DOC, and DOCX files
- **Real-time Dashboard**: Analytics and statistics
- **Secure Authentication**: JWT-based authentication with role-based access

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Shadcn/ui components
- React Query for data fetching
- React Router for navigation

### Backend
- Node.js with Express
- MySQL database
- JWT authentication
- Multer for file uploads
- bcryptjs for password hashing

## Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd academic-intellectual-vault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Database Setup

#### Option A: Using the setup script (Recommended)
```bash
npm run setup:db
```

#### Option B: Manual setup
1. Create a MySQL database named `dsn_settat`
2. Run the schema file: `backend/database/schema.sql`
3. Run the seed file: `backend/database/seed.sql`

### 4. Environment Configuration

Create a `.env` file in the root directory:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dsn_settat

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:8080

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./backend/uploads
```

### 5. Start the application

#### Development mode (both frontend and backend)
```bash
npm run dev:full
```

#### Or start separately:
```bash
# Backend only
npm run server:dev

# Frontend only (in another terminal)
npm run dev
```

## Default Login Credentials

- **Student**: `ahmed.benali@student.ma` / `password123`
- **Teacher**: `riad.chakir@university.ma` / `password123`
- **Admin**: `admin@university.ma` / `password123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Professors
- `GET /api/professors` - Get all professors
- `GET /api/professors/:id` - Get professor by ID
- `POST /api/professors` - Create professor (admin only)
- `PUT /api/professors/:id` - Update professor (admin only)
- `DELETE /api/professors/:id` - Delete professor (admin only)

### Modules
- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create module (admin only)
- `PUT /api/modules/:id` - Update module (admin only)
- `DELETE /api/modules/:id` - Delete module (admin only)

### Submissions
- `GET /api/submissions` - Get all submissions (with filters)
- `GET /api/submissions/:id` - Get submission by ID
- `POST /api/submissions` - Create submission (with file upload)
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

### IP Usage Logs
- `GET /api/ip-usage` - Get all logs (admin only)
- `POST /api/ip-usage` - Create access log
- `GET /api/ip-usage/stats` - Get usage statistics (admin only)
- `PUT /api/ip-usage/:id/approve` - Approve/reject access (admin only)

## Project Structure

```
academic-intellectual-vault/
├── backend/
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── professors.js
│   │   ├── modules.js
│   │   ├── submissions.js
│   │   └── ipUsage.js
│   ├── uploads/
│   ├── server.js
│   └── setup.js
├── src/
│   ├── components/
│   ├── contexts/
│   ├── pages/
│   ├── services/
│   │   └── api.ts
│   └── types/
├── package.json
└── README.md
```

## Development

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server:dev` - Start backend development server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run setup:db` - Initialize database
- `npm run lint` - Run ESLint

### Database Migrations

To modify the database schema:
1. Update `backend/database/schema.sql`
2. Run `npm run setup:db` to recreate the database
3. Or manually apply changes to your existing database

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- CORS configuration
- Helmet security headers
- File upload validation

## File Upload

The system supports:
- PDF files
- Microsoft Word documents (DOC, DOCX)
- Maximum file size: 10MB (configurable)

Files are stored in `backend/uploads/` and served statically.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

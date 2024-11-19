# Video Tracking Application Documentation

## Table of Contents
1. [Environment Setup](#environment-setup)
2. [Installation](#installation)
3. [API Documentation](#api-documentation)
   - [Authentication Routes](#authentication-routes)
   - [User Routes](#user-routes)
   - [Playlist Routes](#playlist-routes)
   - [Health Check Routes](#health-check-routes)
   - [Super Admin Routes](#super-admin-routes)
4. [Response Formats](#response-formats)
5. [Project Structure](#project-structure)
6. [Key Features](#key-features)
7. [Deployment Notes](#deployment-notes)

## Environment Setup

Create a `.env` file in the root directory with the following configuration:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your_database
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
YOUTUBE_API_KEY=your_youtube_api_key_here
CACHE_DURATION=3600
```

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
cd backend
npm install

# Start the development server
npm run dev
```

## API Documentation

### Authentication Routes

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| POST | `/api/auth/register` | Register new user | None | `{ "username": string, "email": string, "password": string }` |
| POST | `/api/auth/login` | User login | None | `{ "email": string, "password": string }` |
| POST | `/api/auth/login-with-code` | Request login code | None | `{ "email": string }` |
| POST | `/api/auth/verify-login-code` | Verify email code | None | `{ "email": string, "code": string }` |
| POST | `/api/auth/logout` | Logout current session | `Authorization: Bearer <token>` | None |
| POST | `/api/auth/logout-all` | Logout all devices | `Authorization: Bearer <token>` | None |
| POST | `/api/auth/forgot-password` | Reset password request | None | `{ "email": string }` |
| POST | `/api/auth/reset-password/:token` | Reset password | None | `{ "password": string }` |
| POST | `/api/auth/change-password` | Change password | `Authorization: Bearer <token>` | `{ "currentPassword": string, "newPassword": string }` |

### User Routes

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| GET | `/api/users/profile` | Get user profile | `Authorization: Bearer <token>` | None |
| PUT | `/api/users/profile` | Update profile | `Authorization: Bearer <token>` | `{ "username": string, "email": string }` |
| DELETE | `/api/users/account` | Delete account | `Authorization: Bearer <token>` | None |
| GET | `/api/users/stats` | Get user stats | `Authorization: Bearer <token>` | None |

### Playlist Routes

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| POST | `/api/playlists` | Add playlist | `Authorization: Bearer <token>` | `{ "playlistId": string }` |
| GET | `/api/playlists` | Get all playlists | `Authorization: Bearer <token>` | None |
| GET | `/api/playlists/:playlistId/videos` | Get playlist videos | `Authorization: Bearer <token>` | None |
| PUT | `/api/playlists/:playlistId` | Update playlist | `Authorization: Bearer <token>` | `{ "title": string, ... }` |
| PATCH | `/api/playlists/videos/:videoId/watched` | Update video status | `Authorization: Bearer <token>` | `{ "watched": boolean }` |
| PATCH | `/api/playlists/:playlistId/watch-all` | Update all videos | `Authorization: Bearer <token>` | `{ "watched": boolean }` |

### Health Check Routes

| Method | Endpoint | Description | Headers | Body |
|--------|----------|-------------|---------|------|
| GET | `/api/health` | Basic health check | None | None |
| GET | `/api/health/detailed` | Detailed health check | `Authorization: Bearer <token>` | None |

### Super Admin Routes

All super admin routes require authentication with the super admin token:
`Authorization: Bearer <token>`

| Method | Endpoint | Description | Body/Params |
|--------|----------|-------------|-------------|
| POST | `/api/super-admin/initialize` | Initialize super admin | `{ "username": string, "password": string }` |
| POST | `/api/super-admin/login` | Super admin login | `{ "username": string, "password": string }` |
| GET | `/api/super-admin/stats` | System statistics | None |
| GET | `/api/super-admin/logs` | System logs | Query: `type`, `limit` |
| GET | `/api/super-admin/users` | Manage users | Query: `page`, `limit` |

## Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    // Error details
  }
}
```

## Project Structure
```
backend/
├── config/            # Configuration files
├── controllers/       # Route controllers
├── middleware/        # Custom middleware
├── models/           # Database models
├── routes/           # API routes
├── services/         # Business logic
├── utils/            # Utility functions
├── .env              # Environment variables
├── .env.example      # Example environment
├── .gitignore        # Git ignore file
├── app.js            # Express app setup
├── index.js          # Server entry point
└── package.json      # Dependencies
```

## Key Features
- Email-based authentication
- Token-based session management
- YouTube playlist integration
- Video progress tracking
- Response caching
- Comprehensive error handling
- Health monitoring
- Super admin capabilities
  - System statistics
  - Log monitoring
  - User management
  - Access control

## Deployment Notes

### Development Setup
- Update `.env` with your credentials
- Use MongoDB Compass for database management
- Test API endpoints with Postman

### Production Deployment
- Use MongoDB Atlas for database hosting
- Implement proper security measures
- Monitor system logs and statistics
- Regular backup procedures

### Super Admin Setup
1. Initialize super admin account on first deployment
2. Regularly monitor system health through admin dashboard
3. Review logs for security and performance issues
4. Track user engagement metrics
5. Manage user accounts as needed

### Security Best Practices
1. Regular password rotation
2. Monitor failed login attempts
3. Review system access logs
4. Track API usage patterns
5. Implement rate limiting
6. Regular security audits
# TaskManager Backend API

A Node.js backend API for the TaskManager React Native application, built with Express.js and MongoDB.

## Features

- **User Authentication**: JWT-based authentication with email/password and Google Sign-In
- **Task Management**: Full CRUD operations for tasks with advanced filtering and sorting
- **User Management**: Profile management, password changes, and account deletion
- **Statistics**: Task and user statistics with analytics
- **Bulk Operations**: Bulk update and delete tasks
- **Validation**: Comprehensive input validation using express-validator
- **Security**: Password hashing, JWT tokens, and CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, cors, compression

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/taskmanager
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/google` | Google Sign-In |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-password` | Change password |
| POST | `/api/auth/logout` | Logout user |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create a new task |
| GET | `/api/tasks` | Get all tasks (with filtering) |
| GET | `/api/tasks/:id` | Get task by ID |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task completion |
| GET | `/api/tasks/overdue` | Get overdue tasks |
| GET | `/api/tasks/upcoming` | Get upcoming tasks |
| GET | `/api/tasks/stats` | Get task statistics |
| PUT | `/api/tasks/bulk/update` | Bulk update tasks |
| DELETE | `/api/tasks/bulk/delete` | Bulk delete tasks |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get user profile |
| PUT | `/api/users/profile` | Update user profile |
| PUT | `/api/users/change-password` | Change password |
| GET | `/api/users/stats` | Get user statistics |
| GET | `/api/users/activity` | Get user activity |
| DELETE | `/api/users/account` | Delete user account |

## API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
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
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message",
      "value": "invalid value"
    }
  ]
}
```

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Database Models

### User Model
- `email` (required, unique)
- `password` (required, hashed)
- `displayName` (optional)
- `googleId` (optional, for Google Sign-In)
- `avatar` (optional)
- `isActive` (boolean, default: true)
- `lastLogin` (date)
- `createdAt`, `updatedAt` (timestamps)

### Task Model
- `title` (required)
- `description` (optional)
- `dueDate` (required)
- `priority` (enum: low, medium, high)
- `isCompleted` (boolean, default: false)
- `userId` (required, reference to User)
- `category` (optional)
- `tags` (array of strings)
- `attachments` (array of objects)
- `notes` (optional)
- `completedAt` (date, when task was completed)
- `createdAt`, `updatedAt` (timestamps)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/taskmanager |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRE` | JWT expiration time | 7d |
| `CORS_ORIGIN` | CORS allowed origin | http://localhost:3000 |

## Development

### Running Tests
```bash
npm test
```

### Code Structure
```
backend/
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── utils/           # Utility functions
├── server.js        # Main server file
├── package.json     # Dependencies
└── README.md        # This file
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all inputs
- **CORS Protection**: Configurable CORS settings
- **Helmet**: Security headers
- **Rate Limiting**: Built-in rate limiting (can be added)
- **SQL Injection Protection**: MongoDB with Mongoose prevents injection

## Error Handling

The API includes comprehensive error handling:
- Validation errors with detailed field information
- Authentication errors
- Database errors
- General server errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

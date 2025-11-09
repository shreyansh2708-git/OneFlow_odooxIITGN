# OneFlow Setup Guide

## Quick Start

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example and update values)
# Update database credentials and JWT secret

# Initialize database
npm run init-db

# Start server
npm start
```

### 2. Frontend Setup

```bash
# Navigate to root directory
cd ..

# Install dependencies
npm install

# Create .env file (optional, for custom API URL)
echo "VITE_API_URL=http://localhost:3001/api" > .env

# Start development server
npm run dev
```

## Database Configuration

1. Make sure MySQL is running
2. Update `.env` file in `backend/` directory with your MySQL credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=oneflow_db
   ```

## Default Users

After running `npm run init-db`, you can login with:

- **Admin**: admin@oneflow.com / admin123
- **Project Manager**: pm@oneflow.com / pm123
- **Team Member**: team@oneflow.com / team123
- **Sales/Finance**: sales@oneflow.com / sales123

## Troubleshooting

### Database Connection Issues

1. Check if MySQL is running
2. Verify database credentials in `.env` file
3. Make sure the database user has permissions to create databases

### API Connection Issues

1. Make sure backend server is running on port 3001
2. Check CORS settings if accessing from different origin
3. Verify API URL in frontend `.env` file

### Port Conflicts

- Backend default port: 3001 (change in `backend/.env`)
- Frontend default port: 8080 (change in `vite.config.ts`)

## Production Deployment

### Backend
1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Use process manager like PM2

### Frontend
1. Build: `npm run build`
2. Serve the `dist/` folder using a web server (nginx, Apache, etc.)
3. Configure API URL in environment variables


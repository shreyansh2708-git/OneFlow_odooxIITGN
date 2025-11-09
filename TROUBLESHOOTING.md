# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Invalid Credentials" Error

#### Check Backend Server
1. Make sure the backend server is running:
   ```bash
   cd backend
   npm run dev
   ```
   You should see: `🚀 Server running on http://localhost:3001`

2. Check if the server is accessible:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"OK","message":"OneFlow API is running"}`

#### Check Database Connection
1. Run the setup checker:
   ```bash
   cd backend
   node check-setup.js
   ```

2. Verify MySQL is running:
   - Windows: Check Services for MySQL
   - Check if MySQL service is started

3. Check .env file:
   ```bash
   cd backend
   cat .env
   ```
   Make sure:
   - `PORT=3001` (not 3000)
   - `DB_PASSWORD` is correct
   - `DB_HOST=localhost`
   - `DB_USER=root` (or your MySQL username)

#### Check Frontend API URL
1. Make sure frontend is pointing to correct backend:
   - Check `src/lib/api.ts` - should use `http://localhost:3001/api`
   - Or set `VITE_API_URL=http://localhost:3001/api` in frontend `.env`

### 2. Database Connection Errors

#### Initialize Database
```bash
cd backend
npm run init-db
```

#### Check MySQL Credentials
1. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```
   Enter your password when prompted

2. If connection fails, check:
   - MySQL service is running
   - Username and password are correct
   - MySQL port (default 3306) is not blocked

### 3. Port Conflicts

#### Backend Port (3001)
If port 3001 is already in use:
1. Change PORT in `backend/.env`:
   ```
   PORT=3002
   ```
2. Update frontend `src/lib/api.ts`:
   ```typescript
   const API_BASE_URL = 'http://localhost:3002/api';
   ```

#### Frontend Port (5173)
If port 5173 is in use, Vite will automatically use the next available port.

### 4. CORS Errors

If you see CORS errors in browser console:
1. Check backend `server.js` has CORS enabled:
   ```javascript
   app.use(cors());
   ```

### 5. Authentication Token Issues

#### Clear Stored Token
1. Open browser DevTools
2. Go to Application > Local Storage
3. Delete `oneflow_token`
4. Refresh and login again

#### Check JWT Secret
Make sure `JWT_SECRET` in `backend/.env` matches (for token validation).

## Quick Fix Script

Run this to check and fix common issues:

```bash
cd backend
node check-setup.js
```

## Default Login Credentials

After running `npm run init-db`:

- **Admin**: `admin@oneflow.com` / `admin123`
- **Project Manager**: `pm@oneflow.com` / `pm123`
- **Team Member**: `team@oneflow.com` / `team123`
- **Sales/Finance**: `sales@oneflow.com` / `sales123`

## Still Having Issues?

1. Check backend console for errors
2. Check browser console for errors
3. Verify MySQL is running and accessible
4. Check firewall settings
5. Verify all environment variables are set correctly


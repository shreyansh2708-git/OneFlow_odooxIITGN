# Fix Invalid Credentials Error

## Quick Fix Steps

### 1. Fix PORT Configuration
The .env file had PORT=3000 but the server uses 3001. This has been automatically fixed by running the setup script.

**Manual fix if needed:**
1. Open `backend/.env`
2. Change `PORT=3000` to `PORT=3001`
3. Save the file

### 2. Verify Database Connection
```bash
# From project root
cd backend
node scripts/initDatabase.js
```

This will:
- Create the database if it doesn't exist
- Create all tables
- Create default users with passwords

### 3. Start Backend Server
```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:3001
```

### 4. Test Backend API
Open in browser: http://localhost:3001/api/health

Should return:
```json
{"status":"OK","message":"OneFlow API is running"}
```

### 5. Use Correct Login Credentials

After running `npm run init-db`, use these credentials:

- **Admin**: `admin@oneflow.com` / `admin123`
- **Project Manager**: `pm@oneflow.com` / `pm123`
- **Team Member**: `team@oneflow.com` / `team123`
- **Sales/Finance**: `sales@oneflow.com` / `sales123`

## Common Issues

### Issue: "Invalid credentials" when logging in

**Solution:**
1. Make sure backend server is running on port 3001
2. Check browser console for API errors
3. Verify you're using the correct email/password
4. Clear browser localStorage:
   - Open DevTools (F12)
   - Application > Local Storage
   - Delete `oneflow_token`
   - Refresh and try again

### Issue: Database connection error

**Solution:**
1. Make sure MySQL is running
2. Check `backend/.env` file:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_actual_password
   DB_NAME=oneflow_db
   ```
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```
4. Run database initialization:
   ```bash
   cd backend
   npm run init-db
   ```

### Issue: Backend not responding

**Solution:**
1. Check if port 3001 is available:
   ```bash
   netstat -ano | findstr :3001
   ```
2. If port is in use, change PORT in `.env` to another port (e.g., 3002)
3. Update frontend `src/lib/api.ts` to match the new port

### Issue: CORS errors in browser

**Solution:**
- Backend has CORS enabled in `server.js`
- Make sure backend is running
- Check that frontend is calling the correct API URL: `http://localhost:3001/api`

## Verification Steps

1. ✅ Backend server running on http://localhost:3001
2. ✅ Database connected (check backend console)
3. ✅ Health endpoint working: http://localhost:3001/api/health
4. ✅ Database initialized: `npm run init-db`
5. ✅ Using correct credentials from init-db output

## Still Not Working?

1. Check backend console for error messages
2. Check browser console (F12) for API errors
3. Verify MySQL service is running
4. Check `.env` file has correct database credentials
5. Make sure you're using the email/password shown after running `npm run init-db`

## API Endpoints

- Health: `GET http://localhost:3001/api/health`
- Login: `POST http://localhost:3001/api/auth/login`
- Signup: `POST http://localhost:3001/api/auth/signup`
- Get Me: `GET http://localhost:3001/api/auth/me` (requires token)

## Testing Login with curl

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@oneflow.com\",\"password\":\"admin123\"}"
```

Should return a token and user object.


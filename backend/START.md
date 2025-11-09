# Quick Start Guide

## 1. Fix Configuration Issues

Run the setup checker to automatically fix common issues:

```bash
cd backend
node check-setup.js
```

This will:
- ✅ Check and fix PORT in .env (should be 3001)
- ✅ Test database connection
- ✅ Verify database exists

## 2. Initialize Database

If database is not initialized:

```bash
cd backend
npm run init-db
```

This creates:
- Database `oneflow_db`
- All required tables
- Default users

## 3. Start Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected
🚀 Server running on http://localhost:3001
📊 API endpoints available at http://localhost:3001/api
```

## 4. Start Frontend

In a new terminal:

```bash
npm run dev
```

## 5. Login

Use default credentials:
- **Admin**: `admin@oneflow.com` / `admin123`
- **PM**: `pm@oneflow.com` / `pm123`
- **Team**: `team@oneflow.com` / `team123`
- **Sales**: `sales@oneflow.com` / `sales123`

## Troubleshooting

### "Invalid Credentials" Error

1. **Check backend is running**: 
   - Open http://localhost:3001/api/health
   - Should return: `{"status":"OK","message":"OneFlow API is running"}`

2. **Check database**:
   - Make sure MySQL is running
   - Verify credentials in `.env` file
   - Run `npm run init-db` if needed

3. **Check frontend API URL**:
   - Should be `http://localhost:3001/api`
   - Check browser console for errors

### Database Connection Error

1. Verify MySQL is running
2. Check `.env` file:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=oneflow_db
   ```
3. Test MySQL connection:
   ```bash
   mysql -u root -p
   ```

### Port Already in Use

If port 3001 is in use:
1. Change PORT in `backend/.env` to another port (e.g., 3002)
2. Update `src/lib/api.ts` to use the new port

## Common Issues

- **PORT mismatch**: Backend .env has PORT=3000 but server uses 3001
  - Solution: Run `node check-setup.js` to fix automatically

- **Database not found**: Run `npm run init-db`

- **Invalid credentials**: Make sure you're using the correct email/password from init-db output

- **CORS errors**: Backend has CORS enabled, check if server is running


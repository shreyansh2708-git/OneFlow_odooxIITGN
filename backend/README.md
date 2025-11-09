# OneFlow Backend API

Backend API for OneFlow project management system built with Node.js, Express, and MySQL.

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret in `.env`

3. **Initialize database:**
   ```bash
   npm run init-db
   ```
   This will create the database, tables, and default users.

4. **Start the server:**
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## Default Users

After running `npm run init-db`, you can login with:

- **Admin**: admin@oneflow.com / admin123
- **Project Manager**: pm@oneflow.com / pm123
- **Team Member**: team@oneflow.com / team123
- **Sales/Finance**: sales@oneflow.com / sales123

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (optional: ?projectId=1)
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Sales Orders
- `GET /api/sales-orders` - Get all sales orders (optional: ?projectId=1)
- `POST /api/sales-orders` - Create sales order
- `PUT /api/sales-orders/:id` - Update sales order
- `DELETE /api/sales-orders/:id` - Delete sales order

### Purchase Orders
- `GET /api/purchase-orders` - Get all purchase orders (optional: ?projectId=1)
- `POST /api/purchase-orders` - Create purchase order
- `PUT /api/purchase-orders/:id` - Update purchase order
- `DELETE /api/purchase-orders/:id` - Delete purchase order

### Invoices
- `GET /api/invoices` - Get all customer invoices (optional: ?projectId=1)
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Vendor Bills
- `GET /api/vendor-bills` - Get all vendor bills (optional: ?projectId=1)
- `POST /api/vendor-bills` - Create vendor bill
- `PUT /api/vendor-bills/:id` - Update vendor bill
- `DELETE /api/vendor-bills/:id` - Delete vendor bill

### Expenses
- `GET /api/expenses` - Get all expenses (optional: ?projectId=1)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Timesheets
- `GET /api/timesheets` - Get all timesheets (optional: ?projectId=1&taskId=1)
- `POST /api/timesheets` - Create timesheet
- `PUT /api/timesheets/:id` - Update timesheet
- `DELETE /api/timesheets/:id` - Delete timesheet

### Analytics
- `GET /api/analytics` - Get analytics data

### Users
- `GET /api/users` - Get all users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

The database includes the following tables:
- users
- projects
- project_team (many-to-many)
- tasks
- sales_orders
- purchase_orders
- customer_invoices
- vendor_bills
- expenses
- timesheets


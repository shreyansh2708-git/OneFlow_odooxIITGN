# OneFlow - Project Management System

A full-stack project management system built with React, TypeScript, Node.js, Express, and MySQL.

## Features

- 🔐 **Authentication** - JWT-based authentication with role-based access control
- 📊 **Project Management** - Create, update, and manage projects
- ✅ **Task Management** - Track tasks with status, priority, and time logging
- 💰 **Financial Tracking** - Sales orders, purchase orders, invoices, bills, and expenses
- ⏱️ **Timesheet Management** - Log hours for tasks and projects
- 📈 **Analytics Dashboard** - View project progress and financial analytics
- 👥 **Team Management** - Assign team members to projects
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- React Query

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_password
     DB_NAME=oneflow_db
     JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
     ```

4. **Initialize database:**
   ```bash
   npm run init-db
   ```
   This will create the database, tables, and default users.

5. **Start the backend server:**
   ```bash
   npm start
   ```
   The server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to root directory:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL (optional):**
   - Create `.env` file in root directory:
     ```
     VITE_API_URL=http://localhost:3001/api
     ```
   - If not set, it defaults to `http://localhost:3001/api`

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The app will run on `http://localhost:8080`

## Default Login Credentials

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

### Other Endpoints
See `backend/README.md` for complete API documentation.

## Project Structure

```
oneflow/
├── backend/                 # Backend API
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── scripts/            # Database initialization scripts
│   └── server.js           # Express server
├── src/                    # Frontend source
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── lib/                # Utilities and API client
│   ├── pages/              # Page components
│   └── App.tsx             # Main App component
└── package.json            # Frontend dependencies
```

## Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload on file changes
```

### Frontend Development
```bash
npm run dev  # Starts Vite dev server
```

## Building for Production

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
npm run build
npm run preview
```

## Database Schema

The database includes the following tables:
- `users` - User accounts
- `projects` - Projects
- `project_team` - Many-to-many relationship for project teams
- `tasks` - Tasks
- `sales_orders` - Sales orders
- `purchase_orders` - Purchase orders
- `customer_invoices` - Customer invoices
- `vendor_bills` - Vendor bills
- `expenses` - Expenses
- `timesheets` - Timesheet entries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

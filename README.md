# Construction Management System

A comprehensive web-based construction management platform designed to streamline construction project operations from planning through completion. This system provides end-to-end management capabilities for construction companies, including project management, resource allocation, worker management, and financial tracking.

## 🏗️ Features

### Core Functionality
- **Project Management**: Create, update, and manage construction projects with role assignments
- **Task Management**: Assign tasks to workers with material and equipment allocation
- **Resource Management**: Real-time inventory tracking for materials and equipment
- **Progress Tracking**: Live project progress monitoring with reporting capabilities
- **Client Management**: Client profiles with budget tracking and digital agreements
- **Real-time Updates**: Live notifications and updates using Socket.IO

### User Roles
- **Admin**: Full system access and user management
- **Project Manager**: Project oversight and planning
- **Site Supervisor**: On-site task assignment and worker management
- **Inventory Manager**: Stock management and procurement
- **Worker**: Task execution and progress updates
- **Client**: Project visibility and communication

## 🛠️ Technical Architecture

- **Backend**: Node.js with Express framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with role-based access control
- **Real-time Communication**: Socket.IO for live updates
- **Testing**: Jest configuration included

## 📋 Prerequisites

Before installation, ensure you have:

- **Node.js** (version 14 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn** package manager

## ⚡ Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/UmeshSathsarana/Constriction-Management-system.git
cd construction-management-system
```

### 2. Backend Setup
```bash
cd backend
npm install
```

### 3. Database Configuration

**Option A: Use existing MongoDB Atlas (Quick Start)**
```bash
# The system is pre-configured with a test database
# No additional setup required
```

**Option B: Set up your own MongoDB (Recommended for production)**
```bash
# Create a .env file in the backend folder
echo 'Db_URl="your-mongodb-connection-string"' > .env
```

For MongoDB Atlas:
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster
3. Get connection string and update `.env` file

### 4. Start the Application
```bash
npm start
```

The server will start on port 5000. Look for these messages:
- ✅ "MongoDB connected successfully"
- ✅ "Server running on port 5000"
- ✅ "Socket.IO enabled for real-time updates"

### 5. Access the Application

- **API Base URL**: http://localhost:5000
- **Login Endpoint**: http://localhost:5000/login
- **Admin Dashboard**: http://localhost:5000/admin/dashboard

## 📁 Project Structure

```
construction-management-system/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication & validation
│   ├── controllers/     # Business logic
│   ├── config/          # Database configuration
│   └── server.js        # Main server file
├── frontend/            # Frontend application (if separate)
└── README.md
```

## 🚀 Key Functionality

### Project Management
- Create and track multiple construction projects
- Assign team members with specific roles
- Monitor project status and budget allocation
- Link projects to clients with budget tracking

### Task & Resource Management
- Assign tasks to workers with deadlines
- Allocate materials and equipment per task
- Track material usage with automatic stock updates
- Equipment maintenance scheduling

### Reporting & Analytics
- Real-time progress reports
- Resource utilization analytics
- Approval workflows for various report types

### Client Portal
- Client profile management
- Digital agreement handling with signatures
- Budget allocation and spending transparency
- Project progress visibility

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
Db_URl=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret-key
PORT=5000
NODE_ENV=development
```

### Database Schema
The system uses MongoDB with the following main collections:
- `users` - User accounts and roles
- `projects` - Construction projects
- `tasks` - Individual tasks and assignments
- `materials` - Inventory and stock management
- `equipment` - Equipment tracking and maintenance
- `clients` - Client information and contracts

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes Jest configuration for comprehensive testing.

## 🛠️ Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running locally
- Check connection string in `.env` file
- Ensure network access for MongoDB Atlas
- Verify firewall settings

### Installation Problems
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Port Conflicts
```bash
# Use different port
PORT=3001 npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


Waste Information Management System (WIMS UNICROSS) – Minimal Prototype
📌 Overview
The Waste Information Management System (WIMS) is designed to streamline waste management processes at the University of Cross River State (UNICROSS). The system allows:
Users to request services, view their requests, and receive notifications.
System Admins to add users, manage user data, and oversee service requests.
This prototype is a minimal implementation built with Next.js and MongoDB to demonstrate the core functionality.
🚀 Features
User Features
Login/Signup – Authentication using email and password.
Request Service – Submit waste management service requests.
View Requests – Track submitted service requests.
Receive Notifications – View status updates from the admin.
Admin Features
Add User – Register new system users.
Manage User Data – View and update user records.
Manage Service Requests – Approve, reject, or update service requests.
🛠 Tech Stack
Frontend & Backend: Next.js 14 with App Router
Database: MongoDB (using Mongoose ODM)
Authentication: NextAuth.js v5
UI Components: Tailwind CSS with custom styling
Typescript: Full type safety across the application
Icons: Lucide React
📂 Project Structure
waste-information-management-system/
│── app/                # Next.js App Router structure
│   ├── page.tsx        # Landing page
│   ├── login/          # Login screen
│   ├── register/       # Registration screen
│   ├── dashboard/      # User/Admin dashboards
│       ├── page.tsx    # Dashboard home
│       ├── requests/   # Service requests management
│       ├── users/      # User management (admin only)
│       ├── notifications/ # Notifications
│       ├── settings/   # User settings
│       └── layout.tsx  # Dashboard layout with navigation
│   ├── api/            # Next.js API routes
│       ├── auth/       # Authentication routes
│       ├── requests/   # CRUD for service requests
│       ├── users/      # Admin user management
│       └── notifications/ # Notification management
│   ├── providers.tsx   # Context providers
│   └── layout.tsx      # Root layout
│
│── models/             # Mongoose models
│   ├── User.ts         # User model
│   ├── Request.ts      # Request model
│   └── Notification.ts # Notification model
│
│── lib/                # Utility functions 
│   ├── mongodb.ts      # DB connection
│   ├── auth.ts         # Auth helpers
│   └── authContext.tsx # Authentication context
│
│── middleware.ts       # Route protection middleware
│── README.md
│── package.json
📊 Database Models
User Model (User.ts)
```typescript
{
  _id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  role: { type: String, enum: ['user', 'admin'] },
  createdAt: Date
}
```

Service Request Model (Request.ts)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  serviceType: String,
  location: String,
  description: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'rejected'] },
  createdAt: Date,
  updatedAt: Date
}
```

Notification Model (Notification.ts)
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  requestId: ObjectId,
  message: String,
  read: Boolean,
  createdAt: Date
}
```
⚙️ Installation
Clone the repository
```bash
git clone https://github.com/your-username/waste-information-management-system.git
cd waste-information-management-system
```
Install dependencies
```bash
npm install
```
Set up environment variables
Create a .env.local file in the root directory:
```env
MONGODB_URI=mongodb+srv://your_mongo_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```
Run the development server
```bash
npm run dev
```
The app will be available at http://localhost:3000.

## Getting Started

After setting up the application, you can use these default credentials to test the system:

**Admin User:**
- Email: admin@example.com
- Password: admin123

**Regular User:**
- Email: user@example.com
- Password: user123

You'll need to create these users manually or modify the authentication system to include them as seed data.

## Features Implementation

1. **Authentication System:**
   - Email/Password authentication using NextAuth.js
   - Protected routes with middleware
   - Role-based access control (User vs Admin)

2. **User Dashboard:**
   - Overview of service requests
   - Request creation and tracking
   - Notification system for updates
   - Profile settings management

3. **Admin Features:**
   - User management (create, edit, delete users)
   - Request management (update status, delete)
   - System-wide statistics

4. **Responsive Design:**
   - Mobile-friendly interface
   - Modern UI with Tailwind CSS
   - Accessible components
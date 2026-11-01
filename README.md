<div align="center">

# 🧑‍💼 StaffSync — Modern Human Resource Management System

### A full-stack MERN application with role-based access control for HR, Managers, and Employees

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org/)
[![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Quick Start](#-quick-start) | [Architecture](#-technical-architecture) | [API Docs](#-api-reference) | [Demo Accounts](#-demo-accounts)

</div>

---

## Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Technical Architecture](#-technical-architecture)
4. [ER Diagram](#-er-diagram)
5. [MVC Pattern and Project Structure](#-mvc-pattern--project-structure)
6. [Roles and Responsibilities](#-roles--responsibilities)
7. [User Flow](#-user-flow)
8. [Backend Setup](#-backend-setup--server-configuration)
9. [Frontend Setup](#-frontend-setup--client-configuration)
10. [MongoDB Configuration](#-configure-mongodb)
11. [Schema and Models](#-database-schemas--models)
12. [API Reference](#-api-reference)
13. [Frontend Architecture](#-frontend-architecture)
14. [Quick Start](#-quick-start)
15. [Demo Accounts](#-demo-accounts)
16. [Contributing](#-contributing)

---

## 🎯 Project Overview

**StaffSync** is a modern, full-featured Human Resource Management System built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js). It provides an integrated platform for managing employees, attendance, leaves, training programs, and company announcements with strict role-based access control across three user types: **HR**, **Manager**, and **Employee**.

### Key Highlights
- JWT-based authentication with role-based access control (RBAC)
- Real-time analytics dashboard for HR
- Attendance tracking with check-in/check-out
- Leave management with balance tracking and approval workflows
- Company-wide announcements with audience targeting
- Training programs with participant enrollment and performance scoring
- Real-time notifications
- Fully responsive Bootstrap 5 design
- Zero-config startup — auto-seeds demo data, uses in-memory DB if MongoDB is offline

---

## 📸 Application Screenshots

### Landing Page & Feature Showcase
![StaffSync Landing Page](docs/screenshots/home.png)

### Authentication & 1-Click Demo Access
![StaffSync Login Page](docs/screenshots/login.png)

### Employee Registration
![StaffSync Register Page](docs/screenshots/register.png)

---

## Features

### Employee Features
| Feature | Description |
|---|---|
| Register / Login | Self-service account creation |
| Employee Dashboard | Personal overview of attendance, leaves, notifications |
| Profile Management | Update personal info with role-tamper protection |
| Attendance | Daily check-in / check-out with status tracking |
| Leave Application | Apply for Casual / Sick / Annual / Unpaid leave |
| Leave Status | Track pending, approved, and rejected requests |
| Announcements | Read company-wide and role-targeted posts |
| Training Access | View and participate in training programs |

### Manager Features
| Feature | Description |
|---|---|
| Manager Dashboard | Team overview with quick stats |
| Team Management | View all direct reports |
| Leave Reviews | Approve or reject employee leave requests |
| Training Management | Create training programs, enroll employees |
| Performance Monitoring | View team training scores |

### HR Features
| Feature | Description |
|---|---|
| HR Dashboard | Org-wide analytics |
| Employee Management | Full CRUD with pagination |
| Manager Management | Assign managers to departments |
| Attendance Tracking | Organization-wide attendance reports |
| Leave Administration | Manage all leave requests |
| Announcements | Post, pin, target announcements |
| Reports and Analytics | Department-level breakdowns |

---

## 🏗️ Technical Architecture

`
+------------------------------------------------------------------+
|                        CLIENT (React.js)                        |
|  +------------+  +-------------+  +------------------------+    |
|  |   Pages    |  |  Components |  |   Redux Store (RTK)   |    |
|  | (14 pages) |  |  (Layout,   |  |  auth / leaves /      |    |
|  |            |  |  DataTable, |  |  attendance /         |    |
|  |            |  |  StatCard)  |  |  notifications / etc  |    |
|  +------------+  +-------------+  +------------------------+    |
|                     Axios API Client                            |
|              (JWT interceptor, 401 handler)                     |
+-----------------------------+------------------------------------+
                              | HTTP / REST
                              v
+------------------------------------------------------------------+
|                     SERVER (Express.js)                         |
|  +----------------+  +----------------+  +------------------+   |
|  |    Routes      |  |  Controllers   |  |   Middleware     |   |
|  |  /api/auth     |  |  auth.js       |  |  verifyToken     |   |
|  |  /api/employees|  |  employees.js  |  |  authorize(roles)|   |
|  |  /api/managers |  |  managers.js   |  |  validate        |   |
|  |  /api/attendance  |  attendance.js |  |  errorHandler    |   |
|  |  /api/leaves   |  |  leaves.js     |  +------------------+   |
|  |  /api/announce.|  |  announce.js   |                         |
|  |  /api/trainings|  |  trainings.js  |                         |
|  |  /api/notif.   |  |  notifications |                         |
|  |  /api/reports  |  |  reports.js    |                         |
|  +----------------+  +-------+--------+                         |
+------------------------------------------+----------------------+
                                           | Mongoose ODM
                                           v
+------------------------------------------------------------------+
|                   DATABASE (MongoDB)                            |
|  Users | Employees | Managers | Attendance | Leaves            |
|  Announcements | Trainings | Notifications   (8 collections)   |
|                                                                 |
|  Fallback: MongoMemoryServer (auto if local DB offline)        |
+------------------------------------------------------------------+
`

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 18.x+ |
| Backend | Express.js | 4.x |
| Database | MongoDB + Mongoose | 8.x |
| Auth | jsonwebtoken | 9.x |
| Passwords | bcryptjs | 2.x |
| Validation | express-validator | 7.x |
| Frontend | React.js | 18.x |
| State | Redux Toolkit | 2.x |
| HTTP | Axios | 1.x |
| Routing | React Router DOM | 6.x |
| UI | Bootstrap 5 + Bootstrap Icons | 5.3.x |
| Build | Vite | 5.x |
| Dev DB | mongodb-memory-server | 11.x |

---

## ER Diagram

`
+----------------+       +-----------------+       +--------------+
|    USERS       | 1   1 |    EMPLOYEES    | N   1 |   MANAGERS   |
+----------------+<------+-----------------+------>+--------------+
| _id            |       | _id             |       | _id          |
| name           |       | user  (ref)     |       | user  (ref)  |
| email          |       | employeeId      |       | department   |
| passwordHash   |       | department      |       | team[]       |
| role           |       | designation     |       |  Employee ref|
|  HR            |       | phone / address |       +--------------+
|  Manager       |       | dateOfBirth     |
|  Employee      |       | joinDate        |    +-------------------+
| isActive       |       | manager (ref)   |    |    ATTENDANCE     |
+----------------+       | leaveBalance    | N  +-------------------+
                         |  casual:12      |<---| _id               |
     +-----------+       |  sick:10        |    | employee  (ref)   |
     |   LEAVES  |       |  annual:15      |    | date YYYY-MM-DD   |
     +-----------+       | status          |    | checkIn/checkOut  |
  N  | _id       |       |  Active/Inactive|    | status            |
 <---| employee  |       +-----------------+    |  Present/Late/... |
     | type      |                              +-------------------+
     |  Casual   |    +----------------------------------------------+
     |  Sick     |    |               TRAININGS                      |
     |  Annual   |    +----------------------------------------------+
     |  Unpaid   |    | _id / title / description / trainer          |
     | startDate |    | startDate / endDate / createdBy (ref: User)  |
     | endDate   |    | participants []                               |
     | days      |    |   { employee(ref), status, score }           |
     | reason    |    +----------------------------------------------+
     | status    |
     |  Pending  |    +---------------------+  +-------------------+
     |  Approved |    |    ANNOUNCEMENTS    |  |   NOTIFICATIONS   |
     |  Rejected |    +---------------------+  +-------------------+
     | reviewedBy|    | _id / title / body  |  | _id               |
     | reviewNote|    | postedBy (ref: User)|  | user (ref: User)  |
     +-----------+    | audience            |  | type / message    |
                      |  All/HR/Manager/Emp |  | read Boolean      |
                      | pinned Boolean      |  | link              |
                      +---------------------+  +-------------------+
`

**Relationships:**
- User 1:1 Employee (every Employee has one User account)
- User 1:1 Manager (every Manager has one User account)
- Manager 1:N Employee (Manager.team[] holds Employee refs)
- Employee 1:N Attendance (one record per day)
- Employee 1:N Leave (multiple applications)
- Training N:M Employee (via embedded participants array)
- User 1:N Notification (per-user inbox)

---

## MVC Pattern and Project Structure

`
staffsync/
|
+-- server/                     # Express.js MVC Backend
|   +-- server.js               # Entry point, CORS, routes mount, auto-seed
|   +-- .env.example            # Template with key names only
|   +-- package.json
|   |
|   +-- config/
|   |   +-- db.js               # MongoDB connection + in-memory fallback
|   |
|   +-- models/                 # MODEL layer - Mongoose schemas
|   |   +-- User.js
|   |   +-- Employee.js
|   |   +-- Manager.js
|   |   +-- Attendance.js
|   |   +-- Leave.js
|   |   +-- Announcement.js
|   |   +-- Training.js
|   |   +-- Notification.js
|   |
|   +-- controllers/            # CONTROLLER layer - Business logic
|   |   +-- auth.js
|   |   +-- employees.js
|   |   +-- managers.js
|   |   +-- attendance.js
|   |   +-- leaves.js
|   |   +-- announcements.js
|   |   +-- trainings.js
|   |   +-- notifications.js
|   |   +-- reports.js
|   |
|   +-- middleware/
|   |   +-- auth.js             # verifyToken + authorize(roles)
|   |   +-- error.js            # Central error handler
|   |   +-- validate.js         # express-validator result checker
|   |
|   +-- routes/
|   |   +-- index.js            # Router mounting all controllers
|   |
|   +-- scripts/
|       +-- seed.js             # Idempotent demo data seeder
|       +-- smoke.js            # 25-assertion smoke test suite
|
+-- client/                     # React.js Frontend (Vite)
|   +-- index.html
|   +-- vite.config.js          # /api proxy to port 5000
|   +-- .env.example
|   +-- package.json
|   |
|   +-- src/
|       +-- main.jsx            # React root, Redux Provider
|       +-- App.jsx             # Routes, lazy loading, ProtectedRoute
|       +-- theme.css           # Custom CSS variables, dark sidebar
|       |
|       +-- api/
|       |   +-- axios.js        # JWT interceptor + 401 handler
|       |
|       +-- store/              # Redux Toolkit slices
|       |   +-- index.js        # configureStore
|       |   +-- authSlice.js
|       |   +-- attendanceSlice.js
|       |   +-- leavesSlice.js
|       |   +-- announcementsSlice.js
|       |   +-- trainingsSlice.js
|       |   +-- notificationsSlice.js
|       |   +-- employeesSlice.js
|       |
|       +-- components/         # VIEW layer - Reusable components
|       |   +-- Layout.jsx      # Sidebar + topbar + notifications
|       |   +-- ProtectedRoute.jsx
|       |   +-- DataTable.jsx
|       |   +-- StatCard.jsx
|       |   +-- StatusBadge.jsx
|       |   +-- Skeleton.jsx
|       |   +-- EmptyState.jsx
|       |
|       +-- pages/              # VIEW layer - Route pages
|           +-- Home.jsx
|           +-- Login.jsx
|           +-- Register.jsx
|           +-- EmployeeDashboard.jsx
|           +-- ManagerDashboard.jsx
|           +-- HRDashboard.jsx
|           +-- Profile.jsx
|           +-- Attendance.jsx
|           +-- Leaves.jsx
|           +-- Announcements.jsx
|           +-- Trainings.jsx
|           +-- Team.jsx
|           +-- Employees.jsx
|           +-- Reports.jsx
|
+-- docs/                       # Documentation assets
|   +-- screenshots/            # UI screenshots
|   +-- architecture.md         # Detailed architecture doc
|
+-- .gitignore
+-- AGENTS.md                   # AI agent build rules
+-- LICENSE
+-- README.md
`

---

## Roles and Responsibilities

### HR Role - Full organizational control

| Permission | Access |
|---|---|
| View / Create / Edit / Deactivate Employees | Full |
| View / Assign Managers | Full |
| View All Attendance Records | Full |
| Manage All Leave Requests | Full |
| Post / Pin Announcements (any audience) | Full |
| Access Analytics and Reports | Full |
| View Training Programs | Read-only |

### Manager Role - Team-scoped access

| Permission | Access |
|---|---|
| View Own Team Members | Own team |
| Approve / Reject Team Leave Requests | Own team |
| View Team Attendance | Own team |
| Create / Edit Training Programs | Full |
| Enroll Employees in Trainings | Full |
| Post Announcements | No |
| View HR Reports | No |

### Employee Role - Self-service access

| Permission | Access |
|---|---|
| Check In / Check Out | Own only |
| View Personal Attendance History | Own only |
| Apply for Leave | Own only |
| View Leave Balance and Status | Own only |
| Update Own Profile | Own only |
| Read Announcements | Read-only |
| View and Join Training Programs | Read + Enroll |

---

## User Flow

`
           +-------------+
           | Visit Home  |
           | :5173/      |
           +------+------+
                  |
      +-----------+-----------+
      |           |           |
  +---+----+  +---+--+  +----+-----+
  |Register|  | Login|  |1-Click   |
  |Employee|  |      |  |Demo Btns |
  +---+----+  +---+--+  +----+-----+
      |           |           |
      +-----------+-----------+
                  | JWT Token Issued
                  | Role Detected
                  v
       +--------------------+
       | Role-based Redirect|
       +----+----------+----+
            |          |
    +--------+    +----+------+    +----------+
    |  HR    |    |  Manager  |    | Employee |
    |/hr/    |    |/manager/  |    |/employee/|
    |dashbrd |    |dashboard  |    |dashboard |
    +---+----+    +----+------+    +----+-----+
        |              |                |
        v              v                v
   /employees      /team           /attendance
   /leaves         /leaves         /leaves
   /announcements  /trainings      /announcements
   /reports                        /trainings
   /trainings                      /profile
`

---

## Backend Setup / Server Configuration

### Prerequisites
- Node.js 18.x or higher
- MongoDB (optional, falls back to in-memory)
- npm 9.x or higher

### Installation

`ash
git clone https://github.com/YOUR_USERNAME/staffsync.git
cd staffsync/server
npm install
cp .env.example .env
# Edit .env with your values
`

### Environment Variables (server/.env)

`
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/staffsync
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
`

### Scripts

`ash
npm start          # Production server
npm run dev        # Dev server with nodemon
npm run seed       # Seed demo data
npm test           # Run 25-assertion smoke tests
`

---

## Frontend Setup / Client Configuration

### Installation

`ash
cd staffsync/client
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api
`

### Scripts

`ash
npm run dev       # Start Vite dev server on port 5173
npm run build     # Build production bundle
npm run preview   # Preview production build
`

---

## Configure MongoDB

StaffSync has three connection modes:

1. **Local MongoDB** - Set MONGO_URI in .env
2. **MongoDB Atlas** - Set MONGO_URI to Atlas connection string
3. **MongoMemoryServer** - Auto-used if local MongoDB is offline (dev/test only)

### MongoDB Atlas Setup
1. Create a free cluster at cloud.mongodb.com
2. Whitelist your IP in Network Access
3. Create a database user
4. Get connection string: mongodb+srv://user:pass@cluster.net/staffsync
5. Set in server/.env as MONGO_URI

---

## Database Schemas and Models

### User Schema
`js
{ name, email, passwordHash (hidden), role: HR|Manager|Employee, isActive }
`

### Employee Schema
`js
{ user(ref), employeeId, department, designation, phone, address,
  dateOfBirth, joinDate, manager(ref), leaveBalance:{casual,sick,annual},
  status: Active|Inactive|Terminated }
// Indexes: manager, department, status
`

### Attendance Schema
`js
{ employee(ref), date:YYYY-MM-DD, checkIn, checkOut,
  status: Present|Late|Absent|On Leave }
// Unique index: employee + date
`

### Leave Schema
`js
{ employee(ref), type:Casual|Sick|Annual|Unpaid, startDate, endDate,
  days, reason, status:Pending|Approved|Rejected, reviewedBy, reviewNote }
`

### Training Schema
`js
{ title, description, trainer, startDate, endDate, createdBy(ref),
  participants:[{ employee(ref), status:Enrolled|Completed, score }] }
`

### Announcement Schema
`js
{ title, body, postedBy(ref:User), audience:All|HR|Manager|Employee, pinned }
`

### Notification Schema
`js
{ user(ref:User), type, message, read:Boolean, link }
// Index: user + read
`

---

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Register Employee account |
| POST | /api/auth/login | Public | Login, returns JWT |
| GET | /api/auth/me | Any | Get current user profile |

### Employees
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/employees | HR | List all (paginated) |
| POST | /api/employees | HR | Create employee |
| GET | /api/employees/:id | HR/Manager | Get by ID |
| PUT | /api/employees/:id | HR | Update |
| DELETE | /api/employees/:id | HR | Deactivate |
| PUT | /api/employees/profile/me | Employee | Self-update |

### Attendance
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/attendance/check-in | Employee | Record check-in |
| POST | /api/attendance/check-out | Employee | Record check-out |
| GET | /api/attendance/my | Employee | Own history |
| GET | /api/attendance | HR | All records |
| GET | /api/attendance/team | Manager | Team records |

### Leaves
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/leaves/apply | Employee | Apply for leave |
| GET | /api/leaves/my | Employee | Own requests |
| GET | /api/leaves | HR | All requests |
| GET | /api/leaves/team | Manager | Team requests |
| PUT | /api/leaves/:id/review | Manager/HR | Approve/reject |

### Announcements
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/announcements | HR | Create with audience |
| GET | /api/announcements | Any | List (role-filtered) |
| DELETE | /api/announcements/:id | HR | Delete |

### Trainings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/trainings | Manager | Create + enroll |
| GET | /api/trainings | Any | List programs |
| PUT | /api/trainings/:id | Manager | Update/scores |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/notifications | Any | List own |
| GET | /api/notifications/unread-count | Any | Unread count |
| PUT | /api/notifications/mark-all-read | Any | Mark all read |

### Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/reports/dashboard | HR | Org analytics |

---

## Frontend Architecture

### Redux Store Structure
`
auth         - user, token, login/logout/register thunks
leaves       - myLeaves, allLeaves, teamLeaves, apply, review
attendance   - myAttendance, teamAttendance, checkIn/checkOut
announcements - items, post, list (role-filtered)
trainings    - items, create, update scores
notifications - items, unreadCount, markAllRead
employees    - items, pagination, CRUD
`

### Key Patterns
- **ProtectedRoute**: Role-guard wrapper, redirects unauthenticated/wrong-role users
- **Lazy Loading**: All 14 pages loaded with React.lazy() + Suspense
- **Axios Interceptors**: Auto-attach JWT on requests, auto-redirect on 401
- **Role-adaptive pages**: Attendance, Leaves show different UI per role

---

## Quick Start

**No MongoDB required — auto-starts in-memory DB and seeds demo data!**

`ash
# Terminal 1 - Backend
cd staffsync/server
npm install
node server.js
# Server running on port 5000

# Terminal 2 - Frontend
cd staffsync/client
npm install
npm run dev
# App running at http://localhost:5173
`

Open http://localhost:5173 in your browser.

---

## Demo Accounts

Password for all accounts: **Password123**

Use the 1-Click Demo buttons on the Login page for instant access.

| Role | Email | Redirects To |
|---|---|---|
| HR Director | hr@staffsync.com | /hr/dashboard |
| System Admin (HR) | admin@staffsync.com | /hr/dashboard |
| Manager | manager@staffsync.com | /manager/dashboard |
| Manager 2 | manager2@staffsync.com | /manager/dashboard |
| Employee 1-6 | emp1@staffsync.com ... emp6@staffsync.com | /employee/dashboard |

---

## Security

- Passwords hashed with bcryptjs (salt 10)
- JWT tokens signed server-side, expire in 7 days
- Role-based guards on every protected API route
- Input validation on all mutation endpoints
- passwordHash excluded from all query results (select: false)
- Secrets only in .env (gitignored)
- CORS configured for frontend origin only

---

## Performance

- DB indexes on manager, department, employee+date, user+read
- Pagination on all list endpoints (?page=N&limit=N)
- Lazy loading with code splitting (14 page chunks)
- Request timing logger for every API call
- MongoMemoryServer fallback with 1.5s timeout for fast startup

---

## Contributing

1. Fork the repository
2. Create a branch: git checkout -b feature/your-feature
3. Commit: git commit -m "feat: add your feature"
4. Push: git push origin feature/your-feature
5. Open a Pull Request

Commit convention: feat / fix / docs / refactor / test

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">
Built with love by Priyanshu Jaiswal
Star this repo if you found it helpful!
</div>

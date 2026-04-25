# CSRM Payroll System

**CSRM Payroll System** is an enterprise-grade HR, Attendance, Leave, Payroll, Payslip, Reporting, Audit, and Role-Based Access Control system designed for company-level payroll operations.

This project is being developed as a full-stack production-oriented HR & Payroll Management System for managing employee information, attendance, leave, holidays, salary structure, payroll processing, payroll approval, payslip generation, payroll reporting, role-based permissions, and audit history.

> Project Status: **Backend core modules are under active development and mostly functional. Frontend is scaffolded but not yet fully implemented.**

---

## Table of Contents

- [Project Overview](#project-overview)
- [Project Goals](#project-goals)
- [Current Project Status](#current-project-status)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [User Roles](#user-roles)
- [Role-Based Access Control](#role-based-access-control)
- [Backend Modules](#backend-modules)
- [API Base URL](#api-base-url)
- [Folder Structure](#folder-structure)
- [Backend Architecture Pattern](#backend-architecture-pattern)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [API Route Summary](#api-route-summary)
- [Module-wise Explanation](#module-wise-explanation)
- [Payroll Status Flow](#payroll-status-flow)
- [Audit Log & Status History](#audit-log--status-history)
- [Payslip & Report Export](#payslip--report-export)
- [Postman Testing Guide](#postman-testing-guide)
- [User Guide](#user-guide)
- [Developer Guide](#developer-guide)
- [Security Notes](#security-notes)
- [Known Development Notes](#known-development-notes)
- [Future Roadmap](#future-roadmap)
- [Author](#author)

---

## Project Overview

The CSRM Payroll System is designed to manage payroll-related HR operations in a structured and secure way.

The system supports:

- Employee management
- Branch management
- Department management
- Attendance management
- Leave management
- Holiday management
- Salary structure management
- Payroll processing
- Payroll approval
- Payroll payment status
- Payroll lock/unlock
- Payroll audit history
- Payslip generation
- Payroll report generation
- PDF export
- CSV export
- Excel export
- JWT authentication
- Role-based access control
- Employee own payslip access protection

The long-term goal is to make this system enterprise-grade, scalable, secure, maintainable, and production-ready.

---

## Project Goals

The main goals of this project are:

1. Build a real-world HR and payroll backend system.
2. Maintain clean modular architecture.
3. Use TypeScript for better type safety.
4. Use MongoDB and Mongoose for flexible document-based data modeling.
5. Implement secure authentication and authorization.
6. Apply role-based access control across sensitive routes.
7. Generate payslips and payroll reports.
8. Support PDF, CSV, and Excel exports.
9. Maintain payroll audit logs and status history.
10. Prepare the project for future frontend integration.
11. Prepare the system for future production deployment.

---

## Current Project Status

### Completed / Implemented Backend Areas

- Auth Module
- User Module
- Branch Module
- Department Module
- Employee Module
- Attendance Module
- Leave Module
- Holiday Module
- Salary Structure Module
- Payroll Module
- Payroll Report Module
- Payslip JSON API
- Monthly Payroll Report JSON API
- Payslip PDF Export API
- CSV Export API
- Excel Export API
- Payroll Approval System
- Payroll Lock System
- Payroll Audit Log
- Payroll Status History
- Edit restriction for locked/approved/paid payroll
- Permission constants
- RBAC middleware
- Sensitive route protection
- Employee own payslip access guard

### In Progress / Pending

- Branch and Department RBAC final review
- Full backend validation polishing
- Global audit log for all modules
- Automated testing
- Swagger/OpenAPI documentation
- Security hardening
- Docker setup
- Deployment configuration
- Frontend dashboard development
- Final production optimization

---

## Tech Stack

### Backend

| Technology    | Purpose                               |
| ------------- | ------------------------------------- |
| Node.js       | JavaScript runtime for backend server |
| Express.js    | API server framework                  |
| TypeScript    | Type-safe backend development         |
| MongoDB       | NoSQL database                        |
| Mongoose      | MongoDB object modeling               |
| JWT           | Authentication and authorization      |
| bcrypt        | Password hashing                      |
| Zod           | Request validation                    |
| PDFKit        | PDF payslip/report generation         |
| ExcelJS       | Excel report export                   |
| dotenv        | Environment variable management       |
| cookie-parser | Cookie parsing middleware             |
| cors          | Cross-origin resource sharing         |
| ts-node-dev   | Development server with auto restart  |

### Frontend

| Technology | Purpose                        |
| ---------- | ------------------------------ |
| React      | Frontend UI library            |
| TypeScript | Type-safe frontend development |
| Vite       | Frontend build tool            |
| ESLint     | Code linting                   |

> Frontend is currently scaffolded but not fully developed yet.

### Tools

| Tool            | Purpose             |
| --------------- | ------------------- |
| VS Code         | Development editor  |
| Postman         | API testing         |
| MongoDB Atlas   | Cloud database      |
| MongoDB Compass | Database inspection |
| Git             | Version control     |
| GitHub          | Source code hosting |

---

## Core Features

### Authentication

- User registration
- User login
- JWT access token
- JWT refresh token support
- Role-based user identity
- Protected routes

### User Management

- User account creation
- Role assignment
- User status handling
- Permission-based user access

### Employee Management

- Employee profile creation
- Employee update
- Employee list view
- Employee details view
- Employee delete
- Branch and department relationship
- Optional user account linking for employee self-service

### Attendance Management

- Attendance entry
- Attendance update
- Attendance list
- Single attendance view
- Attendance delete
- Future support for biometric integration

### Leave Management

- Leave creation
- Leave update
- Leave approval
- Leave list
- Leave details
- Leave delete

### Holiday Management

- Holiday creation
- Holiday update
- Holiday list
- Holiday details
- Holiday delete
- Holiday read access for authenticated users based on permission

### Salary Structure Management

- Salary structure creation
- Salary structure update
- Salary structure view
- Salary structure delete
- Basic salary, allowance, deduction-based structure support

### Payroll Management

- Payroll creation/process
- Payroll update
- Payroll approval
- Payroll payment status update
- Payroll lock
- Payroll unlock
- Batch approve
- Batch lock
- Payroll status history
- Payroll audit log

### Payroll Reports

- Monthly payroll report
- Employee-wise payslip
- Payroll report JSON API
- PDF export
- CSV export
- Excel export

### RBAC

- Role-based access control
- Permission constants
- Role permission matrix
- Route-level permission guard
- Employee own resource guard

---

## User Roles

The system currently supports the following roles:

| Role          | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `super_admin` | Highest-level system user with all permissions                               |
| `admin`       | Administrative user with all system permissions                              |
| `hr`          | HR user for employee, attendance, leave, holiday, salary and payroll process |
| `accounts`    | Accounts user for salary, payroll payment, payroll report and payslip access |
| `manager`     | Manager user for read access, leave approval, payroll approval and reporting |
| `employee`    | Employee user for own payslip and limited self-service access                |

---

## Role-Based Access Control

The system uses permission-based RBAC.

### RBAC Flow

```txt
Request
  ↓
auth()
  ↓
JWT Verify
  ↓
req.user set
  ↓
requirePermission(requiredPermission)
  ↓
Check role permission matrix
  ↓
Allowed → Controller
Denied → 403 Forbidden
```

### Main Permission Groups

| Module           | Read Permission         | Manage Permission            |
| ---------------- | ----------------------- | ---------------------------- |
| User             | `user:read`             | `user:manage`                |
| Employee         | `employee:read`         | `employee:manage`            |
| Attendance       | `attendance:read`       | `attendance:manage`          |
| Leave            | `leave:read`            | `leave:manage`               |
| Leave Approval   | -                       | `leave:approve`              |
| Holiday          | `holiday:read`          | `holiday:manage`             |
| Salary Structure | `salary_structure:read` | `salary_structure:manage`    |
| Payroll          | `payroll:read`          | payroll-specific permissions |
| Payroll Report   | `payroll_report:read`   | `payroll_report:export`      |
| Payslip          | `payslip:read:any`      | `payslip:read:own`           |

### Payroll Permissions

```txt
payroll:read
payroll:update
payroll:process
payroll:approve
payroll:pay
payroll:lock
payroll:unlock
payroll:batch_approve
payroll:batch_lock
payroll:audit_read
```

---

## Backend Modules

Current backend modules include:

```txt
Auth
User
Branch
Department
Employee
Attendance
Leave
Holiday
Salary Structure
Payroll
Payroll Report
Payslip
RBAC
Audit Log
```

---

## API Base URL

Local backend base URL:

```txt
http://localhost:5000/api/v1
```

Health check/root:

```txt
GET http://localhost:5000/
```

Expected response:

```json
{
  "success": true,
  "message": "CSRM Payroll Backend Running"
}
```

---

## Folder Structure

Main repository structure:

```txt
csrm-payroll-system/
├── .postman/
├── client/
├── postman/
│   └── globals/
├── server/
├── .gitignore
├── outline.txt
└── README.md
```

### Server Structure

```txt
server/
├── src/
│   ├── app/
│   │   └── config/
│   ├── errors/
│   ├── middleware/
│   ├── middlewares/
│   ├── modules/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── branch/
│   │   ├── department/
│   │   ├── employee/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── holiday/
│   │   ├── salaryStructure/
│   │   ├── payroll/
│   │   └── payrollReport/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

### Client Structure

```txt
client/
├── src/
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

> The frontend is currently scaffolded and will be developed later.

---

## Backend Architecture Pattern

Most backend modules follow this pattern:

```txt
module/
├── module.interface.ts
├── module.model.ts
├── module.validation.ts
├── module.service.ts
├── module.controller.ts
├── module.route.ts
└── module.constant.ts
```

### File Responsibility

| File            | Responsibility                              |
| --------------- | ------------------------------------------- |
| `interface.ts`  | TypeScript types/interfaces                 |
| `model.ts`      | Mongoose schema and model                   |
| `validation.ts` | Zod request validation                      |
| `service.ts`    | Business logic and database operations      |
| `controller.ts` | Request/response handling                   |
| `route.ts`      | API route definition and middleware binding |
| `constant.ts`   | Static constants, enums, roles, permissions |

---

## Environment Variables

Create a `.env` file inside the `server/` folder.

Example:

```env
PORT=5000
NODE_ENV=development

DATABASE_URL=mongodb+srv://your-db-user:your-db-password@your-cluster.mongodb.net/csrm-payroll?retryWrites=true&w=majority

JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=15m

JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d
```

### Important

Never commit real `.env` values to GitHub.

Use `.env.example` for sharing required environment variable names.

---

## Installation & Setup

### 1. Clone Repository

```bash
git clone https://github.com/mohammadsoheluddin/csrm-payroll-system.git
cd csrm-payroll-system
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create `.env` file inside `server/`.

Then run:

```bash
npm run dev
```

Backend will run on:

```txt
http://localhost:5000
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Frontend will run on Vite development server.

---

## Available Scripts

### Backend Scripts

Run from `server/` folder:

```bash
npm run dev
```

Starts backend in development mode using `ts-node-dev`.

```bash
npm run build
```

Compiles TypeScript into JavaScript.

```bash
npm start
```

Runs compiled backend from `dist/server.js`.

### Frontend Scripts

Run from `client/` folder:

```bash
npm run dev
```

Starts Vite development server.

```bash
npm run build
```

Builds frontend for production.

```bash
npm run preview
```

Previews production build.

```bash
npm run lint
```

Runs ESLint.

---

## API Route Summary

All module routes are mounted under:

```txt
/api/v1
```

| Module           | Base Route                 |
| ---------------- | -------------------------- |
| Health           | `/api/v1/`                 |
| Auth             | `/api/v1/auth`             |
| Protected Test   | `/api/v1/protected`        |
| Users            | `/api/v1/users`            |
| Employees        | `/api/v1/employees`        |
| Departments      | `/api/v1/departments`      |
| Branches         | `/api/v1/branches`         |
| Attendance       | `/api/v1/attendance`       |
| Leave            | `/api/v1/leave`            |
| Holiday          | `/api/v1/holiday`          |
| Salary Structure | `/api/v1/salary-structure` |
| Payroll          | `/api/v1/payroll`          |
| Payroll Reports  | `/api/v1/payroll-reports`  |

---

## Module-wise Explanation

### Auth Module

The Auth module handles authentication-related operations.

Main responsibilities:

- Register user
- Login user
- Generate access token
- Generate refresh token
- Verify credentials
- Return safe user information

Common files:

```txt
auth.route.ts
auth.controller.ts
auth.service.ts
auth.utils.ts
```

### User Module

The User module manages system users and role-based permissions.

Main responsibilities:

- User schema
- User role
- User permission mapping
- Role constants
- Permission constants
- User management APIs

Important roles:

```txt
super_admin
admin
hr
accounts
manager
employee
```

### Branch Module

The Branch module manages company branches.

Main responsibilities:

- Create branch
- Update branch
- View branches
- Delete branch
- Connect branch with employee records

### Department Module

The Department module manages company departments.

Main responsibilities:

- Create department
- Update department
- View departments
- Delete department
- Connect department with employee records

### Employee Module

The Employee module manages employee profiles.

Main responsibilities:

- Create employee profile
- Update employee profile
- View employee list
- View single employee
- Delete employee
- Link employee with branch
- Link employee with department
- Optionally link employee with user account

Important note:

Employee and User are separate concepts.

```txt
Employee = HR/payroll profile
User = Login account
```

Not every employee needs a user account unless employee self-service is required.

### Attendance Module

The Attendance module manages employee attendance.

Main responsibilities:

- Create attendance
- Update attendance
- View attendance
- Delete attendance
- Prepare attendance data for payroll calculation

Future improvement:

- Biometric machine integration
- Attendance import from device
- Manual correction approval flow

### Leave Module

The Leave module manages employee leave.

Main responsibilities:

- Create leave
- Update leave
- View leave list
- View single leave
- Approve leave
- Delete leave

Manager, HR, Admin, and Super Admin may have different permission levels.

### Holiday Module

The Holiday module manages company holidays.

Main responsibilities:

- Create holiday
- Update holiday
- View holiday list
- View single holiday
- Delete holiday

Employees may be allowed to view holiday lists depending on role permission.

### Salary Structure Module

The Salary Structure module manages employee salary configuration.

Main responsibilities:

- Create salary structure
- Update salary structure
- View salary structure
- Delete salary structure
- Store salary components

Possible salary components:

```txt
Basic salary
House rent
Medical allowance
Conveyance allowance
Other allowance
Deductions
Gross salary
Net salary
```

### Payroll Module

The Payroll module is the core business module.

Main responsibilities:

- Process payroll
- Update payroll
- Approve payroll
- Pay payroll
- Lock payroll
- Unlock payroll
- Batch approve payroll
- Batch lock payroll
- Maintain audit logs
- Maintain status history
- Restrict edit after approval/paid/lock

### Payroll Report Module

The Payroll Report module handles payroll-related reporting.

Main responsibilities:

- Monthly payroll report
- Employee payslip
- Payslip JSON
- Payslip PDF
- Payroll report export
- CSV export
- Excel export

---

## Payroll Status Flow

Payroll follows this status flow:

```txt
draft → processed → approved → paid
```

### Status Meaning

| Status      | Meaning                                        |
| ----------- | ---------------------------------------------- |
| `draft`     | Payroll is initially created or not finalized  |
| `processed` | Payroll calculation has been processed         |
| `approved`  | Payroll has been approved by authorized person |
| `paid`      | Payroll has been marked as paid                |

### Locking Rule

When payroll is locked:

- Update should be restricted
- Delete should be restricted
- Sensitive change should be blocked
- Audit history should be preserved

---

## Audit Log & Status History

Payroll audit log stores important payroll activities.

Possible audit events:

```txt
created
processed
updated
approved
paid
locked
unlocked
batch_approved
batch_locked
```

Audit log should help answer:

- Who changed payroll?
- When was it changed?
- What action was performed?
- What was the previous status?
- What is the current status?

---

## Payslip & Report Export

The system supports:

| Feature               | Format |
| --------------------- | ------ |
| Payslip API           | JSON   |
| Payslip Export        | PDF    |
| Payroll Report        | JSON   |
| Payroll Report Export | CSV    |
| Payroll Report Export | Excel  |

Payslip access rule:

- Super Admin/Admin/HR/Accounts/Manager can access payslip based on permission.
- Employee can access only own payslip if user account is linked with employee profile.

---

## Postman Testing Guide

### Recommended Testing Order

```txt
1. Start backend server
2. Register users by role
3. Login and collect access tokens
4. Create branch
5. Create department
6. Create employee
7. Create attendance
8. Create leave
9. Create holiday
10. Create salary structure
11. Process payroll
12. Approve payroll
13. Pay payroll
14. Lock payroll
15. Test payroll reports
16. Test payslip JSON
17. Test PDF export
18. Test CSV export
19. Test Excel export
20. Test RBAC forbidden cases
```

### Common Header

```txt
Authorization: Bearer ACCESS_TOKEN
```

### Role-wise Token Variables

Recommended Postman environment variables:

```txt
SUPER_ADMIN_ACCESS_TOKEN
ADMIN_ACCESS_TOKEN
HR_ACCESS_TOKEN
ACCOUNTS_ACCESS_TOKEN
MANAGER_ACCESS_TOKEN
EMPLOYEE_ACCESS_TOKEN
```

---

## User Guide

### Super Admin

Super Admin can:

- Manage all users
- Manage all employees
- Manage attendance
- Manage leave
- Manage holidays
- Manage salary structures
- Process payroll
- Approve payroll
- Pay payroll
- Lock/unlock payroll
- Export payroll reports
- View audit logs
- Access all payslips

### Admin

Admin can:

- Perform almost all administrative actions
- Manage HR and payroll data
- Access sensitive routes
- Manage reports and exports

### HR

HR can:

- Manage employee profiles
- Manage attendance
- Manage leave
- Approve leave
- Manage holidays
- Manage salary structures
- Process payroll
- View payroll reports
- Export reports
- View employee payslips

### Accounts

Accounts can:

- View employee data
- View salary structure
- View payroll
- Mark payroll as paid
- Lock payroll
- View payroll audit
- Export payroll reports
- View payslips

### Manager

Manager can:

- View employee data
- View attendance
- View leave
- Approve leave
- View holidays
- Approve payroll where permitted
- View payroll report
- View payslips where permitted

### Employee

Employee can:

- View own payslip
- View holidays if permission is enabled

---

## Developer Guide

### New Module Creation Pattern

To add a new module:

```txt
1. Create module folder inside server/src/modules
2. Create interface file
3. Create model file
4. Create validation file
5. Create service file
6. Create controller file
7. Create route file
8. Register route in server/src/routes/index.ts
9. Add permissions in user.constant.ts if needed
10. Test API using Postman
```

### Controller-Service Pattern

Controller should handle:

```txt
Request
Response
Next function
HTTP status
Calling service
```

Service should handle:

```txt
Business logic
Database query
Calculation
Data validation support
Error throwing
```

Route should handle:

```txt
Endpoint path
HTTP method
Auth middleware
Permission middleware
Validation middleware
Controller binding
```

### RBAC Implementation Pattern

Example:

```ts
router.post(
  "/create-employee",
  auth(),
  requirePermission(PERMISSIONS.EMPLOYEE_MANAGE),
  EmployeeControllers.createEmployee,
);
```

Meaning:

```txt
Only logged-in users with employee:manage permission can create employee.
```

---

## Security Notes

Current security-related features:

- Password hashing using bcrypt
- JWT authentication
- Role-based permissions
- Protected sensitive routes
- Employee own payslip access guard
- Environment variables ignored from Git

Recommended future security improvements:

- Add Helmet
- Add rate limiting
- Add strict CORS configuration
- Add refresh token rotation
- Add logout/token blacklist
- Add brute-force login protection
- Add request size limit
- Add MongoDB injection protection
- Hide sensitive error details in production
- Add production-grade logging
- Add audit logs for all sensitive modules

---

## Known Development Notes

### Employee and User Difference

Employee and User are not the same.

```txt
Employee = employee profile used for HR and payroll
User = login account used for authentication
```

For employee self-service:

```txt
1. Create employee profile
2. Create user with employee role
3. Link user with employee profile
4. Login as employee
5. Use employee token
6. Access own payslip using employee document ID
```

### Payroll Month Format

Payroll month should follow:

```txt
YYYY-MM
```

Example:

```txt
2026-05
```

### Common Local Development Issues

Possible issues:

```txt
MongoDB Atlas IP not whitelisted
Invalid MongoDB SRV URI
Wrong JWT secret
Wrong role name
Wrong permission constant
Missing Authorization header
Using User ID instead of Employee ID in payslip route
```

Correct role name:

```txt
super_admin
```

Avoid:

```txt
superAdmin
```

---

## Future Roadmap

### Backend Roadmap

- Complete Branch RBAC
- Complete Department RBAC
- Review User route permissions
- Add global audit log
- Refactor validations
- Add Swagger/OpenAPI documentation
- Add automated tests
- Add Docker support
- Add CI/CD with GitHub Actions
- Add production logging
- Add monitoring and health checks
- Add database backup guide
- Add advanced payroll calculation

### Payroll Improvement Roadmap

- Overtime calculation
- Late attendance deduction
- Absent deduction
- Unpaid leave deduction
- Bonus calculation
- Loan/advance deduction
- Tax deduction
- Provident fund
- Festival bonus
- Arrear salary
- Payroll rollback
- Payroll reprocess control

### Frontend Roadmap

- Login page
- Role-based dashboard
- Sidebar menu by role
- Employee management UI
- Attendance UI
- Leave UI
- Holiday UI
- Salary structure UI
- Payroll processing UI
- Payroll approval UI
- Payroll report UI
- Payslip view/download UI
- Audit log UI
- Responsive layout
- Error/loading states
- Form validation

### Documentation Roadmap

- Full API documentation
- Developer handbook
- User manual
- Database schema documentation
- Deployment guide
- Troubleshooting guide
- Line-by-line code explanation

---

## Production Readiness Checklist

Before production deployment:

```txt
[ ] Complete backend RBAC review
[ ] Complete frontend dashboard
[ ] Add .env.example
[ ] Add Swagger API docs
[ ] Add automated tests
[ ] Add Dockerfile
[ ] Add docker-compose.yml
[ ] Add production CORS config
[ ] Add Helmet
[ ] Add rate limiter
[ ] Add request logger
[ ] Add error logger
[ ] Add health check route
[ ] Add backup policy
[ ] Add deployment documentation
[ ] Add CI/CD pipeline
[ ] Final security review
```

---

## Author

**Mohammad Sohel Uddin**

HR & Admin Professional  
Web Development Learner  
Project: CSRM Payroll System

---

## Disclaimer

This project is under active development. Some features are implemented, some are being improved, and some are planned for future development. The README will be updated as the project grows.

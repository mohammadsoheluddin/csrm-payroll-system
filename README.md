# CSRM Payroll System

**CSRM Payroll System** is a modular HR, Attendance, Leave, Payroll, Payslip, Reporting, Audit Log, and Role-Based Access Control system designed for company-level payroll operations.

This project is being developed as a production-oriented full-stack HR & Payroll Management System for **Chakda Steel & Re-Rolling Mills (Pvt.) Ltd. (CSRM)**.

> **Current Status:** Backend core modules are mostly implemented and under active polishing. Frontend is scaffolded and will be developed after key backend workflows and reports are stable.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Current Development Status](#current-development-status)
- [Tech Stack](#tech-stack)
- [Core Features](#core-features)
- [Backend Modules](#backend-modules)
- [User Roles](#user-roles)
- [Role-Based Access Control](#role-based-access-control)
- [Leave Workflow](#leave-workflow)
- [Payroll Workflow](#payroll-workflow)
- [Payslip & Report Export](#payslip--report-export)
- [Audit Log](#audit-log)
- [API Base URL](#api-base-url)
- [Folder Structure](#folder-structure)
- [Backend Architecture Pattern](#backend-architecture-pattern)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Available Scripts](#available-scripts)
- [API Route Summary](#api-route-summary)
- [Postman Testing Guide](#postman-testing-guide)
- [Known Development Notes](#known-development-notes)
- [Future Roadmap](#future-roadmap)
- [Production Readiness Checklist](#production-readiness-checklist)
- [Author](#author)

---

## Project Overview

The CSRM Payroll System is designed to manage HR and payroll-related operations in a structured, secure, and maintainable way.

The system currently supports:

- User authentication
- Role-based access control
- Branch management
- Department management
- Employee management
- Attendance management
- Leave management
- Holiday management
- Salary structure management
- Payroll processing
- Payroll approval
- Payroll payment status
- Payroll lock/unlock
- Payroll audit/status history
- Payslip generation
- Payroll report generation
- PDF export
- CSV export
- Excel export
- Global audit log foundation

The long-term goal is to make this system enterprise-ready, scalable, secure, maintainable, and suitable for real HR/payroll workflows.

---

## Current Development Status

### Completed / Mostly Implemented

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
- Payslip PDF Export API
- Payroll Report CSV Export API
- Payroll Report Excel Export API
- Payroll Approval System
- Payroll Lock System
- Payroll Audit / Status History
- Global Audit Log Foundation
- RBAC Permission Middleware
- Employee Own Payslip Access Guard
- Validation Middleware Refactor

### Recently Improved

- Build safety and validation refactor
- Branch validation
- Department validation
- Employee validation
- Attendance validation
- Leave validation
- Leave balance policy
- Auto leave day calculation
- Overlapping leave prevention
- Management concern leave flow
- Replacement leave rules

### In Progress / Planned

- Organization structure planning
- Section / sub-department support
- Attendance summary report
- Leave summary report
- Payroll salary sheet overview report
- PDF/Excel report layout based on CSRM salary/time bill formats
- Holiday validation polishing
- Salary Structure validation polishing
- Payroll validation polishing
- Payroll Report validation polishing
- Audit Log query validation
- Frontend dashboard development
- API documentation
- Automated testing
- Security hardening
- Deployment preparation

---

## Tech Stack

### Backend

| Technology    | Purpose                          |
| ------------- | -------------------------------- |
| Node.js       | Backend runtime                  |
| Express.js    | API server framework             |
| TypeScript    | Type-safe backend development    |
| MongoDB       | Database                         |
| Mongoose      | MongoDB object modeling          |
| Zod           | Request validation               |
| JWT           | Authentication and authorization |
| bcrypt        | Password hashing                 |
| PDFKit        | PDF generation                   |
| ExcelJS       | Excel report export              |
| dotenv        | Environment configuration        |
| cors          | Cross-origin resource sharing    |
| cookie-parser | Cookie parsing middleware        |
| ts-node-dev   | Development server               |

### Frontend

Frontend is scaffolded but not fully implemented yet.

Planned frontend stack:

| Technology     | Purpose                  |
| -------------- | ------------------------ |
| React          | UI library               |
| TypeScript     | Type-safe frontend       |
| Tailwind CSS   | Styling                  |
| Vite / Next.js | Frontend build framework |

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

- User login
- Password hashing
- JWT access token
- JWT refresh token
- Protected routes

### User Management

- User creation
- User role assignment
- User status handling
- Permission-based access control

### Branch Management

- Create branch
- Update branch
- View branch list
- View single branch
- Soft delete branch

### Department Management

- Create department
- Update department
- View department list
- View single department
- Soft delete department

### Employee Management

- Create employee profile
- Update employee profile
- View employee list
- View single employee
- Soft delete employee
- Link employee with branch
- Link employee with department
- Optional user account linking for employee self-service

### Attendance Management

- Create attendance
- Update attendance
- View attendance list
- View single attendance
- Soft delete attendance
- Date range filtering
- Future biometric integration support

### Leave Management

- Create leave
- Update leave
- Approve/reject/cancel leave
- View leave list
- View leave balance
- View single leave
- Soft delete leave
- Auto total leave day calculation
- Leave overlap prevention
- Leave balance policy
- Replacement leave support

### Holiday Management

- Create holiday
- Update holiday
- View holiday list
- View single holiday
- Soft delete holiday

### Salary Structure Management

- Create salary structure
- Update salary structure
- View salary structure
- Delete salary structure
- Basic salary and salary component support

### Payroll Management

- Process payroll
- Update payroll
- Approve payroll
- Mark payroll as paid
- Lock payroll
- Unlock payroll
- Batch approve payroll
- Batch lock payroll
- Maintain payroll status history
- Maintain payroll audit history

### Payroll Reports

- Employee payslip JSON
- Payslip PDF export
- Monthly payroll report JSON
- Payroll report CSV export
- Payroll report Excel export

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
Audit Log
RBAC
Validation Middleware
```

---

## User Roles

The system currently supports the following roles:

| Role          | Description                                                                     |
| ------------- | ------------------------------------------------------------------------------- |
| `super_admin` | Highest-level system user with full control                                     |
| `admin`       | Administrative user with broad system access                                    |
| `hr`          | HR user for employee, attendance, leave, holiday, salary and payroll operations |
| `accounts`    | Accounts user for payroll, payment, payslip and report access                   |
| `manager`     | Manager user for approvals and reporting based on permission                    |
| `employee`    | Employee user for limited self-service access                                   |

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
Denied  → 403 Forbidden
```

### Common Permission Groups

| Module           | Read Permission         | Manage Permission            |
| ---------------- | ----------------------- | ---------------------------- |
| User             | `user:read`             | `user:manage`                |
| Branch           | `branch:read`           | `branch:manage`              |
| Department       | `department:read`       | `department:manage`          |
| Employee         | `employee:read`         | `employee:manage`            |
| Attendance       | `attendance:read`       | `attendance:manage`          |
| Leave            | `leave:read`            | `leave:manage`               |
| Leave Approval   | -                       | `leave:approve`              |
| Holiday          | `holiday:read`          | `holiday:manage`             |
| Salary Structure | `salary_structure:read` | `salary_structure:manage`    |
| Payroll          | `payroll:read`          | Payroll-specific permissions |
| Audit Log        | `audit_log:read`        | -                            |

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

## Leave Workflow

The Leave module now supports policy-based leave control.

### Leave Types

```txt
casual
sick
earned
paid
unpaid
maternity
paternity
official
replacement
others
```

### Leave Statuses

```txt
pending
approved
rejected
cancelled
```

### Auto Total Days

`totalDays` is calculated automatically by the backend from `startDate` and `endDate`.

Example:

```txt
2026-05-05 to 2026-05-07 = 3 days
```

Frontend/Postman does not need to send `totalDays`.

### Overlapping Leave Prevention

For the same employee, overlapping active leave is blocked.

Active statuses:

```txt
pending
approved
```

Example:

```txt
Existing: casual, 2026-05-05 to 2026-05-07
New: sick, 2026-05-06 to 2026-05-08
Result: blocked
```

Rejected or cancelled leave does not block future leave.

### Leave Balance Policy

Current policy:

```txt
Casual Leave: 8 days per year
Sick Leave: 10 days per year
```

Only active leave statuses are counted:

```txt
pending
approved
```

Rejected and cancelled leave do not consume balance.

### Management Concern Leave

For these leave types:

```txt
paid
unpaid
others
```

The request requires:

```txt
managementConcern: true
managementConcernNote: string
managementConcernBy: optional user id
```

Important:

```txt
Management concern does not mean final approval.
The leave still starts as pending.
Final approval happens through the leave approval route.
```

### Replacement Leave

Replacement leave is used when an employee works on an official holiday and later takes replacement leave.

Rules:

1. `replacementForDate` is required.
2. `replacementForDate` must exist in Holiday records.
3. Employee must have attendance on that date.
4. Attendance status must be `present` or `late`.
5. Replacement leave must be one day at a time.
6. Replacement leave must be taken after the worked holiday date.
7. Same worked holiday date cannot be reused for another active replacement leave.

Example:

```txt
Worked holiday date: 2026-06-17
Replacement leave date: 2026-06-18
Result: allowed
```

Blocked example:

```txt
Worked holiday date: 2026-06-17
Replacement leave date: 2026-06-17
Result: blocked
```

---

## Payroll Workflow

Payroll follows this general status flow:

```txt
draft → processed → approved → paid
```

### Status Meaning

| Status      | Meaning                                      |
| ----------- | -------------------------------------------- |
| `draft`     | Payroll is created but not finalized         |
| `processed` | Payroll calculation has been processed       |
| `approved`  | Payroll has been approved by authorized user |
| `paid`      | Payroll has been marked as paid              |

### Locking Rule

When payroll is locked:

- Sensitive update should be restricted
- Payroll history should be preserved
- Audit trail should remain available

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

- Authorized roles can access payslips based on permission.
- Employee users can access only their own payslip if linked with employee profile.

---

## Audit Log

Audit log foundation is implemented for tracking important system activities.

Audit log may include:

- Module name
- Action type
- Entity ID
- Previous data
- New data
- Changed fields
- User information
- Request metadata
- Device/network metadata

Future improvement:

- Extend audit logging consistently across all sensitive modules
- Add audit log filtering and export
- Add audit retention policy

---

## API Base URL

Local backend base URL:

```txt
http://localhost:5000/api/v1
```

Health check:

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
├── client/
├── server/
├── .gitignore
└── README.md
```

Server structure:

```txt
server/
├── src/
│   ├── app/
│   │   └── config/
│   ├── config/
│   ├── errors/
│   ├── interface/
│   ├── middleware/
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
│   │   ├── payrollReport/
│   │   └── auditLog/
│   ├── routes/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── package.json
├── tsconfig.json
└── .env
```

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
| `constant.ts`   | Static constants, enums and permissions     |

---

## Environment Variables

Create a `.env` file inside the `server/` folder.

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb+srv://your-db-user:your-db-password@your-cluster.mongodb.net/csrm-payroll?retryWrites=true&w=majority
JWT_ACCESS_SECRET=your_access_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES=7d
```

Never commit real `.env` values to GitHub.

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

Create `.env` inside `server/`, then run:

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

Frontend is scaffolded and will be developed later.

---

## Available Scripts

Run from `server/` folder:

```bash
npm run dev
```

Starts backend in development mode.

```bash
npm run build
```

Compiles TypeScript.

```bash
npm start
```

Runs compiled backend from `dist/server.js`.

Run from `client/` folder:

```bash
npm run dev
```

Starts frontend development server.

```bash
npm run build
```

Builds frontend for production.

---

## API Route Summary

All module routes are mounted under:

```txt
/api/v1
```

| Module           | Base Route                 |
| ---------------- | -------------------------- |
| Auth             | `/api/v1/auth`             |
| Users            | `/api/v1/users`            |
| Branches         | `/api/v1/branches`         |
| Departments      | `/api/v1/departments`      |
| Employees        | `/api/v1/employees`        |
| Attendance       | `/api/v1/attendance`       |
| Leave            | `/api/v1/leave`            |
| Holiday          | `/api/v1/holiday`          |
| Salary Structure | `/api/v1/salary-structure` |
| Payroll          | `/api/v1/payroll`          |
| Payroll Reports  | `/api/v1/payroll-reports`  |
| Audit Logs       | `/api/v1/audit-logs`       |

---

## Postman Testing Guide

Recommended testing order:

```txt
1. Start backend server
2. Login and collect access token
3. Create branch
4. Create department
5. Create employee
6. Create attendance
7. Create leave
8. Create holiday
9. Create salary structure
10. Process payroll
11. Approve payroll
12. Mark payroll as paid
13. Lock payroll
14. Test payslip JSON
15. Test payslip PDF
16. Test payroll report JSON
17. Test CSV export
18. Test Excel export
19. Test RBAC forbidden cases
```

Common header:

```txt
Authorization: Bearer ACCESS_TOKEN
```

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

## Known Development Notes

### Employee and User Difference

```txt
Employee = HR/payroll profile
User = Login account
```

Not every employee needs a user account.

For employee self-service:

```txt
1. Create employee profile
2. Create user with employee role
3. Link user with employee profile
4. Login as employee
5. Use employee token
6. Access own payslip
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
Invalid MongoDB URI
Wrong JWT secret
Wrong role name
Wrong permission constant
Missing Authorization header
Using User ID instead of Employee ID
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

- Complete remaining validation polishing
- Add organization structure support
- Add section/sub-department support
- Add attendance summary report
- Add leave summary report
- Add payroll salary sheet overview report
- Improve PDF/Excel export layout
- Add Swagger/OpenAPI documentation
- Add automated tests
- Add production-grade logging
- Add Docker support
- Add deployment guide
- Add backup and restore guide

### Report Roadmap

Future reports should support:

- Employee-wise report
- Department-wise report
- Sub-department / section-wise report
- Full company report
- Date range filter
- Month/year filter
- PDF export
- Excel export

Expected salary summary format:

```txt
Company Header
Month
Department
Sub-Department
Employee Rows
Sub-Department Total
Grand Total
Signature Section
```

Common salary report columns:

```txt
SL
Office ID
Employee Name
Designation
Att
Leave
Absence
Holiday
Days
Gross Salary
Deducted Amt
Net Salary
```

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
- Payslip view/download UI
- Reports UI
- Audit log UI
- Responsive layout
- Error/loading states
- Form validation

### Future Infrastructure Options

The current project continues with MongoDB + Mongoose.

Future cloned/separate variants may explore:

- Local/on-premise server deployment
- Self-hosted MongoDB
- Dockerized deployment
- PostgreSQL/Oracle alternative backend
- Multi-tenant SaaS version

---

## Production Readiness Checklist

Before production deployment:

```txt
[ ] Complete backend validation polish
[ ] Complete RBAC review
[ ] Complete frontend dashboard
[ ] Add .env.example
[ ] Add Swagger/OpenAPI documentation
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

# Generic Project Startup Track

This document is a reusable project startup blueprint.  
It is not specific to CSRM Payroll System.  
It can be followed for future backend or full-stack projects.

---

## 1. Purpose of This Document

This file keeps a reusable step-by-step track for starting a new software project.

Goal:

- Avoid starting every new project from zero thinking.
- Keep a standard setup process.
- Reuse project structure, documentation style, backend setup, RBAC, audit log, validation, testing, and Git workflow.
- Help future projects become more organized from day one.

---

## 2. Initial Thinking Before Coding

Before starting any project, clarify:

1. What problem will the software solve?
2. Who are the users?
3. What are the main modules?
4. What data needs to be stored?
5. What reports or exports are required?
6. What user roles and permissions are needed?
7. Is approval, lock, or audit log needed?
8. What future expansion may be needed?
9. Will it be single-company, multi-company, or multi-tenant?
10. What data must never be deleted or reused?

Do not start coding only from UI screens.  
First understand business flow, data flow, user roles, and reporting requirements.

---

## 3. Recommended Documentation Folder

Create a `docs/` folder early.

Suggested files:

```txt
docs/
  PROJECT_OVERVIEW.md
  BUSINESS_REQUIREMENTS.md
  MODULE_ROADMAP.md
  DATABASE_DESIGN.md
  API_CONVENTION.md
  RBAC_MATRIX.md
  AUDIT_LOG_STRATEGY.md
  POSTMAN_TESTING_GUIDE.md
  DEPLOYMENT_NOTES.md
  PROJECT_CONTINUITY.md
  NEXT_CHAT_PROMPT.md
```

Important rule:

Project knowledge should not stay only in chat history.  
Important decisions should be written inside the repo.

---

## 4. Standard Backend Stack

For a Node.js backend project:

```txt
Node.js
Express.js
TypeScript
MongoDB / PostgreSQL
Mongoose / Prisma
Zod
JWT
Postman
PDF/Excel export library if reports are needed
```

MongoDB track:

```txt
Node.js + Express.js + TypeScript + MongoDB + Mongoose
```

PostgreSQL track:

```txt
Node.js + Express.js + TypeScript + PostgreSQL + Prisma
```

---

## 5. Initial Repository Structure

Recommended root structure:

```txt
project-name/
  server/
  client/
  docs/
  README.md
  .gitignore
```

Initial Git setup:

```bash
git init
git add .
git commit -m "chore: initial project setup"
```

---

## 6. Backend Initial Setup

Inside `server`:

```bash
npm init -y
npm install express mongoose cors dotenv http-status zod jsonwebtoken bcrypt
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/jsonwebtoken
npx tsc --init
```

Recommended scripts:

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  }
}
```

---

## 7. Standard Backend Folder Structure

```txt
server/src/
  app.ts
  server.ts

  app/
    config/

  errors/
    AppError.ts

  middlewares/
    auth.ts
    validateRequest.ts
    globalErrorHandler.ts
    notFound.ts

  modules/
    auth/
    user/
    exampleModule/

  routes/
    index.ts
    health.route.ts

  utils/
    catchAsync.ts
    sendResponse.ts
```

Standard module structure:

```txt
moduleName/
  moduleName.interface.ts
  moduleName.model.ts
  moduleName.validation.ts
  moduleName.service.ts
  moduleName.controller.ts
  moduleName.route.ts
```

---

## 8. Environment Configuration

Use `.env`:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES_IN=30d
```

Create central config file:

```txt
src/app/config/index.ts
```

Rules:

- Never hard-code secrets.
- Never push `.env` to GitHub.
- Keep all environment variables in one config file.

---

## 9. Database Connection

Database connection should be clean and centralized.

Rules:

1. Use environment variables.
2. Log connection success.
3. Handle connection error properly.
4. Never expose DB credentials.
5. Keep database connection outside business modules.

---

## 10. Core Utilities

Every serious backend should have:

```txt
AppError
catchAsync
sendResponse
globalErrorHandler
validateRequest
notFoundHandler
```

Purpose:

- Consistent API response
- Clean error handling
- Less repeated try/catch
- Better maintainability

---

## 11. Validation Strategy

Use Zod validation for:

```txt
body
params
query
```

Every create/update route should validate input.

Validation should check:

```txt
required fields
ObjectId format
enum values
date format
numeric limits
empty update body
unknown fields
duplicate-sensitive fields
```

---

## 12. Authentication Strategy

Auth module should support:

```txt
login
refresh token
change password
get current user
protected route access
```

Use JWT:

```txt
access token
refresh token
```

Security rules:

- Never return password in response.
- Hash password before saving.
- Protect sensitive routes.
- Use role/permission-based access.

---

## 13. RBAC Strategy

Define:

```txt
roles
permissions
role-permission mapping
route-level authorization
```

Common roles:

```txt
super_admin
admin
hr
accounts
manager
employee
```

Permission pattern:

```txt
module:read
module:manage
module:approve
module:lock
module:export
module:pay
```

Example:

```txt
employee:read
employee:manage
payroll:read
payroll:approve
payroll:lock
payroll_report:export
```

---

## 14. Audit Log Strategy

Audit log should track important actions:

```txt
create
update
delete
soft_delete
approve
reject
lock
unlock
export
login
permission_denied
status_change
```

Audit log should store:

```txt
actor
actor role
module
action
entity
previous data
new data
IP/device/request info
timestamp
```

Audit log is very important for financial, HR, payroll, inventory, approval, and compliance-sensitive systems.

---

## 15. Module Development Order

Recommended backend order:

```txt
1. Health route
2. Config + DB connection
3. Error handling
4. Common utilities
5. Auth
6. User
7. RBAC
8. Audit log foundation
9. Master data modules
10. Main business modules
11. Approval/lock system
12. Reports
13. PDF/Excel export
14. Dashboard APIs
15. Final polish
```

---

## 16. Postman Testing Rule

For every module, test:

```txt
create success
get all
get single
update
soft delete
duplicate validation
invalid ObjectId
missing required field
invalid enum
permission negative test
audit log check
```

Postman environment should include:

```txt
baseUrl
superAdminToken
adminToken
hrToken
accountsToken
managerToken
employeeToken
```

---

## 17. Git Workflow

After every part:

```bash
npm run build
git status
git add changed-files-only
git commit -m "meaningful commit message"
git push origin main
```

Preferred commit types:

```txt
feat:
fix:
docs:
refactor:
test:
chore:
```

Rules:

- Do not commit broken build.
- Do not stage unnecessary files.
- Commit small meaningful parts.
- Push after successful build/test.

---

## 18. Frontend Start Rule

Do not start complex frontend screens before backend master data is stable.

Recommended frontend order:

```txt
1. React/Vite setup
2. Login
3. Layout/sidebar/header
4. Protected routes
5. Role-based menu
6. Master data CRUD screens
7. Main business screens
8. Reports/download screens
9. Dashboard
```

Recommended frontend stack:

```txt
React
Vite
TypeScript
Tailwind CSS
React Router
Axios
TanStack Query
React Hook Form
Zod
shadcn/ui optional
```

---

## 19. Reusable New Project Checklist

Before starting a new project:

```txt
[ ] Business goal clear
[ ] User roles clear
[ ] Module list ready
[ ] Database entities drafted
[ ] API convention decided
[ ] Folder structure created
[ ] Env config ready
[ ] DB connection ready
[ ] Error handling ready
[ ] Validation middleware ready
[ ] Auth module ready
[ ] RBAC strategy ready
[ ] Audit log strategy ready
[ ] Postman environment ready
[ ] GitHub repo ready
[ ] Docs folder ready
```

---

## 20. Golden Rule

A project should not depend only on memory or chat history.

The repo should contain:

```txt
code
documentation
setup track
business decisions
testing guide
next steps
```

That makes the project continueable even after chat deletion.

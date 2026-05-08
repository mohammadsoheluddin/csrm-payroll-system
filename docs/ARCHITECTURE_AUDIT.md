# CSRM Payroll System

# Architecture Audit

# Audit Pass-1

Last Updated:
2026

---

# Current Architecture Stage

The project is no longer a tutorial-level MERN backend.

Current stage:

# Enterprise HRIS + Payroll Platform Architecture

Main focus now:

- stability
- modular consistency
- payroll integrity
- HR lifecycle workflow
- banking automation
- immutable salary history
- reporting scalability
- audit readiness

---

# Core Technology Stack

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- Zod
- PDFKit
- ExcelJS

## Frontend (Planned)

- React
- Vite
- TypeScript
- Tailwind CSS

---

# Current Architecture Style

Current pattern:

```text
server/src/modules/<moduleName>/
```

Each module contains:

interface
model
validation
service
controller
route
Enterprise Foundations Already Implemented
Authentication
JWT authentication
RBAC authorization
role-based route protection
Employee Lifecycle

Implemented:

employee creation
department assignment
designation assignment
employee movement workflow
increment workflow
promotion workflow
transfer workflow
branch transfer workflow
Payroll

Implemented:

payroll generation
payroll processing
payroll approval
payroll lock
payslip generation
payroll reports
CSV export
Excel export
PDF generation
Banking

Implemented:

employee bank info
company bank account
bank sheet generation
bank source account mapping
forwarding letter PDF
Audit & Tracking

Implemented:

audit foundation
payroll audit timeline
movement audit timeline
immutable salary structure versioning
Important Enterprise Rules
Employee ID
permanent
non-editable
non-reusable
Salary Structure

Current architecture:

old version -> inactive
new version -> active

Purpose:

preserve payroll history
preserve increment history
audit-safe salary tracking
Current Risks
Documentation Risk

Project complexity increasing rapidly.

Need:

module dependency map
API documentation
workflow diagrams
reporting flow documentation
Future Migration Risk

Potential future migration considerations:

PostgreSQL
Prisma
microservice separation
event-driven architecture
Recommended Immediate Future Work
High Priority
OT Engine
Festival Bonus Engine
Salary Hold/Release Engine
Salary Advance Engine
Attendance Finalization Engine
Medium Priority
Employee Service Book
HR Analytics
Salary History Graph
Reporting Dashboard
Long-Term
ERP integration
inventory/store integration
finance integration
production integration
transport integration

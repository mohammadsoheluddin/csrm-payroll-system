# Next Chat Prompt — Part-B53 Employee Full Profile / Digital Service Book Backend Foundation

Use this prompt in a fresh ChatGPT chat after uploading the latest full repo ZIP.

---

We are continuing my CSRM Payroll System project.

My current direction is:

```txt
Part-B53 — Employee Full Profile / Digital Service Book Backend Foundation
```

Please inspect the uploaded latest project ZIP first. Do not guess file structure.

Before coding, read these docs if available:

```txt
docs/CSRM_PAYROLL_ENTERPRISE_ROADMAP_AFTER_MODULE_DISCOVERY.md
docs/PART_B53_EMPLOYEE_FULL_PROFILE_DIGITAL_SERVICE_BOOK_BACKEND_FOUNDATION.md
docs/PROJECT_CONTINUATION_DIRECTION_AFTER_FRONTEND_LOCK.md
docs/MODULE_STATUS_TRACKER.md
docs/API_ROUTE_CATALOG.md
docs/BACKEND_PERMISSION_ENDPOINT_MATRIX.md
docs/CODEBASE_RULES.md
```

Current project style:

```txt
Node.js
Express.js
TypeScript
MongoDB
Mongoose
React/Vite frontend exists
Postman testing required
```

Very important development rules:

```txt
1. Inspect repo first.
2. Do not guess file structure.
3. Give full updated files only, not snippets.
4. Mention exact paths.
5. Keep compatibility with existing APIs.
6. Follow existing sendResponse/catchAsync/AppError/validation conventions.
7. Follow current route registration style.
8. Add RBAC carefully.
9. Keep legacy salary imported data separate from native payroll calculation.
10. Provide patch ZIP, verify commands, Postman test guide, and Git commands.
```

Part-B53 expected outcome:

Create a backend aggregation foundation for Employee Full Profile / Digital Service Book.

Recommended module path if compatible with repo style:

```txt
server/src/modules/employeeProfile/
```

Potential files:

```txt
employeeProfile.interface.ts
employeeProfile.service.ts
employeeProfile.controller.ts
employeeProfile.route.ts
employeeProfile.validation.ts
```

Expected API direction:

```txt
GET /api/v1/employees/:id/profile
GET /api/v1/employees/:id/profile/summary
GET /api/v1/employees/:id/profile/payroll-history
GET /api/v1/employees/:id/profile/attendance-summary
GET /api/v1/employees/:id/profile/leave-summary
GET /api/v1/employees/:id/profile/movement-history
GET /api/v1/employees/:id/profile/legacy-salary-archive
```

If the existing route convention suggests a different base, choose the best compatible approach after inspection and explain why.

Profile should aggregate data from current modules where available, such as:

```txt
Employee
Employee Bank Info
Employee Movement
Attendance / Attendance Finalization
Leave / Leave Balance
Payroll
Salary Sheet / Statement
Time Bill / OT
Bonus if safe
Legacy Salary Import Archive
Audit log snapshot if safe
```

Do not implement documents/timeline deeply yet unless the current repo already has required modules. Keep Part-B53 focused and safe.

Data safety rule:

```txt
Legacy imported salary data is archive/history only. It must not update or overwrite native payroll calculation, salary sheet, salary statement, or payment distribution.
```

After implementation, give:

```txt
1. Full updated files
2. Patch ZIP
3. Build/verify commands
4. Postman testing guide
5. Git add/commit/push commands
```

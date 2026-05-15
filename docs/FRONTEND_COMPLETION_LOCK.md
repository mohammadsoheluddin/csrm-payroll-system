# Frontend Completion Lock

Status: **Frontend Pilot-Readiness Candidate**

The CSRM Payroll System frontend foundation is locked after Part-F15.

## Locked Scope

The frontend now includes:

- Auth flow
- Protected routes
- Role/permission-aware sidebar
- Permission-aware actions
- Dashboard foundation
- Master Data screens
- Employee Directory screens
- Attendance and Leave screens
- Payroll and Salary screens
- Reports and Export foundation
- Audit Log and RBAC Audit screens
- Global UI polish
- Route lazy loading
- Smoke-test helper

## Not Final Production Yet

This lock does not mean final commercial release. Before production, the following are still needed:

- Pilot testing with real users
- Full real-data payroll validation
- Report format approval
- Security review
- Backup and restore strategy
- Deployment environment verification
- Performance check with larger data
- Final UAT sign-off

## Change Control Rule

After this lock:

- Do not make random broad frontend edits.
- Add new work as named parts.
- Keep docs updated.
- Run lint/build/smoke test after each major part.
- Commit each part with a clear Git message.

## Recommended Verification Commands

```bash
cd /e/Projects/CSRM-Payroll-System

git status
```

```bash
cd /e/Projects/CSRM-Payroll-System/client
npm run lint
npm run build
```

```bash
cd /e/Projects/CSRM-Payroll-System/server
npm run build
```

```bash
cd /e/Projects/CSRM-Payroll-System
node scripts/frontend-smoke-check.mjs
```

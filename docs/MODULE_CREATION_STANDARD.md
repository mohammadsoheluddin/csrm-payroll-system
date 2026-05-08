# Module Creation Standard

# CSRM Payroll System

---

# PURPOSE

Defines:
standard module creation structure.

---

# REQUIRED FILES

Each module should contain:

- interface.ts
- model.ts
- validation.ts
- service.ts
- controller.ts
- route.ts

---

# OPTIONAL FILES

- constant.ts
- utils.ts
- aggregation.ts

---

# ROUTING RULE

All module routes should register through:
src/routes/index.ts

---

# VALIDATION RULE

All create/update requests should use:
Zod validation.

---

# IMPORTANT RULE

Module naming should remain:
consistent and predictable.

---

# FUTURE GOALS

- reusable module template
- CLI generator
- shared base service

# Environment Variable Standard

# CSRM Payroll System

---

# PURPOSE

Defines:
environment variable naming and usage standard.

---

# COMMON VARIABLES

PORT=
NODE_ENV=

DATABASE_URL=

JWT_ACCESS_SECRET=
JWT_ACCESS_EXPIRES=

JWT_REFRESH_SECRET=
JWT_REFRESH_EXPIRES=

---

# IMPORTANT RULES

## Never hardcode:

- secret
- token
- DB credentials

---

# ENV FILE TYPES

.env
.env.development
.env.production

---

# FUTURE VARIABLES

- Redis
- SMTP
- Storage
- Queue system

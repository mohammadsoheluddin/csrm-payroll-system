# Leave Engine Design

# CSRM Payroll System

---

# PURPOSE

Leave Engine manages:

- leave application
- leave approval
- leave deduction impact
- replacement leave
- leave summary
- leave balance

---

# SUPPORTED LEAVE TYPES

- Casual Leave
- Sick Leave
- Earned Leave
- Paid Leave
- Unpaid Leave
- Maternity Leave
- Paternity Leave
- Official Leave
- Replacement Leave
- Others Leave

---

# CORE RESPONSIBILITIES

- leave request
- leave validation
- leave approval
- leave rejection
- leave balance tracking
- leave reporting

---

# IMPORTANT BUSINESS RULES

## Paid Leave

Does NOT reduce salary.

---

## Unpaid Leave

Reduces salary.

---

## Replacement Leave

Special rule:

Employee must:

- work on holiday
- have attendance on holiday
- apply replacement leave later

System must validate:

- holiday attendance
- replacement usage
- duplicate replacement prevention

---

# APPROVAL FLOW

Employee
↓
Manager/HR Review
↓
Approval / Rejection
↓
Attendance Impact
↓
Payroll Impact

---

# FUTURE FEATURES

- leave carry forward
- yearly leave allocation
- auto leave deduction
- leave encashment
- leave calendar
- leave analytics
- delegated approval

---

# LEAVE OUTPUTS

Leave Engine feeds:

- Attendance Engine
- Salary Sheet Engine
- Reporting Engine
- HR Analytics

---

# IMPORTANT ARCHITECTURE RULE

Leave should modify attendance state,
NOT directly modify salary calculation.

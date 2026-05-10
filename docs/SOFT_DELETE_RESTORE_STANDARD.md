# CSRM Payroll System — Soft Delete / Restore Standard

Created: 2026-05-10  
Created In: Part-48.0 — Docs Sync & Current State Lock  
Implementation Starts From: Part-48.1

---

## 1. Purpose

This document defines the standard soft delete and restore behavior for the CSRM Payroll System.

The project already uses `isDeleted` in many modules, but the behavior is not fully standardized yet. This standard exists to make delete/restore behavior consistent, auditable, safe, and enterprise-ready.

---

## 2. Why Soft Delete Is Important

In payroll, HR, attendance, leave, bank payment, bonus, and audit systems, data should not be physically removed casually.

Reasons:

1. Payroll data has legal and compliance value.
2. Attendance and leave records affect salary calculations.
3. Employee records connect multiple historical transactions.
4. Salary sheet, time bill, OT, bonus, and bank sheets may be audited later.
5. Deleted records may need to be restored if removed by mistake.
6. Hard delete breaks history, audit, reports, and reconciliation.

Therefore, most business records should use soft delete instead of hard delete.

---

## 3. Standard Soft Delete Fields

Recommended common fields:

```ts
isDeleted: boolean;
deletedAt?: Date | null;
deletedBy?: ObjectId | null;
deleteReason?: string | null;
restoredAt?: Date | null;
restoredBy?: ObjectId | null;
restoreReason?: string | null;
updatedBy?: ObjectId | null;
```

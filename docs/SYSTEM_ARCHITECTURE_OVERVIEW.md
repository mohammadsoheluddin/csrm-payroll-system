# System Architecture Overview

# CSRM Payroll System

---

# PURPOSE

This document explains:

- overall system architecture
- engine relationships
- data flow
- module boundaries

---

# SYSTEM TYPE

Enterprise HRIS + Payroll + Industrial Payment Processing Platform

---

# HIGH LEVEL ARCHITECTURE

Employee Lifecycle
↓
Attendance Engine
↓
Leave Engine
↓
Attendance Finalization
↓
Salary Sheet Engine
↓
Statement Engine
↓
Bank/Cash Distribution
↓
Payment Processing

AND

Attendance Finalization
↓
Time Bill Engine
↓
OT Statement
↓
OT Payment

---

# CORE ENGINES

## Attendance Engine

Source of attendance truth.

---

## Leave Engine

Controls leave validation and leave impact.

---

## Salary Sheet Engine

Handles core monthly salary processing.

---

## Time Bill Engine

Handles OT processing separately.

---

## Statement Engine

Handles accounting/payment distribution.

---

## Payment Distribution Engine

Handles:

- bank
- cash
- deduction distribution

---

## Reporting Engine

Generates:

- HR reports
- payroll reports
- analytics

---

# IMPORTANT ARCHITECTURE PRINCIPLES

- modular architecture
- engine separation
- immutable audit history
- payroll snapshot preservation
- accounting-safe workflow

---

# IMPORTANT BUSINESS REALIZATION

Salary Sheet
≠
Time Bill
≠
Statement
≠
Bank Sheet

These are separate but connected systems.

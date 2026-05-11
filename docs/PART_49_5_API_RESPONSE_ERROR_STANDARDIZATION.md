# Part-49.5 — API Response + Error Standardization

Created: 2026-05-11

---

## 1. Purpose

This part standardizes the API response and error response layer of the CSRM Payroll System backend.

The goal is to make API behavior predictable for the future frontend, Postman testing, audit review, and client-side error handling.

---

## 2. Standard Success Response Shape

All successful API responses should follow this structure:

```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  },
  "data": {}
}
```

Rules:

- `success` must always be `true` for successful responses.
- `message` should be human-readable.
- `meta` should only be included when pagination or summary metadata exists.
- `data` should always contain the actual response data.

---

## 3. Standard Error Response Shape

All failed API responses should follow this structure:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": [
    {
      "path": "body.company",
      "message": "Invalid company ID"
    }
  ]
}
```

In development mode only, `stack` may be included.

In production mode, internal server errors should not expose sensitive stack traces or raw technical messages.

---

## 4. Files Updated

- `server/src/utils/sendResponse.ts`
- `server/src/utils/apiResponse.ts`
- `server/src/errors/AppError.ts`
- `server/src/interface/error.ts`
- `server/src/middleware/globalErrorHandler.ts`

---

## 5. What Changed

### 5.1 `sendResponse.ts`

The response helper now:

- returns a clean success response body
- omits `meta` when it is not provided
- provides a default success message if a controller forgets to pass one
- keeps existing controller usage compatible

Existing controller calls like this still work:

```ts
sendResponse(res, {
  statusCode: 200,
  success: true,
  message: "Companies retrieved successfully",
  data: result,
});
```

### 5.2 `apiResponse.ts`

A new helper file was added for future controller cleanup.

It includes:

- `buildPaginationMeta`
- `sendOkResponse`
- `sendCreatedResponse`
- `sendDeletedResponse`
- `sendRestoredResponse`

This is optional for now. Existing controllers do not need to be rewritten immediately.

### 5.3 `AppError.ts`

`AppError` now supports optional custom `errorSources`.

Example:

```ts
throw new AppError(400, "Invalid request", [
  {
    path: "body.month",
    message: "Month must be between 1 and 12",
  },
]);
```

### 5.4 `globalErrorHandler.ts`

The global error handler now handles:

- Zod validation errors
- Invalid JSON body errors
- Mongoose cast errors
- Mongoose validation errors
- MongoDB duplicate key errors
- AppError with optional custom error sources
- Generic errors
- Production-safe 500 errors

---

## 6. Frontend Benefit

The future React frontend can now safely expect:

Successful response:

```ts
response.success === true
response.data
response.meta
```

Failed response:

```ts
response.success === false
response.message
response.errorSources
```

This makes toast messages, form errors, table pagination, and global error handling much cleaner.

---

## 7. Postman Quick Tests

### 7.1 Valid API Request

```http
GET /api/v1/companies
```

Expected:

```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": []
}
```

### 7.2 Invalid ObjectId

```http
GET /api/v1/companies/abc
```

Expected:

```json
{
  "success": false,
  "message": "Validation failed",
  "errorSources": []
}
```

or module-specific invalid ID error if route validation is not yet applied.

### 7.3 Invalid JSON Body

Send malformed JSON to any POST/PATCH endpoint.

Expected:

```json
{
  "success": false,
  "message": "Invalid JSON payload",
  "errorSources": [
    {
      "path": "",
      "message": "Request body contains invalid JSON"
    }
  ]
}
```

### 7.4 Duplicate Key Error

Create a record with an already used unique code/name where unique index exists.

Expected:

```json
{
  "success": false,
  "message": "Duplicate key error",
  "errorSources": [
    {
      "path": "code",
      "message": "code already exists"
    }
  ]
}
```

---

## 8. Important Note

This part does not rewrite all controllers.

It standardizes the response and error foundation first. A later cleanup pass can gradually replace repetitive controller response blocks with `apiResponse.ts` helpers.

---

## 9. Next Part

Recommended next part:

Part-49.6 — Route Sanity + Endpoint Conflict Check

Focus:

- route order
- `/deleted` before `/:id`
- `/summary` before `/:id`
- `/export` before `/:id`
- route permission consistency
- missing validation middleware checks

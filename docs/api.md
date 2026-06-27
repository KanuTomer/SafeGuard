# API Documentation

## Overview

The SafeGuard API will be implemented with Express and JavaScript.

## Planned Route Groups

- `/api/health`
- `/api/auth`
- `/api/users`
- `/api/emergencies`
- `/api/evidence`

## Current Endpoints

### GET /api/health

Checks whether the backend API can respond successfully.

#### Request

No body, query parameters, or authentication required.

#### Response: 200 OK

```json
{
  "success": true,
  "message": "SafeGuard API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-06-27T00:00:00.000Z"
  }
}
```

#### Error Responses

Unknown routes return the standard error format:

```json
{
  "success": false,
  "message": "Route not found: /missing-route",
  "errors": []
}
```

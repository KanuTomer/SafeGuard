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

### POST /api/auth/register

Creates a new user account and returns a JWT.

#### Request

```json
{
  "name": "Kanu Tomer",
  "email": "kanu@example.com",
  "password": "Password123",
  "phone": "+911234567890"
}
```

#### Response: 201 Created

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Kanu Tomer",
      "email": "kanu@example.com",
      "phone": "+911234567890"
    },
    "token": "jwt_token"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation failed
- `409 Conflict`: email is already registered
- `500 Internal Server Error`: unexpected server error

### POST /api/auth/login

Authenticates an existing user and returns a JWT.

#### Request

```json
{
  "email": "kanu@example.com",
  "password": "Password123"
}
```

#### Response: 200 OK

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Kanu Tomer",
      "email": "kanu@example.com",
      "phone": "+911234567890"
    },
    "token": "jwt_token"
  }
}
```

#### Error Responses

- `400 Bad Request`: validation failed
- `401 Unauthorized`: invalid email or password
- `500 Internal Server Error`: unexpected server error

### GET /api/auth/me

Returns the authenticated user's profile.

#### Request

```text
Authorization: Bearer <jwt_token>
```

#### Response: 200 OK

```json
{
  "success": true,
  "message": "Current user retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Kanu Tomer",
      "email": "kanu@example.com",
      "phone": "+911234567890"
    }
  }
}
```

#### Error Responses

- `401 Unauthorized`: missing token
- `401 Unauthorized`: invalid or expired token
- `401 Unauthorized`: token user no longer exists
- `500 Internal Server Error`: unexpected server error

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

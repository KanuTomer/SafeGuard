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

### GET /api/users/me

Returns the authenticated user's profile and embedded emergency contacts.

Authentication required.

#### Response: 200 OK

```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Kanu Tomer",
      "email": "kanu@example.com",
      "phone": "+911234567890",
      "contacts": []
    }
  }
}
```

### PATCH /api/users/me

Updates the authenticated user's editable profile fields.

Authentication required.

Allowed fields:

```json
{
  "name": "Updated Name",
  "phone": "+919999999999"
}
```

Email and password changes are not supported by this endpoint.

### GET /api/users/me/contacts

Lists the authenticated user's embedded emergency contacts.

Authentication required.

### POST /api/users/me/contacts

Adds an embedded emergency contact to the authenticated user.

Authentication required.

```json
{
  "name": "Parent",
  "phone": "+911111111111",
  "email": "parent@example.com",
  "relationship": "Father"
}
```

`name` is required. At least one of `phone` or `email` is required.

### PATCH /api/users/me/contacts/:contactId

Updates one embedded emergency contact by subdocument id.

Authentication required.

### DELETE /api/users/me/contacts/:contactId

Deletes one embedded emergency contact by subdocument id.

Authentication required.

#### Error Responses

Unknown routes return the standard error format:

```json
{
  "success": false,
  "message": "Route not found: /missing-route",
  "errors": []
}
```

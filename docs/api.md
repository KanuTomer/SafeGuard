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

### POST /api/emergencies

Creates a new active emergency session for the authenticated user.

Authentication required.

#### Request

The request body may be empty. `initialLocation` is optional.

```json
{
  "initialLocation": {
    "latitude": 28.6139,
    "longitude": 77.209,
    "accuracy": 12,
    "timestamp": "2026-06-27T12:00:00.000Z"
  }
}
```

#### Response: 201 Created

```json
{
  "success": true,
  "message": "Emergency session created successfully",
  "data": {
    "emergency": {
      "id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "status": "active",
      "startedAt": "2026-06-27T12:00:00.000Z",
      "endedAt": null,
      "initialLocation": null,
      "lastKnownLocation": null,
      "contactsSnapshot": []
    }
  }
}
```

#### Error Responses

- `400 Bad Request`: invalid initial location
- `401 Unauthorized`: missing or invalid token
- `409 Conflict`: active emergency session already exists

### GET /api/emergencies/active

Returns the authenticated user's active emergency session, or `null` if none exists.

Authentication required.

### GET /api/emergencies

Lists the authenticated user's emergency sessions, newest first.

Authentication required.

### GET /api/emergencies/:emergencyId

Returns one emergency session owned by the authenticated user.

Authentication required.

#### Error Responses

- `400 Bad Request`: invalid emergency session id
- `404 Not Found`: emergency session does not exist or belongs to another user

### PATCH /api/emergencies/:emergencyId/end

Ends one active emergency session owned by the authenticated user.

Authentication required.

#### Error Responses

- `400 Bad Request`: invalid emergency session id
- `404 Not Found`: emergency session does not exist or belongs to another user
- `409 Conflict`: emergency session has already ended

### POST /api/emergencies/:emergencyId/locations

Adds one location point to an active emergency session owned by the authenticated user.

Authentication required.

#### Request

```json
{
  "latitude": 28.6139,
  "longitude": 77.209,
  "accuracy": 12,
  "recordedAt": "2026-06-27T12:00:00.000Z"
}
```

#### Response: 201 Created

```json
{
  "success": true,
  "message": "Location point created successfully",
  "data": {
    "location": {
      "id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "emergencySession": "507f1f77bcf86cd799439013",
      "latitude": 28.6139,
      "longitude": 77.209,
      "accuracy": 12,
      "recordedAt": "2026-06-27T12:00:00.000Z"
    }
  }
}
```

#### Error Responses

- `400 Bad Request`: invalid emergency session id or invalid location payload
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: emergency session does not exist or belongs to another user
- `409 Conflict`: emergency session has already ended

### GET /api/emergencies/:emergencyId/locations

Lists location points for one owned emergency session, sorted oldest to newest.

Authentication required.

#### Error Responses

- `400 Bad Request`: invalid emergency session id
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: emergency session does not exist or belongs to another user

### POST /api/emergencies/:emergencyId/evidence

Uploads one image or audio evidence file to an active emergency session owned by the authenticated user.

Authentication required.

#### Request

Multipart form-data:

```text
file: image or audio file
notes: optional text, max 500 characters
```

Accepted file types:

```text
image/jpeg
image/png
image/webp
audio/mpeg
audio/wav
audio/mp4
audio/aac
audio/webm
```

Maximum file size: `10 MB`.

#### Response: 201 Created

```json
{
  "success": true,
  "message": "Evidence uploaded successfully",
  "data": {
    "evidence": {
      "id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "emergencySession": "507f1f77bcf86cd799439013",
      "type": "image",
      "originalName": "door.png",
      "mimeType": "image/png",
      "size": 120000,
      "cloudinaryPublicId": "safeguard/evidence/file",
      "url": "http://res.cloudinary.com/example/file",
      "secureUrl": "https://res.cloudinary.com/example/file",
      "notes": "Front door photo"
    }
  }
}
```

#### Error Responses

- `400 Bad Request`: missing file, invalid file type, oversized file, invalid notes, or invalid emergency session id
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: emergency session does not exist or belongs to another user
- `409 Conflict`: emergency session has already ended
- `502 Bad Gateway`: Cloudinary upload failed

### GET /api/emergencies/:emergencyId/evidence

Lists evidence files for one owned emergency session, sorted newest first.

Authentication required.

#### Error Responses

- `400 Bad Request`: invalid emergency session id
- `401 Unauthorized`: missing or invalid token
- `404 Not Found`: emergency session does not exist or belongs to another user

## Socket.io Events

Socket clients authenticate with a JWT in the connection auth payload:

```js
io('http://localhost:5000', {
  auth: {
    token: 'jwt_token',
  },
});
```

### emergency:join

Joins a realtime emergency room after verifying the emergency session belongs to the authenticated user.

#### Client Payload

```json
{
  "emergencyId": "507f1f77bcf86cd799439011"
}
```

#### Server Response Event

`emergency:joined`

```json
{
  "emergencyId": "507f1f77bcf86cd799439011",
  "room": "emergency:507f1f77bcf86cd799439011"
}
```

### emergency:leave

Leaves a realtime emergency room.

#### Server Response Event

`emergency:left`

```json
{
  "emergencyId": "507f1f77bcf86cd799439011",
  "room": "emergency:507f1f77bcf86cd799439011"
}
```

### location:created

Broadcast by the server to `emergency:<emergencyId>` after the REST location endpoint creates a location point.

```json
{
  "location": {
    "id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "emergencySession": "507f1f77bcf86cd799439013",
    "latitude": 28.6139,
    "longitude": 77.209,
    "accuracy": 12,
    "recordedAt": "2026-06-27T12:00:00.000Z"
  }
}
```

### socket:error

Emitted for invalid room access, invalid emergency ids, and unauthorized emergency sessions.

```json
{
  "message": "Emergency session not found"
}
```

## Standard Error Responses

Unknown routes return the standard error format:

```json
{
  "success": false,
  "message": "Route not found: /missing-route",
  "errors": []
}
```

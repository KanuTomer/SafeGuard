# Architecture

## Overview

SafeGuard uses a MERN-focused monorepo with three applications:

- `backend`: Express API and server-side application logic
- `dashboard`: React web dashboard built with Vite and Material UI
- `mobile`: React Native mobile application

## Backend Flow

```text
Routes -> Controllers -> Services -> Models
```

This structure keeps Express code readable while teaching common MERN architecture.

## Current Status

The backend currently supports authentication, user profiles, embedded emergency contacts, emergency sessions, location history, and Socket.io realtime location broadcasts.

## Backend Startup Flow

```text
server.js
  -> loads environment config
  -> initializes MongoDB connection
  -> creates an HTTP server from the Express app
  -> initializes Socket.io on the HTTP server
  -> starts listening for REST and Socket.io traffic

app.js
  -> configures Express middleware
  -> mounts route modules
  -> handles 404 responses
  -> handles global errors
```

The split between `app.js` and `server.js` keeps tests simple because Supertest can import the Express app without opening a network port or connecting to MongoDB.

Socket.io is attached in `server.js` because realtime traffic needs the underlying HTTP server. The initialized `io` instance is stored on the Express app so REST controllers can broadcast events after successful database writes.

## Realtime Flow

```text
Client connects with JWT
  -> Socket.io authenticates the token
  -> client emits emergency:join
  -> server verifies emergency ownership
  -> socket joins emergency:<emergencyId>
  -> REST location creation succeeds
  -> server broadcasts location:created to the emergency room
```

REST remains the source of truth for writes. Socket.io currently handles subscription and broadcast only.

## Folder Responsibilities

### backend/src/config

Environment, database, Cloudinary, and other infrastructure configuration.

### backend/src/controllers

Request/response handlers that call services.

### backend/src/middleware

Express middleware for auth, errors, validation, uploads, and request handling.

### backend/src/models

Mongoose schemas and models.

### backend/src/routes

Express route definitions.

### backend/src/services

Business logic and database operations.

### backend/src/utils

Reusable helper functions.

### backend/src/validators

Request validation logic.

### backend/src/tests

Jest and Supertest tests.

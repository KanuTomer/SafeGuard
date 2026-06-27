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

Milestone 1 adds the backend foundation: Express setup, environment configuration, MongoDB connection setup, health routing, and centralized error handling.

Authentication, business models, emergency APIs, uploads, and realtime behavior will be added in later milestones.

## Backend Startup Flow

```text
server.js
  -> loads environment config
  -> initializes MongoDB connection
  -> starts the Express server

app.js
  -> configures Express middleware
  -> mounts route modules
  -> handles 404 responses
  -> handles global errors
```

The split between `app.js` and `server.js` keeps tests simple because Supertest can import the Express app without opening a network port or connecting to MongoDB.

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

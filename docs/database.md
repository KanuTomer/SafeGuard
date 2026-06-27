# Database Documentation

## Overview

SafeGuard will use MongoDB with Mongoose.

## Planned Collections

- `users`
- `emergencysessions`
- `locationpoints`
- `evidences`

## Current Status

Milestone 1 adds the MongoDB connection layer only.

No schemas or models are implemented yet.

## Connection Strategy

The backend reads `MONGODB_URI` from environment variables and connects through Mongoose in `backend/src/config/db.js`.

If `MONGODB_URI` is missing during local development, the server logs a warning and continues running so the health endpoint can still be tested.

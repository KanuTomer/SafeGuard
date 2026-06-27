# Database Documentation

## Overview

SafeGuard will use MongoDB with Mongoose.

## Planned Collections

- `users`
- `emergencysessions`
- `locationpoints`
- `evidences`

## Current Status

Milestone 2 adds the User model for authentication.

Emergency contacts are included as an embedded array in the User schema for the planned Milestone 3 contact CRUD work, but contact endpoints are not implemented yet.

## Connection Strategy

The backend reads `MONGODB_URI` from environment variables and connects through Mongoose in `backend/src/config/db.js`.

If `MONGODB_URI` is missing during local development, the server logs a warning and continues running so the health endpoint can still be tested.

## User Model

```text
name
email
password
phone
contacts
createdAt
updatedAt
```

### Fields

`name`: required display name, trimmed, 2-80 characters.

`email`: required login identifier, trimmed, lowercased, valid email format, unique.

`password`: required bcrypt hash, minimum 8 characters before hashing, excluded from default query results.

`phone`: optional phone number stored as a trimmed string.

`contacts`: embedded array reserved for future emergency contacts.

`createdAt` and `updatedAt`: managed by Mongoose timestamps.

### Indexes

`email` has a unique index so MongoDB enforces one account per email address.

### Password Hashing

The User model hashes passwords with bcrypt in a pre-save hook. Passwords are only hashed when the password field is new or modified.

The model also exposes `comparePassword(candidatePassword)` for login checks.

## Embedded Emergency Contacts

Emergency contacts are stored inside the owning User document:

```text
contacts[]
  _id
  name
  phone
  email
  relationship
```

This is intentional for the MVP because it teaches MongoDB embedded subdocuments and keeps contact CRUD close to common MERN portfolio patterns.

Contacts are always accessed through the authenticated user, so a separate ownership field is not required in this milestone.

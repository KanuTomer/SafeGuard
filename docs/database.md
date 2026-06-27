# Database Documentation

## Overview

SafeGuard will use MongoDB with Mongoose.

## Planned Collections

- `users`
- `emergencysessions`
- `locationpoints`
- `evidences`

## Current Status

The backend currently includes the User model for authentication, embedded emergency contacts, and the EmergencySession model for SOS session lifecycle tracking.

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

`contacts`: embedded array of emergency contacts owned by the user.

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

## EmergencySession Model

```text
user
status
startedAt
endedAt
initialLocation
lastKnownLocation
contactsSnapshot
createdAt
updatedAt
```

### Fields

`user`: required ObjectId reference to the User who started the emergency session.

`status`: session lifecycle state, either `active` or `ended`.

`startedAt`: when emergency mode began.

`endedAt`: when emergency mode ended, or `null` while active.

`initialLocation`: optional location captured when the session starts.

`lastKnownLocation`: currently initialized from `initialLocation`; future location milestones will update it.

`contactsSnapshot`: embedded copy of the user's emergency contacts at session creation time.

`createdAt` and `updatedAt`: managed by Mongoose timestamps.

### Indexes

`user` is indexed for ownership-based lookups.

`status` is indexed for active-session queries.

The compound index `{ user: 1, status: 1, startedAt: -1 }` supports finding a user's active session and listing sessions by recency.

A partial unique index on `{ user: 1, status: 1 }` where `status` is `active` enforces one active emergency session per user at the database level.

### Design Notes

Emergency sessions use a separate collection because sessions are event records that can grow over time and should not be embedded inside the User document.

`contactsSnapshot` intentionally duplicates contact data so each emergency session preserves who the user had configured when the session started, even if the user later edits their contacts.

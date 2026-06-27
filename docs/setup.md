# Setup Guide

## Prerequisites

- Node.js
- npm
- Git
- MongoDB Atlas account for later backend milestones
- Android Studio or Xcode for later React Native development

## Install Dependencies

```bash
npm install
npm --prefix backend install
npm --prefix dashboard install
npm --prefix mobile install
```

## Environment Files

Create local environment files from the examples when a milestone requires them:

```bash
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
cp mobile/.env.example mobile/.env
```

Backend variables:

```text
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/safeguard
CLIENT_URL=http://localhost:5173
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
```

## Development Commands

```bash
npm run backend:dev
npm run dashboard:dev
npm run mobile:start
```

Backend health check:

```bash
curl http://localhost:5000/api/health
```

## Backend Tests

Backend authentication tests use `mongodb-memory-server` so Mongoose schemas, password hashing hooks, unique indexes, and queries can be tested without touching MongoDB Atlas.

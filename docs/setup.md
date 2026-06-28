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
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_FOLDER=safeguard/evidence
```

Dashboard variables:

```text
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Mobile variables:

```text
API_BASE_URL=http://10.0.2.2:5000
SOCKET_URL=http://10.0.2.2:5000
```

`10.0.2.2` lets the Android emulator reach the backend running on the host machine at `localhost:5000`.

For physical-device testing against the deployed backend, use:

```text
API_BASE_URL=https://safeguard-bi4x.onrender.com
SOCKET_URL=https://safeguard-bi4x.onrender.com
```

## Development Commands

```bash
npm run backend:dev
npm run dashboard:dev
npm run mobile:start
npm run mobile:android
```

Backend health check:

```bash
curl http://localhost:5000/api/health
```

## Deployment

Render, Vercel, MongoDB Atlas, and Cloudinary setup instructions are maintained in [`docs/deployment.md`](deployment.md).

Current deployed backend:

```text
https://safeguard-bi4x.onrender.com
```

Run the deployed API smoke test:

```bash
npm run smoke:deployment
```

Dashboard production environment values:

```text
VITE_API_BASE_URL=https://safeguard-bi4x.onrender.com
VITE_SOCKET_URL=https://safeguard-bi4x.onrender.com
```

## Backend Tests

Backend authentication tests use `mongodb-memory-server` so Mongoose schemas, password hashing hooks, unique indexes, and queries can be tested without touching MongoDB Atlas.

## Dashboard Tests

Dashboard tests use Vitest, React Testing Library, and mocked API/socket services to verify routing, authentication, emergency summaries, detail views, empty states, and realtime UI updates.

## Mobile Tests

Mobile tests use Jest, React Test Renderer, and mocked API/location/storage services to verify login, persisted auth, SOS state, manual location sending, location permission errors, and logout.

# SafeGuard

SafeGuard is a portfolio-focused MERN and React Native project for learning full-stack application development through a personal safety emergency-assistance app.

This project is not intended for real emergency use. It is a learning project designed to practice clean architecture, API design, MongoDB modeling, React, React Native, testing, documentation, and Git workflow.

## Goals

- Strengthen MongoDB, Express, React, React Native, and Node.js skills.
- Practice professional project organization in a monorepo.
- Build an interview-friendly portfolio project.
- Learn REST APIs, JWT authentication, Socket.io, file uploads, and testing incrementally.
- Keep the architecture understandable and maintainable without unnecessary enterprise patterns.

## Tech Stack

- Backend: Node.js, Express.js, JavaScript
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt
- Realtime: Socket.io
- Storage: Cloudinary
- Dashboard: React, Vite, Material UI, JavaScript
- Mobile: React Native, JavaScript
- Testing: Jest, Supertest
- Tooling: ESLint, Prettier, Git

## Folder Structure

```text
SafeGuard/
  backend/    Express API, Mongoose models, services, middleware, and tests
  dashboard/  React + Vite web dashboard
  mobile/     React Native mobile application
  docs/       Architecture, API, database, setup, and decision documentation
```

## Roadmap

1. Project foundation
2. Backend foundation
3. Authentication
4. User profile and embedded emergency contacts
5. Emergency sessions
6. Location history
7. Realtime Socket.io updates
8. Evidence uploads with Cloudinary
9. React dashboard MVP
10. React Native mobile MVP
11. Deployment, smoke tests, and portfolio polish

## Setup

Install dependencies from each workspace:

```bash
npm install
npm --prefix backend install
npm --prefix dashboard install
npm --prefix mobile install
```

Copy environment examples before running future milestones:

```bash
cp backend/.env.example backend/.env
cp dashboard/.env.example dashboard/.env
cp mobile/.env.example mobile/.env
```

Development commands:

```bash
npm run backend:dev
npm run dashboard:dev
npm run mobile:start
npm run mobile:android
```

For Android emulator testing, the mobile app uses `http://10.0.2.2:5000` to reach the local backend running on your development machine.

Backend health check:

```bash
curl http://localhost:5000/api/health
```

Deployment smoke test:

```bash
npm run smoke:deployment
```

The deployed backend currently runs at:

```text
https://safeguard-bi4x.onrender.com
```

Deployment instructions are maintained in [docs/deployment.md](docs/deployment.md).

Authentication endpoints:

```text
POST /api/auth/register
POST /api/auth/login
GET /api/auth/me
```

User profile and contact endpoints:

```text
GET /api/users/me
PATCH /api/users/me
GET /api/users/me/contacts
POST /api/users/me/contacts
PATCH /api/users/me/contacts/:contactId
DELETE /api/users/me/contacts/:contactId
```

Emergency session endpoints:

```text
POST /api/emergencies
GET /api/emergencies/active
GET /api/emergencies
GET /api/emergencies/:emergencyId
PATCH /api/emergencies/:emergencyId/end
POST /api/emergencies/:emergencyId/locations
GET /api/emergencies/:emergencyId/locations
POST /api/emergencies/:emergencyId/evidence
GET /api/emergencies/:emergencyId/evidence
```

Realtime Socket.io events:

```text
emergency:join
emergency:leave
emergency:joined
emergency:left
location:created
socket:error
```

Evidence uploads are handled through Cloudinary-backed backend endpoints.

## Dashboard MVP

The dashboard provides the primary deployed MVP workflow: registration, login, emergency contact setup, emergency start/end controls, manual location updates, evidence upload, emergency history, evidence metadata, and realtime location updates.

## Mobile MVP

The mobile app provides login, persisted auth, SOS start/end controls, active emergency status, and manual current-location updates from Android.

## Future Features

- mobile deployed-backend configuration polish
- Mobile evidence capture
- API and database documentation

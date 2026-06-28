# Progress

## Milestone 0 ✅

### Summary

Created the SafeGuard monorepo foundation with separate `backend`, `dashboard`, `mobile`, and `docs` folders. Initialized the dashboard with Vite, initialized the mobile app with the React Native Community CLI, added root project documentation, and configured linting/formatting.

### Lessons Learned

- A monorepo keeps the complete MERN project easy to navigate.
- Generated scaffolds are useful, but they sometimes need cleanup to match project decisions.
- JavaScript-first setup is simpler for the current MERN learning goal.

### Repository Status

- Git repository initialized.
- Initial foundation committed with `chore: initialize SafeGuard monorepo`.
- Root-level scripts can run project linting, tests, formatting, and dashboard build tasks.

## Milestone 1

### Summary

Adds the backend foundation: Express middleware, environment configuration, MongoDB connection setup, health endpoint, 404 handling, global error handling, shared API response helpers, and a Supertest health test.

### Lessons Learned

- Splitting `app.js` and `server.js` makes Express apps easier to test.
- A dedicated config layer prevents scattered `process.env` usage.
- Centralized response and error formats make future frontend integration easier.

### Files Added

- `backend/src/config/env.js`
- `backend/src/config/db.js`
- `backend/src/controllers/healthController.js`
- `backend/src/routes/healthRoutes.js`
- `backend/src/middleware/errorMiddleware.js`
- `backend/src/middleware/notFoundMiddleware.js`
- `backend/src/utils/apiResponse.js`
- `backend/src/tests/health.test.js`

### Next Milestone

Milestone 2 will implement authentication with the User model, bcrypt password hashing, JWT login/register flows, protected route middleware, and authentication tests.

## Milestone 2

### Summary

Adds backend authentication with a Mongoose User model, bcrypt password hashing, JWT registration and login, protected current-user route, request validation, auth middleware, and API tests.

### Lessons Learned

- Passwords should be stored as hashes, never raw strings.
- JWTs are useful for API-first applications with mobile and web clients.
- Auth middleware keeps protected routes consistent and reusable.
- Duplicate email checks belong in service logic, while unique indexes belong in MongoDB.
- `mongodb-memory-server` gives auth tests real Mongoose behavior without requiring a shared test database.

### Files Added

- `backend/src/models/User.js`
- `backend/src/controllers/authController.js`
- `backend/src/routes/authRoutes.js`
- `backend/src/services/authService.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/utils/generateToken.js`
- `backend/src/validators/authValidator.js`
- `backend/src/tests/auth.test.js`

### Next Milestone

Milestone 3 will add user profile and embedded emergency contacts CRUD.

## Milestone 3

### Summary

Adds protected user profile endpoints and embedded emergency contacts CRUD inside the existing User document.

### Lessons Learned

- Embedded MongoDB subdocuments are a good fit for small user-owned lists.
- Route-level auth middleware keeps profile and contact APIs protected.
- Services keep contact lookup and update logic out of controllers.
- Profile update endpoints should explicitly allow fields instead of trusting the full request body.

### Files Added

- `backend/src/controllers/userController.js`
- `backend/src/routes/userRoutes.js`
- `backend/src/services/userService.js`
- `backend/src/validators/userValidator.js`
- `backend/src/tests/user.test.js`

### Next Milestone

Milestone 4 will add emergency session creation, status management, and session history.

## Milestone 4

### Summary

Adds the backend emergency session API with authenticated session creation, active-session lookup, session history, owned-session retrieval, and session ending.

### Lessons Learned

- Separate collections are useful for event-like records that can grow independently from the User document.
- Ownership checks should be enforced in service-layer database queries.
- Snapshotting embedded contacts preserves historical context for emergency sessions.
- REST endpoints can model the source of truth before realtime Socket.io behavior is introduced.

### Files Added

- `backend/src/models/EmergencySession.js`
- `backend/src/controllers/emergencyController.js`
- `backend/src/routes/emergencyRoutes.js`
- `backend/src/services/emergencyService.js`
- `backend/src/validators/emergencyValidator.js`
- `backend/src/tests/emergency.test.js`

### Next Milestone

Milestone 5 will add location history for emergency sessions.

## Milestone 5

### Summary

Adds backend location history for emergency sessions with protected endpoints to create and list location points for owned emergency sessions.

### Lessons Learned

- Related collections are useful when data can grow quickly, such as GPS history.
- Nested REST routes work well for resources that belong to a parent resource.
- Service-layer ownership checks prevent users from accessing another user's emergency location data.
- Updating `lastKnownLocation` keeps emergency session summaries fast while preserving full history separately.

### Files Added

- `backend/src/models/LocationPoint.js`
- `backend/src/controllers/locationController.js`
- `backend/src/services/locationService.js`
- `backend/src/validators/locationValidator.js`
- `backend/src/tests/location.test.js`

### Next Milestone

Milestone 6 will add Socket.io realtime location broadcasting.

## Milestone 6

### Summary

Adds backend Socket.io support for authenticated realtime emergency rooms and broadcasts new REST-created location points to subscribed clients.

### Lessons Learned

- Socket.io runs on the HTTP server that wraps the Express app.
- JWT authentication can protect websocket connections similarly to REST routes.
- Rooms let the backend target realtime updates to a specific emergency session.
- Keeping REST as the write path avoids duplicating validation and persistence logic in socket handlers.

### Files Added

- `backend/src/sockets/index.js`
- `backend/src/sockets/socketAuth.js`
- `backend/src/sockets/emergencySocket.js`
- `backend/src/tests/socket.test.js`

### Next Milestone

Milestone 7 will add evidence upload backend support.

## Milestone 7

### Summary

Adds backend evidence upload support for active emergency sessions using Multer memory uploads, Cloudinary storage, and MongoDB evidence metadata records.

### Lessons Learned

- Multer can parse multipart form-data and keep files in memory for direct cloud uploads.
- Cloudinary stores binary assets while MongoDB stores metadata and ownership links.
- Upload endpoints need both file validation and service-layer ownership checks.
- Tests can mock cloud storage so upload behavior is covered without real credentials.

### Files Added

- `backend/src/config/cloudinary.js`
- `backend/src/models/Evidence.js`
- `backend/src/controllers/evidenceController.js`
- `backend/src/services/evidenceService.js`
- `backend/src/middleware/uploadMiddleware.js`
- `backend/src/utils/cloudinaryUpload.js`
- `backend/src/validators/evidenceValidator.js`
- `backend/src/tests/evidence.test.js`

### Next Milestone

Milestone 8 will begin the React dashboard MVP.

## Milestone 8

### Summary

Adds the first usable React dashboard MVP with authenticated login, protected routes, emergency session summaries, emergency detail views, location history, evidence display, and realtime location updates.

### Lessons Learned

- React Router protects UI routes while the backend remains the source of truth.
- A small API service layer keeps Axios details out of components.
- Context is a practical fit for dashboard auth state in a MERN portfolio project.
- Socket.io client subscriptions can enhance REST-loaded data without replacing REST persistence.

### Files Added

- dashboard services for API, auth, users, emergencies, and sockets
- dashboard auth context and hooks
- dashboard layout, pages, reusable components, and tests

### Next Milestone

Milestone 9 will build the React Native mobile MVP for login, SOS flow, and manual location capture.

## Milestone 9

### Summary

Adds the first usable React Native mobile MVP with login, persisted auth, SOS start/end controls, active emergency status, and manual current-location updates.

### Lessons Learned

- React Navigation gives the mobile app a clean authenticated flow.
- AsyncStorage is a simple learning-friendly persistence layer for mobile JWTs.
- Android location permissions must be requested at runtime before reading GPS data.
- Mobile can use the same REST API source of truth as the dashboard and backend tests.

### Files Added

- mobile auth context, API services, and location helper
- mobile navigation, login screen, SOS screen, reusable UI components, and Jest tests

### Next Milestone

The next milestone can add mobile evidence capture and upload using the existing backend evidence API.

## Milestone 10

### Summary

Adds deployment support now that the backend is live on Render, including a repeatable deployed API smoke test, deployment documentation, Cloudinary metadata hardening for shared-account project isolation, and dashboard UI for the full MVP workflow.

### Lessons Learned

- Deployment verification should test real database writes, not only health checks.
- Render backend settings are simpler when the monorepo root directory is set to `backend`.
- Vercel dashboard builds only need public `VITE_*` values, while backend secrets stay on Render.
- Shared Cloudinary accounts can be kept organized with folder namespacing, tags, and context metadata.
- A deployed MVP demo needs write-path UI, not only read-only dashboard screens.

### Files Added

- `scripts/deploymentSmokeTest.js`
- `docs/deployment.md`
- `backend/src/tests/cloudinaryUpload.test.js`
- dashboard registration, contact, emergency control, and evidence upload UI

### Next Milestone

The next milestone can polish mobile deployed-backend configuration and add mobile evidence capture.

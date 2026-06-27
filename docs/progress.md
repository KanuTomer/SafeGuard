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

# Contributing

SafeGuard is currently maintained by one developer, but the project follows a workflow that future contributors can join.

## Branch Naming

Use short, descriptive branch names:

```text
feat/backend-foundation
feat/auth
feat/user-contacts
fix/auth-validation
docs/api-guide
chore/tooling-update
```

## Commit Messages

Use Conventional Commits:

```text
feat(auth): implement JWT login
fix(users): validate duplicate contact emails
docs(api): document health endpoint
test(auth): add login endpoint coverage
chore: update project tooling
```

## Folder Organization

```text
backend/
  src/config       environment and infrastructure setup
  src/controllers  request handlers
  src/middleware   Express middleware
  src/models       Mongoose models
  src/routes       Express route definitions
  src/services     business logic
  src/utils        reusable helpers
  src/validators   request validation
  src/tests        Jest and Supertest tests

dashboard/
  src/components   reusable UI components
  src/pages        route-level pages
  src/layouts      shared page layouts
  src/services     API and realtime clients
  src/hooks        reusable React hooks
  src/context      React context providers

mobile/
  src/components   reusable React Native components
  src/screens      screen components
  src/navigation   navigation setup
  src/services     API, storage, and realtime clients
  src/hooks        reusable React Native hooks
  src/context      React context providers
  src/utils        helper functions
```

## Coding Style

- Use JavaScript and CommonJS in the backend.
- Keep routes thin and move request handling into controllers.
- Put business logic in services when features become more complex.
- Use async/await for asynchronous code.
- Prefer readable names over clever abbreviations.
- Keep response formats consistent.
- Run linting and tests before committing.

## Project Workflow

1. Start from the latest main branch.
2. Create a milestone or issue branch.
3. Implement only the current milestone scope.
4. Update docs when architecture, setup, or API behavior changes.
5. Run validation commands.
6. Commit with a Conventional Commit message.
7. Open a pull request with a concise summary and test notes.

## Pull Request Checklist

- [ ] Scope matches the current milestone or issue.
- [ ] Code is readable and organized in the expected folders.
- [ ] No secrets are committed.
- [ ] `.env.example` is updated when new environment variables are introduced.
- [ ] API responses use the standard response format.
- [ ] Tests are added or updated for important behavior.
- [ ] `npm run lint` passes.
- [ ] `npm test` passes.
- [ ] Documentation is updated when needed.

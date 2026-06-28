# Roadmap

## Milestone 0: Project Foundation

- Create monorepo structure
- Initialize backend, dashboard, and mobile projects
- Add documentation placeholders
- Add linting and formatting configuration

## Milestone 1: Backend Foundation

- Express application setup
- MongoDB connection
- error handling
- health check route

## Milestone 2: Authentication

- User model
- registration
- login
- JWT auth middleware
- auth tests

## Milestone 3: User Profile and Emergency Contacts

- protected profile endpoint
- profile updates
- embedded emergency contact CRUD
- profile and contact tests

## Milestone 4: Emergency Sessions

- emergency session model
- create active session
- active session lookup
- session history
- end session
- emergency session tests

## Milestone 5: Location History

- location point model
- add location points to active emergency sessions
- update last known location
- list location history
- location history tests

## Milestone 6: Realtime Location Updates

- Socket.io server initialization
- JWT socket authentication
- emergency room join/leave events
- REST-created location broadcasts
- realtime integration tests

## Milestone 7: Evidence Upload Backend

- evidence model
- Cloudinary upload helper
- image and audio upload endpoint
- evidence listing endpoint
- evidence upload tests

## Milestone 8: Dashboard MVP

- authenticated React dashboard
- protected dashboard routes
- emergency session summary and detail views
- location history and evidence display
- realtime location updates in emergency detail view
- dashboard tests

## Milestone 9: Mobile MVP

- authenticated React Native app
- persisted mobile auth state
- SOS start and end controls
- active emergency status view
- manual current-location updates
- Android location permissions
- mobile tests

## Later Milestones

- mobile evidence capture
- portfolio polish and deployment

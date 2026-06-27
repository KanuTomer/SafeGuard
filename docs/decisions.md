# Architecture Decisions

This file records important decisions made during development.

## ADR 001: Use JavaScript Throughout

SafeGuard uses JavaScript across backend, dashboard, and mobile code to focus on MERN interview preparation and practical full-stack learning.

## ADR 002: Use a Monorepo

The project keeps `backend`, `dashboard`, `mobile`, and `docs` in one repository so the complete application is easy to navigate as a portfolio project.

## ADR 003: Embed Emergency Contacts in User Documents for MVP

Emergency contacts will be embedded inside the user document in the MVP. This teaches MongoDB embedded documents and keeps contact CRUD simple.

## ADR 004: REST Is the Source of Truth

REST endpoints will persist and retrieve application data. Socket.io will only provide realtime updates.

## ADR 005: Use JWT for API Authentication

SafeGuard uses JWT authentication because the project has both mobile and web clients. JWTs fit an API-first MERN application and are straightforward for React Native and React clients to send as bearer tokens.

Session-based authentication remains a strong option for browser-only applications, but JWTs better match this project's learning goals.

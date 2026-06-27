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

## Development Commands

```bash
npm run backend:dev
npm run dashboard:dev
npm run mobile:start
```

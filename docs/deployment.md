# Deployment Guide

## Backend on Render

SafeGuard backend is deployed as a Render Web Service.

Current backend URL:

```text
https://safeguard-bi4x.onrender.com
```

Render settings:

```text
Root Directory: backend
Build Command: npm install
Start Command: npm start
```

Required Render environment variables:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://safeguard_app_user:<password>@cluster0.gisajis.mongodb.net/safeguard?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=<cloudinary cloud name>
CLOUDINARY_API_KEY=<cloudinary api key>
CLOUDINARY_API_SECRET=<cloudinary api secret>
CLOUDINARY_UPLOAD_FOLDER=safeguard/evidence
```

Do not set `PORT` manually. Render provides it automatically.

After the dashboard is deployed to Vercel, replace `CLIENT_URL` with the Vercel dashboard URL and redeploy the backend.

## MongoDB Atlas

SafeGuard uses the existing free `Cluster0`.

Atlas requirements:

- database name in the connection string: `safeguard`
- database user: `safeguard_app_user`
- role: read/write access for the app database
- Network Access IP list includes `0.0.0.0/0` for Render access

MongoDB creates the `safeguard` database and collections when the first write occurs.

## Cloudinary

SafeGuard uses the same Cloudinary account as OpenNote, but assets are isolated by folder and metadata.

Required folder:

```text
safeguard/evidence
```

The backend always sends evidence uploads with:

- folder: `safeguard/evidence`
- tags: `safeguard`, `evidence`
- context metadata: `app=safeguard`, `project=safeguard`, `uploadType=evidence`

Do not expose Cloudinary API secrets to the dashboard or mobile app.

## Dashboard on Vercel

Deploy the dashboard as a Vercel project from the same GitHub repository.

Vercel settings:

```text
Root Directory: dashboard
Build Command: npm run build
Output Directory: dist
```

Vercel environment variables:

```text
VITE_API_BASE_URL=https://safeguard-bi4x.onrender.com
VITE_SOCKET_URL=https://safeguard-bi4x.onrender.com
```

After Vercel deployment, update Render `CLIENT_URL` to the Vercel URL.

## Deployment Smoke Test

Run this command after deploying the backend:

```bash
npm run smoke:deployment
```

To target another backend URL:

```bash
npm run smoke:deployment -- https://your-backend-url.onrender.com
```

Or:

```bash
SAFEGUARD_API_URL=https://your-backend-url.onrender.com npm run smoke:deployment
```

The smoke test verifies:

- health endpoint
- registration
- protected current-user lookup
- emergency session creation
- location point creation
- emergency session ending

It creates a disposable test user, emergency session, and location point in MongoDB Atlas.

To also test Cloudinary evidence upload:

```bash
npm run smoke:deployment -- --include-evidence
```

This uploads a tiny test PNG to Cloudinary under `safeguard/evidence`.

# Deployment Guide — Vercel + Render

Repository: https://github.com/saikumar-nadipilli/order-management-frontend-backend

Deploy **backend first**, then **frontend** (frontend needs the backend URL).

---

## Part 1: Render (Backend + PostgreSQL)

### Step 1 — Create PostgreSQL database

1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click **New +** → **PostgreSQL**
3. Name: `inventory-postgres` (or any name)
4. Plan: **Free**
5. Click **Create Database**
6. Wait until status is **Available**
7. Copy **Internal Database URL** (use this for the web service on Render)

### Step 2 — Create Web Service (API)

1. **New +** → **Web Service**
2. Connect GitHub → select **order-management-frontend-backend**
3. Settings:

| Setting | Value |
|---------|--------|
| **Name** | `inventory-backend` (or your choice) |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | **Docker** |
| **Instance type** | Free |

4. **Environment Variables** (Environment tab):

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Paste **Internal Database URL** from Step 1 |
| `CORS_ORIGINS` | `http://localhost:3000` (temporary — update after Vercel) |

5. Click **Create Web Service**
6. Wait for deploy (5–10 min on first build)
7. Copy your live API URL, e.g. `https://inventory-backend-xxxx.onrender.com`

### Step 3 — Verify backend

Open in browser:

- `https://YOUR-BACKEND.onrender.com/health` → `{"status":"healthy"}`
- `https://YOUR-BACKEND.onrender.com/docs` → Swagger UI

> **Note:** Free Render services sleep after ~15 min idle. First request may take 30–60 seconds.

### Optional — Blueprint (one-click)

1. **New +** → **Blueprint**
2. Connect repo → Render reads `render.yaml`
3. Set `CORS_ORIGINS` when prompted
4. Apply

---

## Part 2: Vercel (Frontend)

### Step 1 — Import project

1. Log in to [Vercel](https://vercel.com/)
2. **Add New…** → **Project**
3. Import **order-management-frontend-backend** from GitHub
4. Configure:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` (click Edit → set to `frontend`) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### Step 2 — Environment variable

Add before deploy:

| Name | Value |
|------|--------|
| `VITE_API_URL` | `https://YOUR-BACKEND.onrender.com` (no trailing slash) |

### Step 3 — Deploy

1. Click **Deploy**
2. Copy your Vercel URL, e.g. `https://order-management-frontend-backend.vercel.app`

### Step 4 — Connect frontend ↔ backend

1. Go back to **Render** → your web service → **Environment**
2. Update `CORS_ORIGINS`:

```
https://YOUR-VERCEL-URL.vercel.app,http://localhost:3000
```

3. **Save Changes** (Render will redeploy)

4. In **Vercel** → **Settings** → **Environment Variables** — confirm `VITE_API_URL` is correct
5. **Deployments** → **Redeploy** latest (if you changed env vars)

---

## Part 3: Test production

1. Open Vercel URL
2. Add a **Product** and **Customer**
3. Create an **Order**
4. Check **Dashboard** counts

If API calls fail, open browser **DevTools → Network** and check CORS or 502 (backend waking up).

---

## Part 4: Docker Hub (assignment deliverable)

```bash
cd backend
docker build -t saikumar-nadipilli/inventory-backend:latest .
docker login
docker push saikumar-nadipilli/inventory-backend:latest
```

Docker Hub link: `https://hub.docker.com/r/saikumar-nadipilli/inventory-backend`

---

## Submission checklist

| Item | Your URL |
|------|----------|
| GitHub | https://github.com/saikumar-nadipilli/order-management-frontend-backend |
| Backend API | `https://_____.onrender.com` |
| Frontend | `https://_____.vercel.app` |
| Docker Hub | `https://hub.docker.com/r/_____/inventory-backend` |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| CORS error in browser | Add exact Vercel URL to `CORS_ORIGINS` on Render |
| 502 / timeout | Free Render waking up — wait and retry |
| Empty data after deploy | New PostgreSQL DB is empty — add products/customers again |
| `postgres://` error | Fixed in code — pull latest `main` |
| Vercel build fails | Root Directory must be `frontend` |

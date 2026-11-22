# DEPLOYMENT GUIDE: AI RESUME BUILDER

## 1. Overview
The frontend and backend are completely decoupled and deployable independently.

- **Frontend**: Static single-page application deployable to Vercel, Cloudflare Pages, Netlify, or AWS S3 + CloudFront.
- **Backend**: Containerized or native Python 3.11+ ASGI service deployable to Render, Fly.io, Railway, or AWS ECS/AppRunner.

---

## 2. Frontend Deployment

### Vercel
1. Connect repository or upload `frontend/`.
2. Framework Preset: **Vite**
3. Root Directory: `frontend`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://ai-resume-api.onrender.com`)

### Cloudflare Pages
1. Build command: `npm run build`
2. Build output directory: `dist`
3. Single Page Application redirect configured in `public/_redirects`.

---

## 3. Backend Deployment

### Render (`render.yaml`)
A complete `render.yaml` blueprint is included in the project root:
- **Environment**: Python 3.11
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/api/v1/health`

### Environment Variables
```env
APP_ENV=production
API_V1_PREFIX=/api/v1
ALLOWED_ORIGINS=https://your-frontend-domain.com
MAX_UPLOAD_SIZE_MB=10

# AI Provider: local (default, zero credentials needed), gemini, groq, or openrouter
AI_PROVIDER=local

# Optional External API Keys (only needed if AI_PROVIDER is not local)
GEMINI_API_KEY=
GROQ_API_KEY=
OPENROUTER_API_KEY=
```

---

## 4. Cold Start & Resource Assumptions
- Free tier hosting providers (such as Render Free) spin down on inactivity. The first request may experience a 30-50 second cold start delay.
- Memory consumption for PyMuPDF text parsing is minimal (~40MB RAM per request).

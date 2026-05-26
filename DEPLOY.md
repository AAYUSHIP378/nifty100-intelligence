# Public Live URL — Render (Free)

Yeh steps follow karo — **15–20 minute** mein public URL milega.

Example URL: `https://nifty100-api.onrender.com`

---

## Step 1 — GitHub par code upload

1. https://github.com par naya repo banao: `nifty100-intelligence`
2. VS Code terminal:

```powershell
cd c:\Users\HP\Downloads\n100-20260503T111632Z-3-001
git init
git add .
git commit -m "Nifty 100 financial intelligence system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nifty100-intelligence.git
git push -u origin main
```

`YOUR_USERNAME` apna GitHub username likho.

---

## Step 2 — Render account

1. https://render.com par sign up (GitHub se login best)
2. Dashboard → **New** → **Blueprint**
3. Apna GitHub repo connect karo
4. `render.yaml` auto-detect hoga → **Apply**

Render banayega:
- **Web service** `nifty100-api` (Django + Gunicorn)
- **PostgreSQL** `nifty100-db` (auth / sessions ke liye)

---

## Step 3 — Deploy complete hone ka wait

- Build ~5–10 min (pehli baar)
- Status **Live** hone par URL milega: **Open Web Service** → copy URL

---

## Step 4 — Test URLs

| Page | URL |
|------|-----|
| Home (Chart.js site) | `https://YOUR-APP.onrender.com/` |
| API Swagger | `https://YOUR-APP.onrender.com/api/docs/` |
| Companies API | `https://YOUR-APP.onrender.com/api/companies/` |
| Dashboard API | `https://YOUR-APP.onrender.com/api/dashboard/` |

---

## Important settings (already in `render.yaml`)

| Variable | Value |
|----------|--------|
| `WAREHOUSE_MODE` | `csv` — financial data repo ki CSV se (ETL server par zaroori nahi) |
| `DJANGO_DEBUG` | `false` |
| `DATABASE_URL` | Render PostgreSQL (auto) |

---

## Free tier notes

- **Cold start:** 50 sec inactivity ke baad pehli request slow ho sakti hai
- **Sleep:** Free web service idle par sleep — demo se pehle URL ek baar open kar lena
- **Power BI:** alag se [Power BI Service](https://app.powerbi.com) par publish karo

---

## React frontend (optional second URL)

1. https://vercel.com → GitHub import → folder `frontend`
2. Environment variable: `VITE_API_URL=https://YOUR-APP.onrender.com`
3. Deploy → `https://your-app.vercel.app`

(Iske liye `frontend` mein API base URL env se read karna hoga.)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fail | Render logs dekho; `pip install` timeout → build dubara chalao |
| 502 Bad Gateway | `gunicorn` start command check; logs mein migration error |
| CSRF error | `RENDER_EXTERNAL_HOSTNAME` auto-set hota hai Render par |
| Empty API data | `data/warehouse/*.csv` GitHub par commit honi chahiye |

---

## Alternative hosts

| Host | Best for |
|------|----------|
| **Render** | Django + Postgres (recommended) |
| **Railway** | Same stack, paid credit |
| **PythonAnywhere** | Sirf Django, simple |
| **Vercel** | Sirf React frontend |

Project overview ke hisaab se **Django app = Render**, **BI dashboards = Power BI Service**.

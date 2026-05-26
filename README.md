# Nifty 100 Financial Intelligence System

Production-style analytics project for India's Nifty 100 companies.

## What's included

| Stream | Deliverable | Status |
|--------|-------------|--------|
| A — Power BI | 7 dashboards (`powerbi/`) + DAX + data pack | Data pack + build guide |
| B — Data Engineering | ETL (`etl/`), star-schema CSV + PostgreSQL loader | Complete |
| C — Django + API + Web | REST API, Swagger, Chart.js public site, React UI | Complete |

## Quick start (no Docker required)

```powershell
cd c:\Users\HP\Downloads\n100-20260503T111632Z-3-001
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Refresh warehouse CSVs from existing raw data
python run_pipeline.py --skip-extract

# Django (SQLite for auth; warehouse from CSV)
python manage.py migrate
python manage.py runserver
```

Open:

- Public website: http://127.0.0.1:8000/
- API docs: http://127.0.0.1:8000/api/docs/
- React UI: `cd frontend && npm install && npm run dev`

## Full pipeline

```powershell
python etl/01_extract_from_mysql.py
python etl/02_clean_and_transform.py
python etl/03_load_to_warehouse.py          # needs PostgreSQL
python ml/generate_ml_scores.py --postgres
python powerbi/export_for_powerbi.py
```

Or: `python run_pipeline.py --load-postgres`

## PostgreSQL + Docker

```powershell
docker compose up -d
python etl/03_load_to_warehouse.py
```

Database: `bluestock_dw` on `localhost:5432` (user/password: `postgres` / `postgres`).

Set `WAREHOUSE_MODE=csv` in `.env` to force CSV reads even when PostgreSQL is running.

## API endpoints

- `GET /api/dashboard/` — executive summary
- `GET /api/companies/`
- `GET /api/companies/<symbol>/`
- `GET /api/companies/<symbol>/financials/`
- `GET /api/companies/<symbol>/pros-cons/`
- `GET /api/sectors/`
- `GET /api/ml-scores/`
- `GET /api/risk/`
- `GET /api/top-10/`

## Power BI

1. `python powerbi/export_for_powerbi.py`
2. Follow `powerbi/BUILD_DASHBOARDS.md`
3. Use measures from `powerbi/DAX_MEASURES.dax`

## Project structure

```text
etl/                 Extract, transform, load
ml/                  Health score generation
data/raw|clean|warehouse/
powerbi/             Dashboard data pack + DAX
api/                 REST API + warehouse access layer
web/                 Chart.js public website
frontend/            React analyst UI
notebooks/           Jupyter EDA
```

## Public live URL (free)

Deploy to **Render** in ~15 minutes. Full steps: **[DEPLOY.md](DEPLOY.md)**

1. Push code to GitHub  
2. Render → **New Blueprint** → connect repo (`render.yaml` included)  
3. Live URL: `https://nifty100-api.onrender.com` (your name may differ)

## Technology stack

Python 3.11, pandas, SQLAlchemy, PostgreSQL 15, scikit-learn, Django 4.2, DRF, Celery, Redis, Chart.js, React, Power BI.

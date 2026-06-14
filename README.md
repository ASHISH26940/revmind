# NovaBite BI — Conversational Analytics Dashboard

A BI dashboard for NovaBite Consumer Goods with an LLM-powered conversational interface. Built with FastAPI + React, seeded from 1,000 rows of transactional sales data.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | SQLite (file: `backend/novabite.db`) |
| LLM | Groq API (`llama-3.1-8b-instant`) |
| Frontend | React 19, TypeScript, Vite 8 |
| Styling | Tailwind CSS v4, Inter font, Material Symbols |
| Charts | Custom SVG (no chart library) |
| Package mgmt | `uv` (backend), `bun` (frontend) |

## Prerequisites

- Python ≥ 3.11, [uv](https://docs.astral.sh/uv/)
- [bun](https://bun.sh/) (or npm/pnpm)
- [Docker](https://docs.docker.com/engine/install/) (optional — for containerized run)
- A Groq API key — [free tier at console.groq.com](https://console.groq.com)

## Setup

### Quick start (Docker)

```bash
cp backend/.env.example backend/.env.local
# Edit backend/.env.local and set GROQ_API_KEY=gsk_your_key

docker compose up --build
```
- Frontend at **http://localhost** (port 80)

- Backend API at **http://localhost:8000**

- API docs at **http://localhost:8000/docs**
### Manual (dev mode)

#### 1. Backend

```bash
cd backend
cp .env.example .env.local
# Edit .env.local and set GROQ_API_KEY=gsk_your_key

uv sync
uv run python backend/seed.py
uv run dev
```

Starts on `http://0.0.0.0:8000` with hot reload.

#### 2. Frontend

```bash
cd frontend
bun install
bun run dev
```

Starts on `http://localhost:5173`, proxies `/api` to the backend.

## Environment Variables

Only the backend needs them. See `backend/.env.example`:

| Variable | Default | Notes |
|----------|---------|-------|
| `GROQ_API_KEY` | — | Required |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Any Groq-hosted model |
| `LLM_PROVIDER` | `groq` | `groq` or `google` |
| `GOOGLE_API_KEY` | — | Fallback if Groq unavailable |
| `GOOGLE_MODEL` | `gemma-4-26b-it` | — |

## Data

1,000 rows of NovaBite sales transactions (`data/data.csv`) with 18 columns:

`transaction_id`, `date`, `month`, `quarter`, `sku`, `product_name`, `category`, `subcategory`, `region`, `channel`, `sales_rep`, `units_sold`, `unit_price_usd`, `gross_revenue_usd`, `discount_pct`, `net_revenue_usd`, `cogs_usd`, `gross_profit_usd`

Covering 2024–2025 across 4 regions, 4 categories, 3 channels, and 12 products.

Run `uv run python backend/seed.py` to populate the database (idempotent — skips if already seeded).

## API Endpoints

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/products` | All products with total units & revenue |
| `GET` | `/api/summary` | KPI card data + YoY trends |
| `GET` | `/api/trends` | Monthly revenue time series |
| `POST` | `/api/chat` | Streaming SSE response from the LLM |

### Chat

Send `{ "question": "your question" }` to `/api/chat`. The backend builds a rich context string from the database (all regions, categories, channels, top products, etc.) and injects it into the LLM prompt. The response streams as `text/event-stream`.

The LLM is instructed to answer **only from the provided context** with specific numbers and dollar amounts. Temperature is set to 0.1 for factual consistency. If the primary model fails, it falls back through `llama3-8b-8192` → `gemma2-9b-it`.

Test questions that should work:
1. *"Which region had the highest net revenue in Q1 2024?"*
2. *"What is the gross profit margin for the Snacks category?"*
3. *"Which sales rep closed the most units in 2025?"*
4. *"Compare E-Commerce vs Modern Trade net revenue."*
5. *"What was the best performing product in the West region?"*

## Architecture

```
Browser (React SPA)  ──nginx /api──▶  FastAPI  ──▶  SQLite
                         :80              :8000
                             │
                             ▼
                          Groq API
                     (LLM inference)
```

- The dashboard fetches summary + trends on mount for KPI cards and charts.
- Chat questions go through the backend, which pre-computes data slices (cached in memory) and sends them as prompt context — no dynamic SQL generation, no SQL injection risk.
- The typewriter effect on the frontend runs at 30ms per tick (1 char/tick) for a natural ChatGPT-like streaming feel.

## Frontend Components

| Component | Purpose |
|-----------|---------|
| `Dashboard` | Fetches `/api/summary` + `/api/trends`, renders KPIs + charts |
| `Chat` | Streaming chat with typewriter, suggestion buttons |
| `Sidebar` | Collapsible nav (overlay on mobile, persistent on desktop) |
| `Header` | Tab switcher, sidebar toggle, centered nav |
| `KpiCard` | Metric display with trend indicator |
| `TrendChart` | SVG line chart — monthly revenue |
| `CategoryChart` | SVG bar chart — category breakdown |

## Scripts

### Backend (`uv run <script>`)

| Script | Command |
|--------|---------|
| Dev server | `dev` (alias for `uvicorn app.main:app --reload`) |
| Seed DB | `uv run python backend/seed.py` |

### Frontend (`bun run <script>`)

| Script | Command |
|--------|---------|
| Dev | `dev` |
| Build | `build` (`tsc -b && vite build`) |
| Preview | `preview` |
| Lint | `lint` |

## Design Decisions

- **FastAPI over Express**: Native async, auto OpenAPI docs, pandas/httpx ecosystem.
- **Groq over Google/OpenAI**: 30 RPM free tier vs 3 RPM Google, no credit card needed, sub-100ms token latency.
- **`llama-3.1-8b-instant`**: Fast enough for formatting pre-computed answers; Gemma models not available on Groq.
- **Pre-computed context over dynamic SQL**: Inject all aggregates into the prompt — simpler, no SQL injection risk, covers all test questions.
- **Custom SVG over Recharts**: Removed recharts dependency; ~6KB vs ~200KB, exact design control.
- **Separate `.env` per directory**: Backend needs API keys, frontend doesn't. `backend/.env.local` is gitignored.
- **No JOINs, no indexes**: 1,000 rows doesn't need them. Multiple SELECTs preferred for simplicity.
- **Docker**: Single `docker compose up` builds both services. Frontend served via nginx, backend via uvicorn. Nginx proxies `/api` to the backend container.

## What I'd Improve With More Time

- **Persistent SQLite volume in Docker**: Currently the database is seeded at build time and lost on container recreate. A Docker volume would persist it across restarts.
- **Better error handling on frontend**: Network failures, rate limits, and malformed responses could show friendlier messages instead of "Error: failed to get response."
- **Pagination on products**: Only 12 products so it's fine, but the endpoint should support `?limit` and `?offset` for larger datasets.
- **Mobile chat UX**: The chat input and message bubbles work on mobile but could be optimized — proper keyboard handling, scroll anchoring, swipe gestures.
- **Request cancellation**: The abort controller was removed during the typewriter refactor. Long responses should be cancellable mid-stream.
- **CI/CD**: A GitHub Actions workflow that runs tests on push would catch regressions before review.
- **Prompt versioning**: The context template in `context.py` is hardcoded. A prompt registry with version tracking would make iteration safer.
- **Dynamic context selection**: Currently all 9 data slices are injected for every question. For very large datasets, a routing layer could select only relevant context.

## Tradeoffs & Shortcuts

- **Pre-computed context over dynamic SQL**: Injecting all aggregates into the prompt is simpler and avoids SQL injection risk, but won't scale to millions of rows. For 1,000 rows it's the right call.
- **No JOINs, no indexes**: Multiple simple SELECTs are easier to read and debug. With 1,000 rows, query time is sub-ms anyway.
- **SQLite over PostgreSQL**: No server to manage, file-based, good enough for the data size. Would hit concurrency limits under real load.
- **Custom SVGs over Recharts**: Saved ~200KB bundle size and gave exact design control, but took longer to implement and has no built-in interactivity (tooltips, zoom).
- **Flat config module over class-based**: 5 environment variables didn't warrant a config class. Less ceremony, more readable.
- **`backend/.env.local` instead of root `.env`**: Backend and frontend have different env needs. Keeping per-directory avoids confusion even though the spec shows root `.env.example`.
- **Single Docker compose profile**: No dev/prod separation. Fast feedback, but the production image includes dev tooling (bun install, full build chain).
- **No request timeout on LLM calls**: If Groq hangs, the streaming response hangs indefinitely. A timeout wrapper would be safer.
- **Magic numbers in chart SVGs**: The TrendChart viewBox (800×280) and gridline positions are hardcoded. Responsive sizing could be more robust.

## Project Structure

```
revmind/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app + CORS + router mounts
│   │   ├── config.py       # Env vars (flat module constants)
│   │   ├── database.py     # SQLite connection
│   │   ├── context.py      # Pre-computes data context for LLM
│   │   ├── llm.py          # Groq client + streaming + fallback
│   │   └── routes/
│   │       ├── chat.py     # POST /api/chat (streaming SSE)
│   │       ├── products.py # GET /api/products
│   │       ├── summary.py  # GET /api/summary
│   │       └── trends.py   # GET /api/trends
│   ├── tests/
│   │   ├── conftest.py     # FastAPI TestClient fixture
│   │   ├── test_seed.py    # 6 seed tests
│   │   └── test_routes.py  # 13 route tests
│   ├── seed.py             # Idempotent CSV→SQLite loader
│   ├── Dockerfile
│   ├── .env.example
│   ├── pyproject.toml
│   └── novabite.db         # SQLite DB (gitignored)
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Root: tab routing + sidebar
│   │   ├── types.ts         # TypeScript interfaces
│   │   ├── index.css        # Tailwind v4 + custom theme
│   │   └── components/
│   │       ├── Dashboard.tsx
│   │       ├── Chat.tsx
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── KpiCard.tsx
│   │       ├── TrendChart.tsx
│   │       └── CategoryChart.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── data/
│   └── novabite_sales_data.csv   # 1,000-row sales dataset
└── docker-compose.yml
```

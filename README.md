# NovaBite BI — Conversational Analytics Dashboard

A BI dashboard for NovaBite Consumer Goods with an LLM-powered conversational interface. Built with FastAPI + React + React Native (Expo), seeded from 1,000 rows of transactional sales data.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | SQLite (file: `backend/novabite.db`) |
| LLM | Groq API (`llama-3.1-8b-instant` / `llama-3.3-70b-versatile`) |
| Web Frontend | React 19, TypeScript, Vite 8 |
| Mobile | React Native (Expo SDK 54) |
| Styling (web) | Tailwind CSS v4, Inter font, Material Symbols |
| Styling (mobile) | `react-native-size-matters`, MaterialIcons |
| Charts | Custom SVG (no chart library) |
| Package mgmt | `uv` (backend), `bun` (frontend), `npm` (mobile) |

## Prerequisites

- Python ≥ 3.11, [uv](https://docs.astral.sh/uv/)
- [bun](https://bun.sh/) (or npm/pnpm)
- [Docker](https://docs.docker.com/engine/install/) (optional — for containerized run)
- A Groq API key — [free tier at console.groq.com](https://console.groq.com)
- Expo Go app (v54) on your phone for mobile testing

## Setup

### Docker (all-in-one)

```bash
cp backend/.env.example backend/.env.local
# Edit backend/.env.local and set GROQ_API_KEY

docker compose up --build
```
- **Web:** http://localhost
- **Backend API:** http://localhost:8000
- **API docs:** http://localhost:8000/docs

### Manual (dev mode)

#### 1. Backend

```bash
cd backend
cp .env.example .env.local
# Edit .env.local and set GROQ_API_KEY

uv sync
uv run python backend/seed.py   
uv run dev                       
```
Starts on `http://0.0.0.0:8000` with hot reload.

#### 2. Web Frontend

```bash
cd frontend
bun install
bun run dev
```
Starts on `http://localhost:5173`, proxies `/api` to the backend.

#### 3. Mobile (Expo)

```bash
cd mobile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your machine's LAN IP (e.g. http://192.168.0.168:8000)

npm install
npx expo start
```
Scan the QR code with Expo Go. The phone needs to be on the same network as your dev machine.

## Environment Variables

See `backend/.env.example`:

| Variable | Default | Notes |
|----------|---------|-------|
| `GROQ_API_KEY` | — | Required |
| `GROQ_MODEL` | `llama-3.1-8b-instant` | Any Groq-hosted model |
| `LLM_PROVIDER` | `groq` | `groq` or `google` |
| `GOOGLE_API_KEY` | — | Fallback |
| `GOOGLE_MODEL` | `gemma-4-26b-it` | — |
| `EXPO_PUBLIC_API_URL` | (mobile) | Phone-accessible backend URL |

## Data

1,000 rows of NovaBite sales transactions (`data/novabite_sales_data.csv`) with 18 columns:

`transaction_id`, `date`, `month`, `quarter`, `sku`, `product_name`, `category`, `subcategory`, `region`, `channel`, `sales_rep`, `units_sold`, `unit_price_usd`, `gross_revenue_usd`, `discount_pct`, `net_revenue_usd`, `cogs_usd`, `gross_profit_usd`

Covering 2024–2025 across 5 regions (North/South/East/West/Central), 4 categories, 4 channels, and 12 products.

Run `uv run python backend/seed.py` to populate the database (idempotent — skips if already seeded).

## API Endpoints

| Method | Path | Returns |
|--------|------|---------|
| `GET` | `/api/products` | All products with total units & revenue |
| `GET` | `/api/summary` | KPI card data + YoY trends |
| `GET` | `/api/trends` | Monthly revenue time series |
| `POST` | `/api/chat` | Streaming SSE response from the LLM |

### Chat

Send `{ "question": "your question" }` to `/api/chat`. The backend builds a compact text context from the database (~500 tokens) containing all KPIs, per-region and per-quarter revenue, category margins, top reps, and channel comparisons. This context is injected into the system prompt.

The response streams as SSE via the Groq SDK (`groq` Python package). Temperature is set to 0.1 for factual consistency. If the primary model fails, it falls back through `llama-3.3-70b-versatile` → `llama-3.1-8b-instant`. Fallback models that are decommissioned on Groq (`gemma2-9b-it`, `llama3-70b-8192`) have been removed from the chain.

Test questions that should work:
1. *"Which region had the highest net revenue in Q1 2024?"*
2. *"What is the gross profit margin for the Snacks category?"*
3. *"Which sales rep closed the most units in 2025?"*
4. *"Compare E-Commerce vs Modern Trade net revenue."*
5. *"What was the best performing product in the West region?"*

## Architecture

```
Web Browser (React SPA)  ──nginx /api──▶  FastAPI  ──▶  SQLite
                          :80              :8000
                                              │
                         ┌────────────────────┤
                         ▼                    ▼
                   Expo Go (mobile)       Groq API
                   (React Native)      (LLM inference)
```

- The dashboard fetches summary + trends on mount for KPI cards and charts.
- Chat questions go through the backend, which pre-computes data slices (cached in memory) and sends them as prompt context — no dynamic SQL generation, no SQL injection risk.
- The typewriter effect on the web frontend runs at 30ms per tick (1 char/tick) for a natural ChatGPT-like streaming feel.
- Mobile uses `expo/fetch` for proper `ReadableStream` support (React Native's global `fetch` lacks it).

## Frontend Components

### Web (`frontend/src/components/`)

| Component | Purpose |
|-----------|---------|
| `Dashboard` | Fetches `/api/summary` + `/api/trends`, renders KPIs + charts |
| `Chat` | Streaming chat with typewriter, suggestion buttons |
| `Sidebar` | Collapsible nav (overlay on mobile, persistent on desktop) |
| `Header` | Tab switcher, sidebar toggle, centered nav |
| `KpiCard` | Metric display with trend indicator |
| `TrendChart` | SVG line chart — monthly revenue |
| `CategoryChart` | SVG bar chart — category breakdown |

### Mobile (`mobile/src/`)

| Component | Purpose |
|-----------|---------|
| `app/(tabs)/dashboard.tsx` | Dashboard screen with KPI cards + charts |
| `app/(tabs)/chat.tsx` | Chat screen with streaming, avatars, pull-to-refresh |
| `components/KpiCard` | Metric card with trend + MaterialIcons icon |
| `components/TrendChart` | SVG line chart |
| `components/CategoryChart` | SVG bar chart (safe-area aware) |
| `api.ts` | API client using `expo/fetch` for stream support |

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
- **`llama-3.1-8b-instant`**: Fast, reliable, generous free-tier TPM limits (6K). `openai/gpt-oss-120b` and `gemma2-9b-it` were tried but decommissioned or too restrictive on free tier (8K TPM).
- **Pre-computed context over dynamic SQL**: Inject all aggregates into the prompt — simpler, no SQL injection risk, covers all test questions.
- **Compact context format**: The context is formatted as plain text (~500 tokens) to stay within Groq free-tier TPM limits. Verbose dict reprs were replaced with inline `key(value)` format.
- **Custom SVG over Recharts**: Removed recharts dependency; ~6KB vs ~200KB, exact design control.
- **Separate `.env` per directory**: Backend needs API keys, frontend doesn't. `backend/.env.local` is gitignored.
- **No JOINs, no indexes**: 1,000 rows doesn't need them. Multiple SELECTs preferred for simplicity.
- **Docker**: Single `docker compose up` builds both services. Frontend served via nginx, backend via uvicorn. Nginx proxies `/api` to the backend container.
- **`expo/fetch` for mobile streaming**: React Native's global `fetch` doesn't support `ReadableStream`. The Expo-provided `expo/fetch` module provides a WinterCG-compliant implementation that does.
- **Groq SDK over raw httpx**: The `groq` Python SDK handles SSE parsing, retries, and error types. The old httpx-based manual SSE parser was replaced for maintainability.

## What I'd Improve With More Time

- **Persistent SQLite volume in Docker**: Currently the database is seeded at build time and lost on container recreate. A Docker volume would persist it across restarts.
- **Better error handling on frontend**: Network failures, rate limits, and malformed responses could show friendlier messages instead of "Error: failed to get response."
- **Pagination on products**: Only 12 products so it's fine, but the endpoint should support `?limit` and `?offset` for larger datasets.
- **Mobile keyboard handling**: The chat input should avoid being hidden by the on-screen keyboard (KeyboardAvoidingView).
- **Request cancellation**: The abort controller was removed during the typewriter refactor. Long responses should be cancellable mid-stream.
- **CI/CD**: A GitHub Actions workflow that runs tests on push would catch regressions before review.
- **Prompt versioning**: The context template in `context.py` is hardcoded. A prompt registry with version tracking would make iteration safer.
- **Dynamic context selection**: Currently all data slices are injected for every question. For very large datasets, a routing layer could select only relevant context.
- **Mobile push notifications**: Alerts for key metric changes would make the mobile app more useful as a monitoring tool.

## Tradeoffs & Shortcuts

- **Pre-computed context over dynamic SQL**: Injecting all aggregates into the prompt is simpler and avoids SQL injection risk, but won't scale to millions of rows. For 1,000 rows it's the right call.
- **No JOINs, no indexes**: Multiple simple SELECTs are easier to read and debug. With 1,000 rows, query time is sub-ms anyway.
- **SQLite over PostgreSQL**: No server to manage, file-based, good enough for the data size. Would hit concurrency limits under real load.
- **Custom SVGs over Recharts**: Saved ~200KB bundle size and gave exact design control, but took longer to implement and has no built-in interactivity (tooltips, zoom).
- **Flat config module over class-based**: 5 environment variables didn't warrant a config class. Less ceremony, more readable.
- **`llama-3.1-8b-instant` over larger models**: Smaller model means lower latency and higher free-tier TPM (6K vs 8K for gpt-oss-120b), but the 8B model may miss nuance on complex questions.
- **Context trimmed to ~500 tokens**: Had to reduce verbose dict reprs to fit within Groq free-tier TPM limits. Some detail lost (e.g. exact margin values truncated to 2 decimal places only).
- **Groq SDK over raw httpx**: SDK is cleaner but adds a dependency. The old httpx SSE parser was brittle with edge cases (partial chunks, DONE marker spacing).
- **`expo/fetch` for mobile**: Only works in Expo environments (not bare React Native). If the app were ejected, we'd need a polyfill like `react-native-fetch-api`.
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

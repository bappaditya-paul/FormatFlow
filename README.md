# FormatFlow

> **Universal image transformation platform** — Upload any image, pick a target format, download the result.

---

## What is FormatFlow?

FormatFlow lets users upload an image and transform it into any predefined or custom dimension with format conversion and compression — powered by **libvips/pyvips** (no AI/ML).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12, Pydantic v2 |
| Image Processing | libvips / pyvips |
| Database | PostgreSQL 16 + SQLAlchemy (async) |
| Object Storage | Cloudflare R2 |
| CDN | Cloudflare |
| Container | Docker + Docker Compose |

---

## Monorepo Structure

```
formatflow/
├── apps/
│   ├── web/        ← Next.js frontend
│   └── api/        ← FastAPI backend
├── packages/
│   ├── shared-types/
│   └── config/
├── infrastructure/
├── docs/
├── docker-compose.yml
├── .env.example
└── package.json
```

---

## Quick Start

### Prerequisites
- Node.js 22+
- Python 3.12+
- Docker & Docker Compose
- libvips (`apt install libvips-dev` / `brew install vips`)

### 1. Clone & configure env

```bash
cp .env.example .env
# Fill in R2 credentials and SECRET_KEY
```

### 2. Run with Docker Compose

```bash
docker compose up
```

- Frontend → http://localhost:3000
- API → http://localhost:8000
- API Docs → http://localhost:8000/docs

### 3. Run locally (dev)

**Backend:**
```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

---

## Development Roadmap

| Module | Status | Description |
|---|---|---|
| 1 — Foundation | ✅ Done | Monorepo, FastAPI, Next.js, Docker |
| 2 — Upload | 🔲 Next | Image upload endpoint |
| 3 — Metadata | 🔲 | Image analysis |
| 4 — Engine | 🔲 | pyvips transformation pipeline |
| 5 — Presets | 🔲 | Format presets |
| 6 — R2 Storage | 🔲 | Cloudflare R2 integration |
| 7 — PostgreSQL | 🔲 | Metadata persistence |
| 8 — Frontend UI | 🔲 | Editor interface |
| 9 — Download/Share | 🔲 | Share links |
| 10 — Security | 🔲 | Rate limiting, validation |
| 11 — Auth | 🔲 | User accounts |
| 12 — Production | 🔲 | Deployment |

---

## Architecture Principle

> The **Transformation Engine is fully isolated from HTTP, auth, and the database**.
> It operates on `bytes + config → bytes`. This makes it reusable as a mobile SDK, CLI, or public API without rewriting image-processing logic.

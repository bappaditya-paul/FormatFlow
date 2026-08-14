# FormatFlow

> **Universal Image Transformation Platform & Delivery Infrastructure** — An optimized, modular monolith for instant image formatting, cropping, and lightning-fast CDN delivery.

---

## 📐 System Architecture

Below is the conceptual architecture of **FormatFlow**, showing how client layers interact with the core engine and persistence layers:

```mermaid
graph TD
    %% Clients
    subgraph Clients [Client Layer]
        A[Web App]
        B[Mobile App]
        C[Developer API]
    end

    %% API Gateway
    subgraph Gateway [API Gateway]
        D[API Gateway]
        D1[1. Authentication]
        D2[2. Rate Limiting]
        D3[3. Security & File Validation]
    end

    %% Core Services
    subgraph Core [FormatFlow Core Services]
        E[FormatFlow Coordinator]
        F[Upload Service]
        G[Transform Service]
        H[Share Service]
        
        subgraph Engine [Transformation Engine]
            G1[libvips / pyvips]
        end
    end

    %% Storage & DB
    subgraph Persistence [Data & Storage Layer]
        I[(PostgreSQL - Metadata)]
        J[Cloudflare R2 / S3 Object Storage]
        K[Cloudflare CDN]
    end

    %% Flows
    A --> D
    B --> D
    C --> D
    D --> E
    
    E --> F
    E --> G
    E --> H
    
    G --> G1
    
    F --> I
    F --> J
    G --> J
    H --> I
    
    J --> K
    K --> L[User Optimized Download]
    
    %% Styles
    style D fill:#1e1e24,stroke:#333,stroke-width:2px,color:#fff
    style E fill:#0d9488,stroke:#0f766e,stroke-width:2px,color:#fff
    style G1 fill:#4f46e5,stroke:#4338ca,stroke-width:2px,color:#fff
    style I fill:#f59e0b,stroke:#d97706,stroke-width:2px,color:#fff
    style J fill:#ea580c,stroke:#c2410c,stroke-width:2px,color:#fff
```

---

## 📁 Monorepo Directory Layout

The codebase is organized as a clean **modular monorepo** separating the API routing, business services, pure image transformation logic, and client interfaces:

```text
formatflow/
├── apps/
│   ├── web/                         # Next.js 15 Client Web Application
│   │   ├── app/
│   │   │   ├── page.tsx             # Interactive Editor (Upload, Presets, Live Preview)
│   │   │   ├── editor/              # Route stub for transformations
│   │   │   ├── result/              # Route stub for output preview
│   │   │   ├── share/               # Route stub for public sharing URLs
│   │   │   └── dashboard/           # Route stub for historical items
│   │   ├── components/              # Reusable React components
│   │   │   ├── uploader/            # Drag & drop or URL upload controls
│   │   │   ├── editor/              # Fitting, size, format & quality switches
│   │   │   ├── presets/             # Ratio configuration buttons
│   │   │   ├── preview/             # Canvas preview frames
│   │   │   └── originkit/           # Premium theme elements (Footer-02)
│   │   ├── lib/
│   │   │   ├── api.ts               # Fully-typed fetch client for backend endpoints
│   │   │   └── utils.ts             # Tailwind class merging utility
│   │   └── package.json
│   │
│   └── api/                         # FastAPI Backend Application
│       ├── app/
│       │   ├── main.py              # Application entrypoint & health routes
│       │   ├── api/v1/              # Routing Layer (HTTP upload, transform, share, presets)
│       │   ├── core/                # Configuration, JWT Security, Logging definitions
│       │   ├── models/              # SQLAlchemy Database ORM Models (Image, Transform, Share)
│       │   ├── schemas/             # Pydantic request/response validation schemas
│       │   ├── services/            # Business Orchestrators (Storage, Image handling)
│       │   ├── engine/              # Isolated Image Processing (Pure libvips pipeline)
│       │   ├── db/                  # Async db engine setup & migrations (Alembic)
│       │   └── utils/               # Shared helpers
│       ├── tests/                   # Pytest automation suite
│       └── requirements.txt         # Pinned backend dependencies
│
├── packages/                        # Shareable backend configuration & TS typings
├── docs/                            # In-depth architectural & API documentations
├── docker-compose.yml               # Complete Postgres, backend, frontend dev-stack
├── .env.example                     # Environment configuration keys
└── package.json                     # Monorepo workspaces coordinator
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: `v22` or higher
- **Python**: `v3.12` or higher
- **libvips system library**: Required for the `pyvips` binding.
  - **macOS**: `brew install vips`
  - **Linux (Ubuntu/Debian)**: `sudo apt-get install libvips-dev`

---

### Local Run Configuration

#### 1. Setup Environments
Copy `.env.example` in both directories to configure local variables:
```bash
cp .env.example .env
```

#### 2. Run Backend (FastAPI)
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```
* **API Address:** [http://localhost:8001](http://localhost:8001)
* **API Documentation:** [http://localhost:8001/docs](http://localhost:8001/docs)

#### 3. Run Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev -- --port 3000
```
* **Frontend Address:** [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Key Architectural Principles

1. **Decoupled Transformation Engine**
   The `apps/api/app/engine` is completely isolated from HTTP requests, user sessions, and database states. It performs pure image processing (`bytes + config -> bytes`), meaning it can be packaged as a CLI tool or SDK without modifications.
2. **Preset-driven Scaling**
   Supported platforms (Instagram stories, YouTube thumbnails) are modeled as preset definitions. Adding a preset does not change the core pipeline.
3. **Storage/DB Separation**
   PostgreSQL stores image metadata (width, height, format, storage path), while processed and raw image assets are held in Cloudflare R2 object storage, delivered via a global CDN.

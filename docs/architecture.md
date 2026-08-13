# FormatFlow — Architecture

## Overview

FormatFlow is a **modular monolith** for the first version. The key boundary is:

```
FastAPI  →  TransformService  →  TransformationEngine (pyvips)
```

The engine knows nothing about HTTP, PostgreSQL, or authentication.

## Component Map

```
apps/api/app/
├── api/v1/         ← HTTP layer only (routes)
├── services/       ← Business logic orchestration
├── engine/         ← Pure image processing (pyvips)
├── models/         ← SQLAlchemy ORM models
├── schemas/        ← Pydantic request/response schemas
├── core/           ← Config, logging, security
├── db/             ← Database connection
└── utils/          ← Shared utilities
```

## Data Flow

```
User Upload
     │
     ▼
POST /v1/images/upload
     │
     ▼
ImageService.upload()
     │
     ▼
Validate → Read dimensions → Store in R2 → Save metadata
     │
     ▼
Return image_id

POST /v1/images/transform
     │
     ▼
TransformService.transform()
     │
     ▼
Load from R2 → TransformationPipeline.process() → Upload result → Return URL
```

## Storage Architecture

- **Images** → Cloudflare R2 (never PostgreSQL)
- **Metadata** → PostgreSQL (dimensions, format, storage key, URLs)
- **Delivery** → Cloudflare CDN via R2 public URL

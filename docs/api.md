# FormatFlow API Reference

Base URL: `http://localhost:8000`

---

## Health

### `GET /health`

Returns service status.

**Response:**
```json
{
  "status": "ok",
  "service": "FormatFlow",
  "version": "0.1.0"
}
```

---

## v1 Endpoints (to be implemented)

### `POST /v1/images/upload`
Upload an image file or provide a URL.

### `POST /v1/images/transform`
Transform an uploaded image with a preset or custom dimensions.

### `GET /v1/images/{id}`
Get metadata for a specific image.

### `GET /v1/presets`
List all available format presets.

### `POST /v1/share`
Generate a shareable link for a transformed image.

### `GET /v1/share/{token}`
Resolve a share token to the processed image URL.

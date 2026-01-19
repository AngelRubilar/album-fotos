# Lumina Gallery API Documentation

## Overview

This directory contains the complete API architecture documentation for Lumina Gallery.

## Files

| File | Description |
|------|-------------|
| [LUMINA_GALLERY_API_ARCHITECTURE.md](./LUMINA_GALLERY_API_ARCHITECTURE.md) | Main API design document with principles, error handling, and endpoint specifications |
| [openapi.yaml](./openapi.yaml) | OpenAPI 3.1 specification for all endpoints |
| [FLOW_DIAGRAMS.md](./FLOW_DIAGRAMS.md) | Visual flow diagrams for complex operations |

## Source Code

Implementation files are located in:

```
src/
  lib/
    api/
      schemas/
        index.ts          # Zod validation schemas for all endpoints
      errors.ts           # Standardized error handling
      rate-limit.ts       # Rate limiting implementation
      exif.ts             # EXIF data extraction utilities
  app/
    api/
      v1/
        timeline/route.ts           # GET /api/v1/timeline
        favorites/route.ts          # GET /api/v1/favorites
        search/route.ts             # GET /api/v1/search
        smart-albums/
          route.ts                  # GET, POST /api/v1/smart-albums
          [id]/
            route.ts                # GET, PUT, PATCH, DELETE
            images/route.ts         # GET /api/v1/smart-albums/:id/images
        tags/route.ts               # GET, POST /api/v1/tags
        images/
          [id]/
            route.ts                # GET, PUT, DELETE /api/v1/images/:id
            favorite/route.ts       # PUT, DELETE /api/v1/images/:id/favorite
            tags/
              route.ts              # POST /api/v1/images/:id/tags
              [tagId]/route.ts      # DELETE /api/v1/images/:id/tags/:tagId
```

## Quick Reference

### Base URL

```
Development: http://localhost:3000/api/v1
```

### Common Headers

```http
Content-Type: application/json
X-Request-Id: req_abc123
X-API-Version: 1.0.0
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1705401600
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-16T12:00:00Z",
    "requestId": "req_abc123"
  },
  "pagination": {
    "cursor": "abc123",
    "hasMore": true,
    "limit": 20
  }
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-16T12:00:00Z",
    "requestId": "req_abc123"
  }
}
```

## Endpoints Summary

### Timeline
- `GET /api/v1/timeline` - Chronological image list with grouping

### Favorites
- `GET /api/v1/favorites` - List favorited images
- `PUT /api/v1/images/:id/favorite` - Add to favorites
- `DELETE /api/v1/images/:id/favorite` - Remove from favorites

### Search
- `GET /api/v1/search` - Advanced search with filters and facets

### Smart Albums
- `GET /api/v1/smart-albums` - List smart albums
- `POST /api/v1/smart-albums` - Create smart album
- `GET /api/v1/smart-albums/:id` - Get smart album
- `PUT /api/v1/smart-albums/:id` - Full update
- `PATCH /api/v1/smart-albums/:id` - Partial update
- `DELETE /api/v1/smart-albums/:id` - Delete smart album
- `GET /api/v1/smart-albums/:id/images` - Get matching images

### Tags
- `GET /api/v1/tags` - List all tags
- `POST /api/v1/tags` - Create tag
- `POST /api/v1/images/:id/tags` - Add tags to image
- `DELETE /api/v1/images/:id/tags/:tagId` - Remove tag from image

### Images
- `GET /api/v1/images/:id` - Get image with EXIF
- `PUT /api/v1/images/:id` - Update image metadata
- `DELETE /api/v1/images/:id` - Delete image

### Upload
- `POST /api/v1/upload` - Upload images (multipart/form-data)

### Albums
- `GET /api/v1/albums` - List albums
- `POST /api/v1/albums` - Create album

## Rate Limits

| Tier | Limit | Endpoints |
|------|-------|-----------|
| Anonymous | 30/min | Default |
| Search | 50/min | /search |
| Upload | 10/min | /upload |

## Caching

| Resource | Cache-Control |
|----------|---------------|
| Timeline | private, max-age=60 |
| Albums | public, s-maxage=300 |
| Image detail | public, s-maxage=3600 |
| Tags | public, s-maxage=600 |

## Schema Updates Required

To fully implement this API, the following Prisma schema updates are needed:

```prisma
model Image {
  // Add these fields:
  isFavorite    Boolean  @default(false)
  favoritedAt   DateTime?
  takenAt       DateTime?
  exifData      Json?
  tags          ImageTag[]
}

model Tag {
  id        String     @id @default(cuid())
  name      String     @unique
  category  String     @default("general")
  createdAt DateTime   @default(now())
  images    ImageTag[]
}

model ImageTag {
  id        String   @id @default(cuid())
  imageId   String
  tagId     String
  createdAt DateTime @default(now())
  image     Image    @relation(fields: [imageId], references: [id], onDelete: Cascade)
  tag       Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@unique([imageId, tagId])
}

model SmartAlbum {
  id          String   @id @default(cuid())
  title       String
  description String?
  rules       Json
  coverUrl    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Development

### Running with OpenAPI UI

Install Swagger UI:

```bash
npm install swagger-ui-express
```

### Testing with curl

```bash
# Get timeline
curl http://localhost:3000/api/v1/timeline

# Search
curl "http://localhost:3000/api/v1/search?q=beach&limit=10"

# Toggle favorite
curl -X PUT http://localhost:3000/api/v1/images/img_abc123/favorite

# Upload image
curl -X POST http://localhost:3000/api/v1/upload \
  -F "files=@photo.jpg" \
  -F "albumId=alb_xyz"
```

## Contributing

When adding new endpoints:

1. Add Zod schema to `src/lib/api/schemas/index.ts`
2. Implement route in `src/app/api/v1/`
3. Update OpenAPI spec in `docs/api/openapi.yaml`
4. Add examples to route file comments
5. Update flow diagrams if needed

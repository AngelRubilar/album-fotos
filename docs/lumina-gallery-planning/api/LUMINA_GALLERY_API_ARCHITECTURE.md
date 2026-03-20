# Lumina Gallery - API Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [API Design Principles](#api-design-principles)
3. [Base Configuration](#base-configuration)
4. [Error Handling](#error-handling)
5. [Pagination Strategy](#pagination-strategy)
6. [Rate Limiting](#rate-limiting)
7. [Caching Strategy](#caching-strategy)
8. [API Endpoints](#api-endpoints)
9. [OpenAPI Specification](#openapi-specification)

---

## Overview

Lumina Gallery API follows REST best practices with a focus on:
- **Consistency**: Uniform response structures across all endpoints
- **Discoverability**: HATEOAS links where applicable
- **Performance**: Cursor-based pagination for large datasets
- **Security**: Rate limiting, input validation, and proper authentication

### Tech Stack
- **Framework**: Next.js 15 App Router (API Routes)
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **Language**: TypeScript (strict mode)

---

## API Design Principles

### 1. URL Structure
```
/api/v1/{resource}/{id}/{sub-resource}
```

### 2. HTTP Methods
| Method | Description | Idempotent |
|--------|-------------|------------|
| GET | Retrieve resource(s) | Yes |
| POST | Create new resource | No |
| PUT | Full update (replace) | Yes |
| PATCH | Partial update | Yes |
| DELETE | Remove resource | Yes |

### 3. Response Format
All responses follow this structure:

```typescript
// Success Response
{
  "success": true,
  "data": T | T[],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  },
  "pagination"?: {
    "cursor": "string",
    "hasMore": boolean,
    "total"?: number
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details"?: object,
    "path"?: string
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## Base Configuration

### API Version Header
```typescript
// All responses include version header
headers: {
  'X-API-Version': '1.0.0',
  'X-Request-Id': 'req_abc123'
}
```

### Content Types
- Request: `application/json` (except file uploads: `multipart/form-data`)
- Response: `application/json`

---

## Error Handling

### Standard HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST creating resource |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, state conflict |
| 413 | Payload Too Large | File too large |
| 415 | Unsupported Media Type | Invalid file type |
| 422 | Unprocessable Entity | Semantic validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database/service down |

### Error Codes Enum
```typescript
export enum ApiErrorCode {
  // Validation Errors (400)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_QUERY_PARAMS = 'INVALID_QUERY_PARAMS',
  INVALID_BODY = 'INVALID_BODY',

  // Authentication Errors (401)
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Authorization Errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Not Found Errors (404)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  IMAGE_NOT_FOUND = 'IMAGE_NOT_FOUND',
  ALBUM_NOT_FOUND = 'ALBUM_NOT_FOUND',
  TAG_NOT_FOUND = 'TAG_NOT_FOUND',
  SMART_ALBUM_NOT_FOUND = 'SMART_ALBUM_NOT_FOUND',

  // Conflict Errors (409)
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  TAG_ALREADY_EXISTS = 'TAG_ALREADY_EXISTS',

  // File Errors (413, 415)
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',

  // Rate Limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server Errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXIF_EXTRACTION_FAILED = 'EXIF_EXTRACTION_FAILED'
}
```

---

## Pagination Strategy

### Cursor-Based Pagination (Recommended)

We use **cursor-based pagination** for:
- Better performance on large datasets
- Stable pagination during concurrent writes
- Prevents duplicate/skipped items

```typescript
// Request
GET /api/v1/timeline?cursor=img_abc123&limit=20

// Response
{
  "success": true,
  "data": [...images],
  "pagination": {
    "cursor": "img_xyz789",  // Next cursor (null if no more)
    "hasMore": true,
    "limit": 20
  }
}
```

### Offset Pagination (For Search/Explore)

Used only when random access is needed:

```typescript
// Request
GET /api/v1/search?q=beach&offset=0&limit=20

// Response
{
  "success": true,
  "data": [...images],
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

---

## Rate Limiting

### Tiers
| Tier | Requests/min | Requests/hour |
|------|-------------|---------------|
| Anonymous | 30 | 300 |
| Authenticated | 100 | 1000 |
| Upload | 10 | 50 |

### Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705318200
Retry-After: 60  // Only on 429
```

### Implementation Strategy
```typescript
// Using sliding window algorithm
// Store in Redis: key = `ratelimit:${ip}:${minute}`
```

---

## Caching Strategy

### Cache Tiers

| Resource | Cache-Control | Stale-While-Revalidate |
|----------|--------------|------------------------|
| Timeline | private, max-age=60 | 120s |
| Albums list | public, s-maxage=300 | 600s |
| Album detail | public, s-maxage=120 | 300s |
| Image detail | public, s-maxage=3600 | 7200s |
| Favorites | private, max-age=30 | 60s |
| Search results | private, max-age=60 | 120s |
| Tags list | public, s-maxage=600 | 1200s |
| EXIF data | public, s-maxage=86400 | 172800s |

### Cache Invalidation
- On image upload: Invalidate timeline, album, tags caches
- On favorite toggle: Invalidate favorites list cache
- On tag update: Invalidate image cache, tags list cache
- On album update: Invalidate album detail and list caches

---

## API Endpoints

### 1. Timeline API

#### GET /api/v1/timeline
Retrieve chronological list of all images with infinite scroll support.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | string | No | null | Pagination cursor (image ID) |
| limit | number | No | 20 | Items per page (max 100) |
| order | 'asc' \| 'desc' | No | 'desc' | Sort order by date |
| groupBy | 'day' \| 'month' \| 'year' | No | null | Group images by time period |

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "img_abc123",
        "filename": "sunset.jpg",
        "fileUrl": "/uploads/sunset.jpg",
        "thumbnailUrl": "/thumbnails/sunset.webp",
        "width": 1920,
        "height": 1080,
        "takenAt": "2024-01-15T18:30:00Z",
        "uploadedAt": "2024-01-16T10:00:00Z",
        "isFavorite": false,
        "album": {
          "id": "alb_xyz",
          "title": "Vacaciones 2024"
        },
        "exif": {
          "camera": "Canon EOS R5",
          "lens": "RF 24-70mm F2.8L",
          "iso": 400,
          "aperture": "f/2.8",
          "shutterSpeed": "1/250"
        }
      }
    ],
    "groups": [
      {
        "date": "2024-01-15",
        "count": 5,
        "startIndex": 0
      }
    ]
  },
  "pagination": {
    "cursor": "img_next123",
    "hasMore": true,
    "limit": 20
  },
  "meta": {
    "timestamp": "2024-01-16T12:00:00Z",
    "requestId": "req_abc"
  }
}
```

---

### 2. Favorites API

#### PUT /api/v1/images/:id/favorite
Add image to favorites.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "img_abc123",
    "isFavorite": true,
    "favoritedAt": "2024-01-16T12:00:00Z"
  }
}
```

#### DELETE /api/v1/images/:id/favorite
Remove image from favorites.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "img_abc123",
    "isFavorite": false
  }
}
```

#### GET /api/v1/favorites
Get all favorited images.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | string | No | null | Pagination cursor |
| limit | number | No | 20 | Items per page |
| sortBy | 'favoritedAt' \| 'takenAt' | No | 'favoritedAt' | Sort field |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "images": [...],
    "totalFavorites": 42
  },
  "pagination": {
    "cursor": "img_xyz",
    "hasMore": true
  }
}
```

---

### 3. Search & Explore API

#### GET /api/v1/search
Advanced search with multiple filters.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| q | string | No | Text search (filename, description) |
| albumId | string | No | Filter by album |
| tags | string[] | No | Filter by tags (comma-separated) |
| camera | string | No | Filter by camera model |
| lens | string | No | Filter by lens model |
| dateFrom | ISO date | No | Start date range |
| dateTo | ISO date | No | End date range |
| isFavorite | boolean | No | Filter favorites only |
| minWidth | number | No | Minimum width |
| minHeight | number | No | Minimum height |
| orientation | 'landscape' \| 'portrait' \| 'square' | No | Image orientation |
| sortBy | string | No | Sort field |
| sortOrder | 'asc' \| 'desc' | No | Sort direction |
| offset | number | No | Pagination offset |
| limit | number | No | Items per page |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "images": [...],
    "facets": {
      "cameras": [
        { "name": "Canon EOS R5", "count": 45 },
        { "name": "iPhone 15 Pro", "count": 32 }
      ],
      "albums": [
        { "id": "alb_1", "title": "Vacaciones", "count": 20 }
      ],
      "tags": [
        { "id": "tag_1", "name": "beach", "count": 15 }
      ],
      "years": [
        { "year": 2024, "count": 50 },
        { "year": 2023, "count": 30 }
      ]
    }
  },
  "pagination": {
    "offset": 0,
    "limit": 20,
    "total": 77,
    "hasMore": true
  }
}
```

---

### 4. Smart Albums API

#### GET /api/v1/smart-albums
List all smart albums.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "sa_abc123",
      "title": "Beach Photos",
      "description": "All photos taken at beaches",
      "coverUrl": "/thumbnails/beach1.webp",
      "imageCount": 45,
      "rules": {
        "operator": "AND",
        "conditions": [
          { "field": "tags", "operator": "contains", "value": "beach" }
        ]
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/smart-albums
Create a new smart album.

**Request Body:**
```json
{
  "title": "Summer 2024 Portraits",
  "description": "Portrait photos from summer 2024",
  "rules": {
    "operator": "AND",
    "conditions": [
      {
        "field": "takenAt",
        "operator": "between",
        "value": ["2024-06-01", "2024-08-31"]
      },
      {
        "field": "orientation",
        "operator": "equals",
        "value": "portrait"
      }
    ]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "sa_new123",
    "title": "Summer 2024 Portraits",
    "description": "Portrait photos from summer 2024",
    "rules": {...},
    "imageCount": 0,
    "createdAt": "2024-01-16T12:00:00Z"
  }
}
```

#### GET /api/v1/smart-albums/:id
Get smart album details.

#### PUT /api/v1/smart-albums/:id
Update smart album (full replace).

#### PATCH /api/v1/smart-albums/:id
Partial update smart album.

#### DELETE /api/v1/smart-albums/:id
Delete smart album.

**Response (204):** No content

#### GET /api/v1/smart-albums/:id/images
Get images matching smart album rules.

**Query Parameters:**
| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| cursor | string | No | null |
| limit | number | No | 20 |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "smartAlbum": {
      "id": "sa_abc123",
      "title": "Beach Photos"
    },
    "images": [...],
    "matchedCount": 45
  },
  "pagination": {
    "cursor": "img_xyz",
    "hasMore": true
  }
}
```

### Smart Album Rules Schema

```typescript
interface SmartAlbumRules {
  operator: 'AND' | 'OR';
  conditions: Condition[];
}

interface Condition {
  field: ConditionField;
  operator: ConditionOperator;
  value: string | number | boolean | string[] | [string, string];
}

type ConditionField =
  | 'takenAt'
  | 'uploadedAt'
  | 'albumId'
  | 'tags'
  | 'camera'
  | 'lens'
  | 'iso'
  | 'aperture'
  | 'shutterSpeed'
  | 'focalLength'
  | 'orientation'
  | 'isFavorite'
  | 'width'
  | 'height'
  | 'fileSize'
  | 'mimeType';

type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'notIn';
```

---

### 5. Tags API

#### GET /api/v1/tags
List all tags with usage count.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | null | Filter by category |
| sortBy | 'name' \| 'count' | 'count' | Sort field |
| limit | number | 50 | Max tags to return |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "tag_abc",
      "name": "beach",
      "category": "location",
      "imageCount": 45,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST /api/v1/tags
Create a new tag.

**Request Body:**
```json
{
  "name": "sunset",
  "category": "scene"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "tag_new123",
    "name": "sunset",
    "category": "scene",
    "imageCount": 0,
    "createdAt": "2024-01-16T12:00:00Z"
  }
}
```

#### PUT /api/v1/tags/:id
Update tag.

#### DELETE /api/v1/tags/:id
Delete tag (removes from all images).

**Response (204):** No content

#### POST /api/v1/images/:id/tags
Add tags to image.

**Request Body:**
```json
{
  "tagIds": ["tag_abc", "tag_xyz"]
}
```
or
```json
{
  "tagNames": ["beach", "sunset"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imageId": "img_abc",
    "tags": [
      { "id": "tag_abc", "name": "beach" },
      { "id": "tag_xyz", "name": "sunset" }
    ]
  }
}
```

#### DELETE /api/v1/images/:id/tags/:tagId
Remove specific tag from image.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "imageId": "img_abc",
    "removedTagId": "tag_xyz",
    "remainingTags": [...]
  }
}
```

---

### 6. EXIF API

#### GET /api/v1/images/:id
Get image with full EXIF data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "img_abc123",
    "filename": "sunset.jpg",
    "originalName": "IMG_1234.jpg",
    "fileUrl": "/uploads/sunset.jpg",
    "thumbnailUrl": "/thumbnails/sunset.webp",
    "width": 6000,
    "height": 4000,
    "fileSize": 12500000,
    "mimeType": "image/jpeg",
    "description": "Beautiful sunset at the beach",
    "isFavorite": true,
    "favoritedAt": "2024-01-10T00:00:00Z",
    "takenAt": "2024-01-15T18:30:00Z",
    "uploadedAt": "2024-01-16T10:00:00Z",
    "album": {
      "id": "alb_xyz",
      "title": "Vacaciones 2024",
      "year": 2024
    },
    "tags": [
      { "id": "tag_1", "name": "sunset", "category": "scene" },
      { "id": "tag_2", "name": "beach", "category": "location" }
    ],
    "exif": {
      "camera": {
        "make": "Canon",
        "model": "EOS R5",
        "serial": "123456789"
      },
      "lens": {
        "make": "Canon",
        "model": "RF 24-70mm F2.8L IS USM",
        "focalLength": 50,
        "focalLength35mm": 50
      },
      "exposure": {
        "iso": 400,
        "aperture": 2.8,
        "apertureFormatted": "f/2.8",
        "shutterSpeed": 0.004,
        "shutterSpeedFormatted": "1/250",
        "exposureCompensation": 0,
        "exposureMode": "Manual",
        "meteringMode": "Spot"
      },
      "flash": {
        "fired": false,
        "mode": "Off"
      },
      "location": {
        "latitude": 36.7783,
        "longitude": -119.4179,
        "altitude": 100,
        "formatted": "Fresno, California, USA"
      },
      "datetime": {
        "original": "2024-01-15T18:30:00Z",
        "digitized": "2024-01-15T18:30:00Z",
        "modified": "2024-01-15T19:00:00Z"
      },
      "image": {
        "width": 6000,
        "height": 4000,
        "orientation": 1,
        "colorSpace": "sRGB",
        "bitDepth": 8
      },
      "software": "Adobe Lightroom Classic 13.0"
    }
  }
}
```

---

### 7. Upload API

#### POST /api/v1/upload
Upload images with automatic EXIF extraction.

**Request:**
- Content-Type: `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| files | File[] | Yes | Image files (max 10 per request) |
| albumId | string | Yes | Target album ID |
| extractExif | boolean | No | Extract EXIF (default: true) |
| generateThumbnail | boolean | No | Generate thumbnail (default: true) |
| tags | string[] | No | Initial tags (JSON array or comma-separated) |

**Response (201):**
```json
{
  "success": true,
  "data": {
    "uploaded": [
      {
        "id": "img_new123",
        "filename": "1705401600_abc123.jpg",
        "originalName": "IMG_1234.jpg",
        "fileUrl": "/uploads/1705401600_abc123.jpg",
        "thumbnailUrl": "/thumbnails/1705401600_abc123.webp",
        "width": 6000,
        "height": 4000,
        "fileSize": 12500000,
        "mimeType": "image/jpeg",
        "exifExtracted": true,
        "thumbnailGenerated": true,
        "takenAt": "2024-01-15T18:30:00Z"
      }
    ],
    "failed": [
      {
        "filename": "corrupt.jpg",
        "error": "Invalid image file"
      }
    ],
    "summary": {
      "total": 5,
      "successful": 4,
      "failed": 1
    }
  }
}
```

**Error Response (413):**
```json
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds maximum allowed (50MB)",
    "details": {
      "maxSize": 52428800,
      "actualSize": 75000000,
      "filename": "huge_image.jpg"
    }
  }
}
```

**Error Response (415):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type not supported",
    "details": {
      "allowedTypes": ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"],
      "receivedType": "application/pdf",
      "filename": "document.pdf"
    }
  }
}
```

---

### 8. Albums API (Enhanced)

#### GET /api/v1/albums
List all albums with enhanced metadata.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| year | number | null | Filter by year |
| sortBy | 'year' \| 'title' \| 'createdAt' \| 'imageCount' | 'year' | Sort field |
| sortOrder | 'asc' \| 'desc' | 'desc' | Sort direction |
| includeEmpty | boolean | true | Include albums with no images |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "alb_abc123",
      "year": 2024,
      "title": "Vacaciones",
      "description": "Fotos de vacaciones de verano",
      "subAlbum": "Playa",
      "coverImageUrl": "/thumbnails/cover.webp",
      "imageCount": 150,
      "totalSize": 1500000000,
      "dateRange": {
        "earliest": "2024-06-01T00:00:00Z",
        "latest": "2024-06-15T00:00:00Z"
      },
      "createdAt": "2024-06-16T00:00:00Z",
      "updatedAt": "2024-06-20T00:00:00Z"
    }
  ],
  "meta": {
    "totalAlbums": 10,
    "totalImages": 500,
    "yearRange": {
      "min": 2020,
      "max": 2024
    }
  }
}
```

#### POST /api/v1/albums
Create new album.

**Request Body:**
```json
{
  "year": 2024,
  "title": "Vacaciones",
  "description": "Fotos de vacaciones",
  "subAlbum": "Playa"
}
```

#### GET /api/v1/albums/:id
Get album details with images.

#### PUT /api/v1/albums/:id
Update album.

#### DELETE /api/v1/albums/:id
Delete album and optionally its images.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| deleteImages | boolean | false | Also delete images |
| moveToAlbum | string | null | Move images to another album before delete |

---

## OpenAPI Specification

The complete OpenAPI 3.1 specification is available at:
- Development: `http://localhost:3000/api/v1/openapi.json`
- Documentation UI: `http://localhost:3000/api/v1/docs`

See the separate file: `openapi.yaml` for the full specification.

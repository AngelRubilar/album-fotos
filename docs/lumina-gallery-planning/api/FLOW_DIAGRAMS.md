# Lumina Gallery - API Flow Diagrams

This document contains flow diagrams for complex API operations.

---

## 1. Image Upload Flow

```
                                    ┌─────────────────────────┐
                                    │   Client Upload Request │
                                    │   POST /api/v1/upload   │
                                    └───────────┬─────────────┘
                                                │
                                                ▼
                              ┌─────────────────────────────────┐
                              │       Rate Limit Check          │
                              │   (10 req/min for uploads)      │
                              └───────────┬─────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │ 429 Rate │          │       │   Continue   │
                    │ Limited  │          │       │  Processing  │
                    └──────────┘          │       └──────┬───────┘
                                          │              │
                                          │              ▼
                              ┌───────────┴──────────────────────┐
                              │      Validate FormData           │
                              │  - Check files exist             │
                              │  - Check albumId exists          │
                              │  - Validate file count (<=10)    │
                              └───────────┬──────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │ 400 Bad  │          │       │   Continue   │
                    │ Request  │          │       └──────┬───────┘
                    └──────────┘          │              │
                                          │              │
                              ┌───────────┴──────────────┼───────┐
                              │                          │       │
                              │      FOR EACH FILE       │       │
                              │                          │       │
                              └──────────────────────────┼───────┘
                                                         │
                                                         ▼
                              ┌───────────────────────────────────┐
                              │        Validate File              │
                              │  - Check MIME type (image/*)      │
                              │  - Check file size (<=50MB)       │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │  Skip &  │          │       │   Process    │
                    │  Record  │          │       │    File      │
                    │  Error   │          │       └──────┬───────┘
                    └──────────┘          │              │
                                          │              │
                                          │              ▼
                              ┌───────────┴──────────────────────┐
                              │      Generate Unique Filename    │
                              │   {timestamp}_{randomId}.{ext}   │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Write File to Disk          │
                              │   /public/uploads/{filename}     │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │     Generate Thumbnail (WebP)    │
                              │   /public/thumbnails/{name}.webp │
                              │   Size: 400x400, Quality: 80     │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Extract EXIF Metadata       │
                              │  - Camera info                   │
                              │  - Lens info                     │
                              │  - Exposure settings             │
                              │  - GPS coordinates               │
                              │  - Date taken                    │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Create Database Record      │
                              │  - Image metadata                │
                              │  - EXIF data (JSON)              │
                              │  - Relationships                 │
                              └───────────┬───────────────────────┘
                                          │
                              ┌───────────┴──────────────────────┐
                              │                                  │
                              │     END FOR EACH                 │
                              │                                  │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Response             │
                              │  {                               │
                              │    uploaded: [...],              │
                              │    failed: [...],                │
                              │    summary: { total, success }   │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 2. Smart Album Rule Evaluation Flow

```
                              ┌─────────────────────────────────┐
                              │   GET /smart-albums/:id/images  │
                              └───────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Fetch Smart Album           │
                              │      by ID from Database         │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │ 404 Not  │          │       │  Parse Rules │
                    │  Found   │          │       │     JSON     │
                    └──────────┘          │       └──────┬───────┘
                                          │              │
                                          │              ▼
                              ┌───────────┴──────────────────────┐
                              │      Rules Structure:            │
                              │  {                               │
                              │    operator: "AND" | "OR",       │
                              │    conditions: [                 │
                              │      { field, operator, value }  │
                              │    ]                             │
                              │  }                               │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │     Translate Each Condition     │
                              │     to Prisma Where Clause       │
                              └───────────┬───────────────────────┘
                                          │
                              ┌───────────┴──────────────────────┐
                              │                                  │
                              │      FOR EACH CONDITION          │
                              │                                  │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONDITION TRANSLATION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │ Field Mapping   │    │ Operator Trans  │    │ Value Transform │        │
│  ├─────────────────┤    ├─────────────────┤    ├─────────────────┤        │
│  │ takenAt →       │    │ equals →        │    │ Date strings →  │        │
│  │   takenAt       │    │   { equals: }   │    │   Date objects  │        │
│  │ camera →        │    │ contains →      │    │                 │        │
│  │   exif.camera   │    │   { contains: } │    │ Arrays →        │        │
│  │ tags →          │    │ between →       │    │   Prisma arrays │        │
│  │   tags.name     │    │   { gte, lte }  │    │                 │        │
│  │ orientation →   │    │ in →            │    │ Booleans →      │        │
│  │   computed      │    │   { in: [] }    │    │   Direct        │        │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                              ┌───────────┴──────────────────────┐
                              │                                  │
                              │      END FOR EACH                │
                              │                                  │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Combine Conditions          │
                              │                                   │
                              │  operator = "AND"                │
                              │    → { AND: [conditions] }       │
                              │                                   │
                              │  operator = "OR"                 │
                              │    → { OR: [conditions] }        │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Add Cursor Pagination       │
                              │  if cursor:                      │
                              │    AND: [..., cursorCondition]   │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Execute Prisma Query        │
                              │                                   │
                              │  prisma.image.findMany({         │
                              │    where: combinedWhere,         │
                              │    take: limit + 1,              │
                              │    orderBy: { uploadedAt: desc } │
                              │  })                              │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Paginated Results    │
                              │  {                               │
                              │    images: [...],                │
                              │    matchedCount: N,              │
                              │    pagination: {                 │
                              │      cursor, hasMore, limit      │
                              │    }                             │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 3. Search with Facets Flow

```
                              ┌─────────────────────────────────┐
                              │      GET /api/v1/search         │
                              │   ?q=beach&dateFrom=2024-01    │
                              └───────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Validate Query Params       │
                              │  (Zod schema validation)         │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BUILD PRISMA WHERE CLAUSE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Text Search (q)                  Filters                                 │
│   ┌──────────────┐                 ┌────────────────┐                      │
│   │ OR: [        │                 │ albumId        │                      │
│   │   filename,  │                 │ tags           │                      │
│   │   original,  │   + AND +       │ dateFrom/To    │                      │
│   │   description│                 │ camera/lens    │                      │
│   │ ] contains q │                 │ orientation    │                      │
│   └──────────────┘                 │ dimensions     │                      │
│                                    │ isFavorite     │                      │
│                                    └────────────────┘                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Execute Parallel Queries    │
                              └───────────┬───────────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌───────────────┐    ┌────────────────┐    ┌────────────────┐
           │  Main Query   │    │  Count Query   │    │ Facets Queries │
           │               │    │                │    │                │
           │ findMany({    │    │ count({        │    │ - groupBy      │
           │   where,      │    │   where        │    │   camera       │
           │   skip: off,  │    │ })             │    │ - groupBy      │
           │   take: lim,  │    │                │    │   albumId      │
           │   orderBy     │    │                │    │ - groupBy      │
           │ })            │    │                │    │   tags         │
           │               │    │                │    │ - groupBy year │
           └───────┬───────┘    └───────┬────────┘    └───────┬────────┘
                   │                    │                     │
                   └────────────────────┼─────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────────────────┐
                              │       Aggregate Results          │
                              │                                   │
                              │  facets: {                       │
                              │    cameras: [                    │
                              │      { name: "Canon", count: 45 }│
                              │    ],                            │
                              │    albums: [...],                │
                              │    tags: [...],                  │
                              │    years: [...]                  │
                              │  }                               │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │       Return Response            │
                              │  {                               │
                              │    images: [...],                │
                              │    facets: {...},                │
                              │    pagination: {                 │
                              │      offset, limit, total,       │
                              │      hasMore                     │
                              │    }                             │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 4. Favorite Toggle Flow

```
                              ┌─────────────────────────────────┐
                              │  PUT/DELETE /images/:id/favorite │
                              └───────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Validate Image ID           │
                              │      (Route params)              │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Check Image Exists          │
                              │      prisma.image.findUnique     │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │ 404 Not  │          │       │   Continue   │
                    │  Found   │          │       └──────┬───────┘
                    └──────────┘          │              │
                                          │              │
                                          │              ▼
                              ┌───────────┴──────────────────────┐
                              │         Check Method             │
                              └───────────┬──────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────────┐      │      ┌──────────────┐
                    │    PUT       │      │      │   DELETE     │
                    │  (Add to     │      │      │  (Remove     │
                    │  favorites)  │      │      │  from favs)  │
                    └──────┬───────┘      │      └──────┬───────┘
                           │              │             │
                           ▼              │             ▼
                    ┌──────────────┐      │      ┌──────────────┐
                    │ UPDATE       │      │      │ UPDATE       │
                    │ isFavorite:  │      │      │ isFavorite:  │
                    │   true       │      │      │   false      │
                    │ favoritedAt: │      │      │ favoritedAt: │
                    │   now()      │      │      │   null       │
                    └──────┬───────┘      │      └──────┬───────┘
                           │              │             │
                           └──────────────┼─────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Invalidate Cache            │
                              │  - Timeline cache                │
                              │  - Favorites list cache          │
                              │  - Image detail cache            │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Response             │
                              │  {                               │
                              │    id: "img_xxx",                │
                              │    isFavorite: true/false,       │
                              │    favoritedAt: "..." | null     │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 5. Timeline with Grouping Flow

```
                              ┌─────────────────────────────────┐
                              │      GET /api/v1/timeline       │
                              │   ?groupBy=day&limit=50        │
                              └───────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Parse Query Parameters      │
                              │  - cursor (optional)             │
                              │  - limit (default: 20)           │
                              │  - order (default: desc)         │
                              │  - groupBy (day|month|year|null) │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Build Cursor Condition      │
                              │                                   │
                              │  if cursor:                      │
                              │    Find cursor image date        │
                              │    where: uploadedAt < cursorDate│
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Fetch Images                │
                              │                                   │
                              │  prisma.image.findMany({         │
                              │    where: cursorCondition,       │
                              │    take: limit + 1,              │
                              │    orderBy: { uploadedAt: order },│
                              │    include: { album }            │
                              │  })                              │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Determine Pagination        │
                              │                                   │
                              │  hasMore = results.length > limit│
                              │  images = slice(0, limit)        │
                              │  nextCursor = lastImage.id       │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Build Groups (if groupBy)   │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
           ┌───────────────────┐          │      ┌──────────────────┐
           │  No Grouping      │          │      │  With Grouping   │
           │  groups = []      │          │      └────────┬─────────┘
           └───────────────────┘          │               │
                                          │               ▼
                              ┌───────────┴───────────────────────┐
                              │        Group Algorithm           │
                              │                                   │
                              │  for each image:                 │
                              │    date = image.takenAt ||       │
                              │           image.uploadedAt       │
                              │                                   │
                              │    groupKey = formatDate(date,   │
                              │                         groupBy) │
                              │                                   │
                              │    if newGroup:                  │
                              │      groups.push({               │
                              │        date: groupKey,           │
                              │        count: 1,                 │
                              │        startIndex: currentIndex  │
                              │      })                          │
                              │    else:                         │
                              │      currentGroup.count++        │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         GROUPING EXAMPLES                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  groupBy: "day"              groupBy: "month"         groupBy: "year"      │
│  ┌──────────────────┐        ┌──────────────────┐     ┌──────────────────┐ │
│  │ 2024-01-15       │        │ 2024-01          │     │ 2024             │ │
│  │   count: 5       │        │   count: 45      │     │   count: 200     │ │
│  │   startIndex: 0  │        │   startIndex: 0  │     │   startIndex: 0  │ │
│  │                  │        │                  │     │                  │ │
│  │ 2024-01-14       │        │ 2023-12          │     │ 2023             │ │
│  │   count: 8       │        │   count: 32      │     │   count: 150     │ │
│  │   startIndex: 5  │        │   startIndex: 45 │     │   startIndex: 200│ │
│  └──────────────────┘        └──────────────────┘     └──────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Response             │
                              │  {                               │
                              │    data: {                       │
                              │      images: [...],              │
                              │      groups: [...]               │
                              │    },                            │
                              │    pagination: {                 │
                              │      cursor: nextCursor,         │
                              │      hasMore: boolean,           │
                              │      limit: number               │
                              │    }                             │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 6. Tag Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TAG OPERATIONS FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │         POST /images/:id/tags           │
                    │   { tagIds: [...] } OR { tagNames: [] } │
                    └───────────────────┬─────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────────────────┐
                              │      Validate Image Exists       │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────────┐      │      ┌──────────────────┐
                    │   tagIds     │      │      │    tagNames      │
                    │   provided   │      │      │    provided      │
                    └──────┬───────┘      │      └────────┬─────────┘
                           │              │               │
                           ▼              │               ▼
           ┌───────────────────────┐      │      ┌────────────────────┐
           │ Validate each tagId  │      │      │ For each tagName:  │
           │ exists in database   │      │      │                    │
           │                      │      │      │ 1. Normalize name  │
           │ If not found:        │      │      │    (lowercase,trim)│
           │   → 404 TAG_NOT_FOUND│      │      │                    │
           └───────────┬──────────┘      │      │ 2. Find or Create  │
                       │                 │      │    tag in database │
                       │                 │      │                    │
                       │                 │      │ 3. Return tag ID   │
                       │                 │      └─────────┬──────────┘
                       │                 │                │
                       └─────────────────┼────────────────┘
                                         │
                                         ▼
                              ┌───────────────────────────────────┐
                              │      Create ImageTag Relations   │
                              │                                   │
                              │  For each tag:                   │
                              │    prisma.imageTag.upsert({      │
                              │      where: {                    │
                              │        imageId_tagId: unique     │
                              │      },                          │
                              │      create: { imageId, tagId }, │
                              │      update: {}  // No-op        │
                              │    })                            │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Invalidate Caches           │
                              │  - Image detail cache            │
                              │  - Tags list cache               │
                              │  - Search cache (tag filters)    │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Updated Tags         │
                              │  {                               │
                              │    imageId: "...",               │
                              │    tags: [...all current tags],  │
                              │    addedTags: [...new ones]      │
                              │  }                               │
                              └───────────────────────────────────┘


                    ┌─────────────────────────────────────────┐
                    │    DELETE /images/:id/tags/:tagId       │
                    └───────────────────┬─────────────────────┘
                                        │
                                        ▼
                              ┌───────────────────────────────────┐
                              │   Validate Image & Tag Exist     │
                              │   AND relation exists            │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
                    ┌──────────┐          │       ┌──────────────┐
                    │ 404 Not  │          │       │   Delete     │
                    │  Found   │          │       │  Relation    │
                    └──────────┘          │       └──────┬───────┘
                                          │              │
                                          │              ▼
                              ┌───────────┴──────────────────────┐
                              │      prisma.imageTag.delete({    │
                              │        where: {                  │
                              │          imageId_tagId: {        │
                              │            imageId, tagId        │
                              │          }                       │
                              │        }                         │
                              │      })                          │
                              └───────────┬──────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Return Remaining Tags       │
                              │  {                               │
                              │    imageId: "...",               │
                              │    removedTagId: "...",          │
                              │    remainingTags: [...]          │
                              │  }                               │
                              └───────────────────────────────────┘
```

---

## 7. Rate Limiting Flow (Sliding Window)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     RATE LIMITING (SLIDING WINDOW)                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────────────────────┐
                              │      Incoming API Request       │
                              └───────────┬─────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Extract Client ID           │
                              │                                   │
                              │  Priority:                       │
                              │  1. X-Forwarded-For header       │
                              │  2. X-Real-IP header             │
                              │  3. CF-Connecting-IP             │
                              │  4. Fallback: UA + Lang hash     │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Select Rate Limit Tier      │
                              │                                   │
                              │  Endpoint → Tier:                │
                              │  - /upload → upload (10/min)     │
                              │  - /search → search (50/min)     │
                              │  - default → anonymous (30/min)  │
                              └───────────┬───────────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Check Rate Limit Store      │
                              │      Key: {prefix}:{clientId}    │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
           ┌───────────────────────┐      │      ┌────────────────────┐
           │   Entry Not Found     │      │      │   Entry Found      │
           │   or Expired          │      │      │                    │
           │                       │      │      │   Check if window  │
           │   Create new entry:   │      │      │   has expired      │
           │   {                   │      │      │                    │
           │     count: 1,         │      │      │   If expired:      │
           │     resetTime: now+   │      │      │     Reset counter  │
           │       windowMs        │      │      │                    │
           │   }                   │      │      │   Else:            │
           │                       │      │      │     Increment count│
           └───────────┬───────────┘      │      └─────────┬──────────┘
                       │                  │                │
                       └──────────────────┼────────────────┘
                                          │
                                          ▼
                              ┌───────────────────────────────────┐
                              │      Check Limit Exceeded        │
                              │      count > tier.limit ?        │
                              └───────────┬───────────────────────┘
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                           ▼              │              ▼
           ┌───────────────────────┐      │      ┌────────────────────┐
           │   Limit Exceeded      │      │      │   Within Limit     │
           │                       │      │      │                    │
           │   Return 429:         │      │      │   Add Headers:     │
           │   {                   │      │      │   X-RateLimit-     │
           │     error: "RATE_     │      │      │     Limit: 30      │
           │       LIMIT_EXCEEDED" │      │      │   X-RateLimit-     │
           │   }                   │      │      │     Remaining: 25  │
           │                       │      │      │   X-RateLimit-     │
           │   Headers:            │      │      │     Reset: 16053.. │
           │   Retry-After: 45     │      │      │                    │
           │                       │      │      │   Continue to      │
           │                       │      │      │   handler          │
           └───────────────────────┘      │      └────────────────────┘
                                          │
                                          │
┌─────────────────────────────────────────┴─────────────────────────────────────┐
│                              STORAGE CLEANUP                                  │
│                                                                               │
│   Background job (every 60s):                                                │
│   - Iterate through all entries                                              │
│   - Delete entries where now() > resetTime                                   │
│   - Prevents memory leaks from accumulated entries                           │
│                                                                               │
│   In production: Use Redis with TTL for automatic expiration                 │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Cache Invalidation Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CACHE INVALIDATION MATRIX                            │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │              MUTATION EVENT             │
                    └─────────────────────────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        │               │               │               │               │
        ▼               ▼               ▼               ▼               ▼
┌───────────────┐ ┌───────────┐ ┌───────────────┐ ┌───────────┐ ┌───────────┐
│ Image Upload  │ │  Toggle   │ │   Tag Add/    │ │  Album    │ │  Smart    │
│               │ │ Favorite  │ │   Remove      │ │  Update   │ │  Album    │
│               │ │           │ │               │ │           │ │  Change   │
└───────┬───────┘ └─────┬─────┘ └───────┬───────┘ └─────┬─────┘ └─────┬─────┘
        │               │               │               │             │
        ▼               ▼               ▼               ▼             ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                         CACHES TO INVALIDATE                                  │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  Image Upload:                   Toggle Favorite:                            │
│  ├── Timeline cache              ├── Timeline cache (re-sort)               │
│  ├── Album detail cache          ├── Favorites list cache                   │
│  ├── Album list cache (counts)   ├── Image detail cache                     │
│  ├── Tags list cache (if tagged) └── Search cache (if filtered by fav)     │
│  └── Smart album caches (eval)                                               │
│                                                                               │
│  Tag Add/Remove:                 Album Update:                               │
│  ├── Image detail cache          ├── Album detail cache                     │
│  ├── Tags list cache             ├── Album list cache                       │
│  ├── Search cache                └── Timeline cache (album info)            │
│  └── Smart album caches (tag rules)                                          │
│                                                                               │
│  Smart Album Change:                                                         │
│  ├── Smart album detail cache                                                │
│  ├── Smart album list cache                                                  │
│  └── Smart album images cache                                                │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘

                              ┌───────────────────────────────────┐
                              │      INVALIDATION METHODS         │
                              └───────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │           Cache-Control Headers         │
                    │                                         │
                    │  Response headers control client/CDN:   │
                    │  - max-age: Browser cache duration      │
                    │  - s-maxage: CDN cache duration         │
                    │  - stale-while-revalidate: Serve stale  │
                    │    while fetching fresh                 │
                    └─────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │       React Query Invalidation          │
                    │                                         │
                    │  Client-side cache management:          │
                    │                                         │
                    │  queryClient.invalidateQueries({        │
                    │    queryKey: ['timeline']               │
                    │  })                                     │
                    │                                         │
                    │  // Or optimistic updates:              │
                    │  queryClient.setQueryData(              │
                    │    ['image', id],                       │
                    │    (old) => ({ ...old, isFavorite })    │
                    │  )                                      │
                    └─────────────────────────────────────────┘

                    ┌─────────────────────────────────────────┐
                    │         CDN Cache Purge                 │
                    │                                         │
                    │  For production with CDN:               │
                    │  - API call to purge specific URLs      │
                    │  - Cache tags for group purging         │
                    │  - Surrogate keys pattern               │
                    └─────────────────────────────────────────┘
```

---

## Summary

These diagrams illustrate the key flows in the Lumina Gallery API:

1. **Upload Flow** - Multi-step file processing with validation, thumbnail generation, and EXIF extraction
2. **Smart Album Evaluation** - Dynamic rule translation to database queries
3. **Search with Facets** - Parallel query execution for efficient filtering
4. **Favorite Toggle** - Simple state change with cache invalidation
5. **Timeline with Grouping** - Cursor pagination with optional date grouping
6. **Tag Management** - Create-on-demand tagging system
7. **Rate Limiting** - Sliding window algorithm with tiered limits
8. **Cache Strategy** - Multi-layer caching with intelligent invalidation

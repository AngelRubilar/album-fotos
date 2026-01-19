/**
 * Lumina Gallery - API Validation Schemas
 *
 * Centralized Zod schemas for all API endpoints.
 * These schemas provide runtime validation and TypeScript type inference.
 */

import { z } from 'zod';

// =============================================================================
// COMMON SCHEMAS
// =============================================================================

/**
 * UUID/CUID identifier schema
 */
export const idSchema = z.string().min(1, 'ID is required').max(30);

/**
 * Pagination cursor schema
 */
export const cursorSchema = z.string().optional();

/**
 * Pagination limit schema (1-100, default 20)
 */
export const limitSchema = z.coerce
  .number()
  .int()
  .min(1, 'Limit must be at least 1')
  .max(100, 'Limit cannot exceed 100')
  .default(20);

/**
 * Offset pagination schema
 */
export const offsetSchema = z.coerce
  .number()
  .int()
  .min(0, 'Offset must be non-negative')
  .default(0);

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(['asc', 'desc']).default('desc');

/**
 * ISO date string schema
 */
export const isoDateSchema = z.string().datetime({ offset: true }).or(z.string().date());

/**
 * Optional ISO date schema
 */
export const optionalDateSchema = isoDateSchema.optional();

// =============================================================================
// TIMELINE SCHEMAS
// =============================================================================

/**
 * Timeline query parameters schema
 */
export const timelineQuerySchema = z.object({
  cursor: cursorSchema,
  limit: limitSchema,
  order: sortOrderSchema,
  groupBy: z.enum(['day', 'month', 'year']).optional(),
});

export type TimelineQuery = z.infer<typeof timelineQuerySchema>;

/**
 * Timeline image response schema
 */
export const timelineImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  fileUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  takenAt: z.string().nullable(),
  uploadedAt: z.string(),
  isFavorite: z.boolean(),
  album: z.object({
    id: z.string(),
    title: z.string(),
  }).nullable(),
  exif: z.object({
    camera: z.string().nullable(),
    lens: z.string().nullable(),
    iso: z.number().nullable(),
    aperture: z.string().nullable(),
    shutterSpeed: z.string().nullable(),
  }).optional(),
});

export type TimelineImage = z.infer<typeof timelineImageSchema>;

// =============================================================================
// FAVORITES SCHEMAS
// =============================================================================

/**
 * Favorite toggle response schema
 */
export const favoriteResponseSchema = z.object({
  id: z.string(),
  isFavorite: z.boolean(),
  favoritedAt: z.string().nullable(),
});

export type FavoriteResponse = z.infer<typeof favoriteResponseSchema>;

/**
 * Favorites list query schema
 */
export const favoritesQuerySchema = z.object({
  cursor: cursorSchema,
  limit: limitSchema,
  sortBy: z.enum(['favoritedAt', 'takenAt', 'uploadedAt']).default('favoritedAt'),
  sortOrder: sortOrderSchema,
});

export type FavoritesQuery = z.infer<typeof favoritesQuerySchema>;

// =============================================================================
// SEARCH SCHEMAS
// =============================================================================

/**
 * Image orientation enum
 */
export const orientationSchema = z.enum(['landscape', 'portrait', 'square']);

/**
 * Search query parameters schema
 */
export const searchQuerySchema = z.object({
  // Text search
  q: z.string().max(200).optional(),

  // Filters
  albumId: idSchema.optional(),
  tags: z.string().transform(val => val.split(',')).optional(),
  camera: z.string().max(100).optional(),
  lens: z.string().max(100).optional(),
  dateFrom: optionalDateSchema,
  dateTo: optionalDateSchema,
  isFavorite: z.coerce.boolean().optional(),

  // Dimension filters
  minWidth: z.coerce.number().int().positive().optional(),
  minHeight: z.coerce.number().int().positive().optional(),
  maxWidth: z.coerce.number().int().positive().optional(),
  maxHeight: z.coerce.number().int().positive().optional(),
  orientation: orientationSchema.optional(),

  // File filters
  mimeType: z.string().optional(),
  minFileSize: z.coerce.number().int().positive().optional(),
  maxFileSize: z.coerce.number().int().positive().optional(),

  // Sorting
  sortBy: z.enum([
    'takenAt',
    'uploadedAt',
    'filename',
    'fileSize',
    'width',
    'height',
  ]).default('takenAt'),
  sortOrder: sortOrderSchema,

  // Pagination (offset-based for search)
  offset: offsetSchema,
  limit: limitSchema,
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Search facet schema
 */
export const searchFacetSchema = z.object({
  cameras: z.array(z.object({
    name: z.string(),
    count: z.number(),
  })),
  albums: z.array(z.object({
    id: z.string(),
    title: z.string(),
    count: z.number(),
  })),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    count: z.number(),
  })),
  years: z.array(z.object({
    year: z.number(),
    count: z.number(),
  })),
});

export type SearchFacets = z.infer<typeof searchFacetSchema>;

// =============================================================================
// SMART ALBUMS SCHEMAS
// =============================================================================

/**
 * Condition field types
 */
export const conditionFieldSchema = z.enum([
  'takenAt',
  'uploadedAt',
  'albumId',
  'tags',
  'camera',
  'lens',
  'iso',
  'aperture',
  'shutterSpeed',
  'focalLength',
  'orientation',
  'isFavorite',
  'width',
  'height',
  'fileSize',
  'mimeType',
  'description',
]);

export type ConditionField = z.infer<typeof conditionFieldSchema>;

/**
 * Condition operator types
 */
export const conditionOperatorSchema = z.enum([
  'equals',
  'notEquals',
  'contains',
  'notContains',
  'startsWith',
  'endsWith',
  'greaterThan',
  'lessThan',
  'greaterThanOrEqual',
  'lessThanOrEqual',
  'between',
  'in',
  'notIn',
  'isNull',
  'isNotNull',
]);

export type ConditionOperator = z.infer<typeof conditionOperatorSchema>;

/**
 * Single condition schema
 */
export const conditionSchema = z.object({
  field: conditionFieldSchema,
  operator: conditionOperatorSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.string()),
    z.tuple([z.string(), z.string()]), // For 'between' operator
  ]),
});

export type Condition = z.infer<typeof conditionSchema>;

/**
 * Smart album rules schema
 */
export const smartAlbumRulesSchema = z.object({
  operator: z.enum(['AND', 'OR']),
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
});

export type SmartAlbumRules = z.infer<typeof smartAlbumRulesSchema>;

/**
 * Create smart album request schema
 */
export const createSmartAlbumSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500).optional(),
  rules: smartAlbumRulesSchema,
});

export type CreateSmartAlbumInput = z.infer<typeof createSmartAlbumSchema>;

/**
 * Update smart album request schema
 */
export const updateSmartAlbumSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  rules: smartAlbumRulesSchema.optional(),
});

export type UpdateSmartAlbumInput = z.infer<typeof updateSmartAlbumSchema>;

/**
 * Smart album response schema
 */
export const smartAlbumResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(),
  imageCount: z.number(),
  rules: smartAlbumRulesSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type SmartAlbumResponse = z.infer<typeof smartAlbumResponseSchema>;

/**
 * Smart album images query schema
 */
export const smartAlbumImagesQuerySchema = z.object({
  cursor: cursorSchema,
  limit: limitSchema,
});

export type SmartAlbumImagesQuery = z.infer<typeof smartAlbumImagesQuerySchema>;

// =============================================================================
// TAGS SCHEMAS
// =============================================================================

/**
 * Tag category enum
 */
export const tagCategorySchema = z.enum([
  'general',
  'location',
  'event',
  'person',
  'object',
  'scene',
  'emotion',
  'color',
  'custom',
]);

export type TagCategory = z.infer<typeof tagCategorySchema>;

/**
 * Tags list query schema
 */
export const tagsQuerySchema = z.object({
  category: tagCategorySchema.optional(),
  search: z.string().max(50).optional(),
  sortBy: z.enum(['name', 'count', 'createdAt']).default('count'),
  sortOrder: sortOrderSchema,
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export type TagsQuery = z.infer<typeof tagsQuerySchema>;

/**
 * Create tag request schema
 */
export const createTagSchema = z.object({
  name: z.string()
    .min(1, 'Tag name is required')
    .max(50, 'Tag name too long')
    .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Tag name contains invalid characters')
    .transform(val => val.toLowerCase().trim()),
  category: tagCategorySchema.default('general'),
});

export type CreateTagInput = z.infer<typeof createTagSchema>;

/**
 * Update tag request schema
 */
export const updateTagSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  category: tagCategorySchema.optional(),
});

export type UpdateTagInput = z.infer<typeof updateTagSchema>;

/**
 * Tag response schema
 */
export const tagResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: tagCategorySchema,
  imageCount: z.number(),
  createdAt: z.string(),
});

export type TagResponse = z.infer<typeof tagResponseSchema>;

/**
 * Add tags to image request schema
 */
export const addTagsToImageSchema = z.union([
  z.object({
    tagIds: z.array(idSchema).min(1, 'At least one tag ID is required'),
  }),
  z.object({
    tagNames: z.array(z.string().min(1).max(50)).min(1, 'At least one tag name is required'),
  }),
]);

export type AddTagsToImageInput = z.infer<typeof addTagsToImageSchema>;

// =============================================================================
// EXIF SCHEMAS
// =============================================================================

/**
 * Camera EXIF data schema
 */
export const exifCameraSchema = z.object({
  make: z.string().nullable(),
  model: z.string().nullable(),
  serial: z.string().nullable(),
});

/**
 * Lens EXIF data schema
 */
export const exifLensSchema = z.object({
  make: z.string().nullable(),
  model: z.string().nullable(),
  focalLength: z.number().nullable(),
  focalLength35mm: z.number().nullable(),
});

/**
 * Exposure EXIF data schema
 */
export const exifExposureSchema = z.object({
  iso: z.number().nullable(),
  aperture: z.number().nullable(),
  apertureFormatted: z.string().nullable(),
  shutterSpeed: z.number().nullable(),
  shutterSpeedFormatted: z.string().nullable(),
  exposureCompensation: z.number().nullable(),
  exposureMode: z.string().nullable(),
  meteringMode: z.string().nullable(),
});

/**
 * Flash EXIF data schema
 */
export const exifFlashSchema = z.object({
  fired: z.boolean().nullable(),
  mode: z.string().nullable(),
});

/**
 * Location EXIF data schema
 */
export const exifLocationSchema = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  altitude: z.number().nullable(),
  formatted: z.string().nullable(),
});

/**
 * DateTime EXIF data schema
 */
export const exifDateTimeSchema = z.object({
  original: z.string().nullable(),
  digitized: z.string().nullable(),
  modified: z.string().nullable(),
});

/**
 * Image properties EXIF data schema
 */
export const exifImageSchema = z.object({
  width: z.number().nullable(),
  height: z.number().nullable(),
  orientation: z.number().nullable(),
  colorSpace: z.string().nullable(),
  bitDepth: z.number().nullable(),
});

/**
 * Complete EXIF data schema
 */
export const exifDataSchema = z.object({
  camera: exifCameraSchema.nullable(),
  lens: exifLensSchema.nullable(),
  exposure: exifExposureSchema.nullable(),
  flash: exifFlashSchema.nullable(),
  location: exifLocationSchema.nullable(),
  datetime: exifDateTimeSchema.nullable(),
  image: exifImageSchema.nullable(),
  software: z.string().nullable(),
});

export type ExifData = z.infer<typeof exifDataSchema>;

// =============================================================================
// UPLOAD SCHEMAS
// =============================================================================

/**
 * Allowed image MIME types
 */
export const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
  'image/avif',
] as const;

export const mimeTypeSchema = z.enum(allowedMimeTypes);

/**
 * Max file size (50MB)
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;

/**
 * Max files per upload
 */
export const MAX_FILES_PER_UPLOAD = 10;

/**
 * Upload metadata schema
 */
export const uploadMetadataSchema = z.object({
  albumId: idSchema,
  extractExif: z.coerce.boolean().default(true),
  generateThumbnail: z.coerce.boolean().default(true),
  tags: z.union([
    z.string().transform(val => {
      try {
        return JSON.parse(val) as string[];
      } catch {
        return val.split(',').map(t => t.trim()).filter(Boolean);
      }
    }),
    z.array(z.string()),
  ]).optional(),
});

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>;

/**
 * Upload response item schema
 */
export const uploadedImageSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  fileUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  fileSize: z.number(),
  mimeType: z.string(),
  exifExtracted: z.boolean(),
  thumbnailGenerated: z.boolean(),
  takenAt: z.string().nullable(),
});

export type UploadedImage = z.infer<typeof uploadedImageSchema>;

/**
 * Upload failed item schema
 */
export const uploadFailedSchema = z.object({
  filename: z.string(),
  error: z.string(),
});

export type UploadFailed = z.infer<typeof uploadFailedSchema>;

/**
 * Upload response schema
 */
export const uploadResponseSchema = z.object({
  uploaded: z.array(uploadedImageSchema),
  failed: z.array(uploadFailedSchema),
  summary: z.object({
    total: z.number(),
    successful: z.number(),
    failed: z.number(),
  }),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;

// =============================================================================
// ALBUMS SCHEMAS
// =============================================================================

/**
 * Create album request schema
 */
export const createAlbumSchema = z.object({
  year: z.coerce.number()
    .int()
    .min(1900, 'Year must be after 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title too long')
    .trim(),
  description: z.string().max(1000).optional(),
  subAlbum: z.string().max(100).optional(),
});

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;

/**
 * Update album request schema
 */
export const updateAlbumSchema = z.object({
  year: z.coerce.number().int().min(1900).optional(),
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(1000).optional(),
  subAlbum: z.string().max(100).optional(),
  coverImageUrl: z.string().url().optional(),
});

export type UpdateAlbumInput = z.infer<typeof updateAlbumSchema>;

/**
 * Albums list query schema
 */
export const albumsQuerySchema = z.object({
  year: z.coerce.number().int().optional(),
  sortBy: z.enum(['year', 'title', 'createdAt', 'imageCount']).default('year'),
  sortOrder: sortOrderSchema,
  includeEmpty: z.coerce.boolean().default(true),
});

export type AlbumsQuery = z.infer<typeof albumsQuerySchema>;

/**
 * Delete album query schema
 */
export const deleteAlbumQuerySchema = z.object({
  deleteImages: z.coerce.boolean().default(false),
  moveToAlbum: idSchema.optional(),
});

export type DeleteAlbumQuery = z.infer<typeof deleteAlbumQuerySchema>;

/**
 * Album response schema
 */
export const albumResponseSchema = z.object({
  id: z.string(),
  year: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  subAlbum: z.string().nullable(),
  coverImageUrl: z.string().nullable(),
  imageCount: z.number(),
  totalSize: z.number().optional(),
  dateRange: z.object({
    earliest: z.string().nullable(),
    latest: z.string().nullable(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AlbumResponse = z.infer<typeof albumResponseSchema>;

// =============================================================================
// IMAGE DETAIL SCHEMAS
// =============================================================================

/**
 * Update image request schema
 */
export const updateImageSchema = z.object({
  description: z.string().max(2000).optional(),
  takenAt: isoDateSchema.optional(),
});

export type UpdateImageInput = z.infer<typeof updateImageSchema>;

/**
 * Complete image response schema
 */
export const imageDetailResponseSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  fileUrl: z.string(),
  thumbnailUrl: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  fileSize: z.number(),
  mimeType: z.string(),
  description: z.string().nullable(),
  isFavorite: z.boolean(),
  favoritedAt: z.string().nullable(),
  takenAt: z.string().nullable(),
  uploadedAt: z.string(),
  updatedAt: z.string(),
  album: z.object({
    id: z.string(),
    title: z.string(),
    year: z.number(),
  }).nullable(),
  tags: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: tagCategorySchema,
  })),
  exif: exifDataSchema.nullable(),
});

export type ImageDetailResponse = z.infer<typeof imageDetailResponseSchema>;

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

/**
 * Generic pagination info schema
 */
export const cursorPaginationSchema = z.object({
  cursor: z.string().nullable(),
  hasMore: z.boolean(),
  limit: z.number(),
});

export const offsetPaginationSchema = z.object({
  offset: z.number(),
  limit: z.number(),
  total: z.number(),
  hasMore: z.boolean(),
});

/**
 * Generic API success response schema factory
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z.object({
      timestamp: z.string(),
      requestId: z.string(),
    }),
    pagination: z.union([cursorPaginationSchema, offsetPaginationSchema]).optional(),
  });
}

/**
 * API error response schema
 */
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.unknown()).optional(),
    path: z.string().optional(),
  }),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string(),
  }),
});

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate and parse request body
 */
export function validateBody<T extends z.ZodTypeAny>(
  schema: T,
  body: unknown
): z.infer<T> {
  return schema.parse(body);
}

/**
 * Validate and parse query parameters
 */
export function validateQuery<T extends z.ZodTypeAny>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string | string[]> = {};

  searchParams.forEach((value, key) => {
    if (params[key]) {
      // Handle multiple values for same key
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  });

  return schema.parse(params);
}

/**
 * Safe validation that returns result object
 */
export function safeValidate<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

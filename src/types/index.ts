// Tipos compartidos para las respuestas de la API consumidas en el cliente.

export interface AlbumImage {
  id: string;
  fileUrl: string;
  thumbnailUrl: string;
  originalName: string;
  description: string | null;
  width: number;
  height: number;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  blurDataUrl: string | null;
}

export interface AlbumSummary {
  id: string;
  year: number;
  title: string;
  description: string | null;
  subAlbum: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  coverImageUrl?: string | null;
  coverFocalPoint?: string | null;
  eventDate?: string | null;
  imageCount?: number;
}

export interface ImageDetail extends AlbumImage {
  album?: AlbumSummary | null;
}

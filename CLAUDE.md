# Album Fotos - Guía del proyecto

## Stack

- **Next.js 15.5.3** con App Router, React 19
- **Prisma 6** + **PostgreSQL 15** (volumen Docker `postgres_data`)
- **Sharp** para procesamiento de imágenes y thumbnails
- **Tailwind CSS 4**
- **Docker** (app + postgres via `docker-compose.yml`)

## Comandos clave

```bash
# Levantar todo (rebuild si hay cambios en Dockerfile o deps)
docker compose up --build -d

# Ver logs
docker compose logs -f app

# Detener
docker compose down

# Seed inicial de la BD
npm run db:seed

# Generar thumbnails de todas las imágenes en /public/uploads/
npm run generate-thumbnails

# Corregir orientación EXIF de imágenes originales
npm run fix-orientation

# Corregir dimensiones en BD desde thumbnails (fuente de verdad)
DATABASE_URL="postgresql://postgres:password@localhost:5432/album_fotos?schema=public" npm run fix-db-dimensions

# Generar blur placeholders
npm run generate-blur
```

## Arquitectura

- **Uploads**: `/public/uploads/` (volumen Docker `uploads_data`)
- **Thumbnails**: `/public/thumbnails/` (volumen Docker `thumbnails_data`)
- **BD**: volumen Docker `postgres_data`, puerto 5432 expuesto al host
- **DATABASE_URL interna** (dentro de Docker): `postgresql://postgres:password@postgres:5432/album_fotos`
- **DATABASE_URL externa** (scripts locales): `postgresql://postgres:password@localhost:5432/album_fotos`

## Convención de thumbnails

- Ancho máximo: **400px**, preservando aspect ratio
- Calidad WebP: **70**
- Formato: siempre `.webp`
- Función `sharp().rotate()` aplica corrección EXIF automáticamente
- Las dimensiones en la BD (`width`, `height`) deben coincidir con las del thumbnail (post-EXIF)

## Masonry layout

El masonry CSS Grid usa `image.width` e `image.height` de la BD para decidir si una foto es
portrait (`height > width`) o landscape. Si esos valores están invertidos (dimensiones crudas
del sensor sin corregir EXIF), todas las fotos aparecen como landscape.

Fuente de verdad para las dimensiones: el thumbnail `.webp` generado con `sharp().rotate()`.
Para re-sincronizar BD con thumbnails: `npm run fix-db-dimensions`.

## Reglas de commits

- Mensajes en **español**
- No mencionar Claude ni herramientas de IA
- Prefijos: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`

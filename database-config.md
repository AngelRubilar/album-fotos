# Configuración de Base de Datos

## Variables de Entorno Necesarias

Crea un archivo `.env` en la raíz del proyecto con:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/album_fotos?schema=public"

# Next.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Opciones de Base de Datos

### 1. PostgreSQL Local
```bash
# Instalar PostgreSQL
# Windows: https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Crear base de datos
createdb album_fotos
```

### 2. PostgreSQL en Docker
```bash
docker run --name postgres-album -e POSTGRES_PASSWORD=password -e POSTGRES_DB=album_fotos -p 5432:5432 -d postgres:15
```

### 3. Base de Datos en la Nube
- **Supabase** (gratis): https://supabase.com
- **Neon** (gratis): https://neon.tech
- **Railway** (gratis): https://railway.app

## Comandos Prisma

```bash
# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name init

# Ver base de datos
npx prisma studio
```

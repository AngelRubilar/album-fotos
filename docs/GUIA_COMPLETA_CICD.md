# 🚀 Guía Completa CI/CD - Album de Fotos

## Índice
1. [Introducción](#introducción)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Ambientes](#ambientes)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Configuración Inicial](#configuración-inicial)
6. [Uso Diario](#uso-diario)
7. [Troubleshooting](#troubleshooting)
8. [Rollback y Recuperación](#rollback-y-recuperación)

---

## 📖 Introducción

Este documento describe el sistema de integración y despliegue continuo (CI/CD) para la aplicación **Album de Fotos**.

### ¿Qué es CI/CD?

**CI/CD** (Continuous Integration/Continuous Deployment) es una práctica moderna de desarrollo que automatiza el proceso de llevar código desde tu computadora hasta producción.

**Beneficios:**
- ✅ Deploy automático sin intervención manual
- ✅ Menos errores humanos
- ✅ Testing automático antes de producción
- ✅ Rollback rápido si algo falla
- ✅ Historial completo de versiones

### Sistema Implementado

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│              │      │              │      │              │
│  Desarrollo  │ ───> │   Staging    │ ───> │  Production  │
│              │      │              │      │              │
│  Tu PC       │      │ Servidor:    │      │ Servidor:    │
│              │      │ Puerto 3002  │      │ Puerto 3000  │
└──────────────┘      └──────────────┘      └──────────────┘
     │                      │                      │
     │                      │                      │
     └──────────────────────┴──────────────────────┘
                    │
                    v
            GitHub Container
                Registry
           (Imágenes Docker)
```

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **GitHub Repository**
   - Almacena el código fuente
   - URL: https://github.com/AngelRubilar/album-fotos
   - Ramas: `staging`, `main`

2. **GitHub Actions**
   - Sistema de CI/CD gratuito de GitHub
   - Ejecuta workflows automáticos
   - Build y deploy sin intervención

3. **GitHub Container Registry (GHCR)**
   - Almacena imágenes Docker
   - URL: ghcr.io/angelrubilar/album-fotos
   - Gratis para repos públicos

4. **Servidor (192.168.88.220)**
   - Ubuntu 24.04.3 LTS
   - Docker instalado
   - 2 ambientes: staging + production

### Tecnologías Utilizadas

- **Next.js 15** - Framework de React
- **PostgreSQL 15** - Base de datos
- **Docker** - Containerización
- **GitHub Actions** - CI/CD
- **GHCR** - Registro de imágenes

---

## 🌍 Ambientes

### 1. STAGING (Pre-producción)

**Propósito:** Testing y validación antes de producción

```yaml
Rama: staging
Puerto: 3002
URL Local: http://192.168.88.220:3002
URL Remota: http://100.69.79.30:3002
Base de Datos: album_fotos_staging
Deploy: Automático al push
Datos: Datos de prueba (20 fotos sample)
```

**Características:**
- ✅ Deploy automático sin aprobación
- ✅ Ambiente de pruebas seguro
- ✅ No afecta a producción
- ✅ Datos separados de producción

**Cuándo usar:**
- Probar nuevas features
- Testing de bugs fixes
- Validar cambios antes de producción
- Experimentos

### 2. PRODUCTION (Producción)

**Propósito:** Ambiente real con usuarios y datos reales

```yaml
Rama: main
Puerto: 3000
URL Local: http://192.168.88.220:3000
URL Remota: http://100.69.79.30:3000
Base de Datos: album_fotos_production
Deploy: Manual con aprobación requerida
Datos: Datos reales (585 fotos)
```

**Características:**
- ⚠️ Deploy requiere aprobación manual
- ✅ Máxima estabilidad
- ✅ Datos reales protegidos
- ✅ Backups automáticos

**Cuándo usar:**
- Después de probar en staging
- Solo código completamente validado
- Con aprobación explícita

---

## 🔄 Flujo de Trabajo

### Flujo Completo

```
1. DESARROLLO
   ├─ Creas branch feature/nueva-funcionalidad
   ├─ Haces cambios en tu PC
   ├─ Commit local: git commit -m "Add: nueva funcionalidad"
   └─ Push a GitHub: git push origin feature/nueva-funcionalidad

2. PULL REQUEST A STAGING
   ├─ Creas PR en GitHub: feature/nueva-funcionalidad → staging
   ├─ GitHub Actions ejecuta tests (automático)
   ├─ Si tests pasan, haces merge
   └─ GitHub Actions despliega a STAGING (automático)

3. TESTING EN STAGING
   ├─ Accedes a http://192.168.88.220:3002
   ├─ Pruebas la funcionalidad
   ├─ Si algo falla → vuelves al paso 1
   └─ Si todo OK → continúas al paso 4

4. PULL REQUEST A PRODUCTION
   ├─ Creas PR en GitHub: staging → main
   ├─ GitHub Actions ejecuta tests (automático)
   ├─ Si tests pasan, haces merge
   ├─ GitHub Actions espera tu aprobación
   ├─ TÚ APRUEBAS el deploy manualmente
   └─ GitHub Actions despliega a PRODUCTION

5. PRODUCTION LIVE
   ├─ Usuarios acceden a http://192.168.88.220:3000
   ├─ Monitoreas logs
   └─ Todo funcionando ✅
```

### Ejemplo Práctico

**Caso: Quieres agregar un nuevo tema de colores**

```bash
# 1. Crear branch
git checkout -b feature/tema-morado
git checkout staging  # asegúrate de partir desde staging

# 2. Hacer cambios
# ... editas código en VS Code ...

# 3. Commit
git add src/styles/themes.ts
git commit -m "Add: tema morado con gradientes personalizados"

# 4. Push
git push origin feature/tema-morado

# 5. En GitHub: Crear Pull Request
#    feature/tema-morado → staging
#    Título: "Agregar tema morado"
#    Descripción: "Nuevo tema con colores morados y gradientes"

# 6. GitHub Actions automáticamente:
#    - Ejecuta tests
#    - Build de la aplicación
#    - Publica imagen en GHCR
#    - Despliega a STAGING

# 7. Pruebas en staging
#    http://192.168.88.220:3002
#    ✅ Verificas que el tema se ve bien

# 8. Si todo OK, crear PR a main
#    staging → main
#    GitHub Actions construye pero espera aprobación

# 9. En GitHub: Environment "production"
#    Botón "Review deployments" → "Approve and deploy"

# 10. GitHub Actions despliega a PRODUCTION
#     http://192.168.88.220:3000
#     ✅ Tema morado disponible para todos
```

---

## ⚙️ Configuración Inicial

### Prerequisitos

- ✅ Cuenta de GitHub
- ✅ Repositorio público: https://github.com/AngelRubilar/album-fotos
- ✅ Acceso SSH al servidor
- ✅ Docker instalado en servidor

### Paso 1: Configurar GitHub Secrets

Los secrets son variables confidenciales que GitHub Actions necesita para conectarse a tu servidor.

**1.1. Ve a tu repositorio en GitHub:**
```
https://github.com/AngelRubilar/album-fotos/settings/secrets/actions
```

**1.2. Haz clic en "New repository secret"**

**1.3. Crea estos secrets:**

| Name | Value | Descripción |
|------|-------|-------------|
| `SERVER_HOST` | `192.168.88.220` | IP del servidor |
| `SERVER_USER` | `morena` | Usuario SSH |
| `SERVER_SSH_KEY` | `<contenido de id_ed25519>` | Llave SSH privada |
| `GHCR_TOKEN` | `<tu_github_token>` | Token para GHCR |

**1.4. Para obtener el contenido de SSH_KEY:**

```bash
# En tu PC, abre PowerShell:
Get-Content "C:\Users\angel\OneDrive\Desktop\llaves\id_ed25519"

# Copia TODO el contenido (incluyendo -----BEGIN y -----END)
# Pégalo en el secret SERVER_SSH_KEY
```

**1.5. Para crear GHCR_TOKEN:**

```
1. Ve a: https://github.com/settings/tokens
2. "Generate new token" → "Generate new token (classic)"
3. Note: "GHCR Access for CI/CD"
4. Expiration: No expiration (o 1 año)
5. Selecciona permisos:
   ☑️ write:packages
   ☑️ read:packages
   ☑️ delete:packages
6. "Generate token"
7. COPIA el token (solo se muestra una vez)
8. Pégalo en el secret GHCR_TOKEN
```

### Paso 2: Configurar Ambientes en GitHub

**2.1. Ve a:**
```
https://github.com/AngelRubilar/album-fotos/settings/environments
```

**2.2. Crear ambiente "staging":**
```
1. Clic en "New environment"
2. Name: staging
3. NO marcar "Required reviewers"
4. NO marcar "Wait timer"
5. Save protection rules
```

**2.3. Crear ambiente "production":**
```
1. Clic en "New environment"
2. Name: production
3. ✅ MARCAR "Required reviewers"
4. Agregar tu usuario como reviewer
5. Wait timer: 0 minutos
6. Save protection rules
```

### Paso 3: Configurar Ramas

**3.1. Crear rama staging:**

```bash
# En tu PC:
git checkout -b staging
git push origin staging
```

**3.2. Configurar branch protection:**

```
Ve a: https://github.com/AngelRubilar/album-fotos/settings/branches

Para rama "main":
1. "Add rule"
2. Branch name pattern: main
3. ✅ Require pull request before merging
4. ✅ Require status checks to pass
5. Save changes

Para rama "staging":
1. "Add rule"
2. Branch name pattern: staging
3. ✅ Require pull request before merging
4. Save changes
```

---

## 💼 Uso Diario

### Comandos Comunes

```bash
# Ver estado actual
git status

# Ver en qué rama estás
git branch

# Cambiar a staging
git checkout staging

# Crear nueva feature
git checkout -b feature/nombre-descriptivo

# Ver cambios
git diff

# Agregar cambios
git add .
# o específico:
git add src/components/Album.tsx

# Commit
git commit -m "tipo: descripción corta"

# Tipos de commit recomendados:
# Add: nueva funcionalidad
# Fix: corrección de bug
# Update: mejora de funcionalidad existente
# Remove: eliminación de código
# Refactor: refactorización sin cambios funcionales
# Docs: solo documentación
# Style: cambios de formato/estilo

# Push
git push origin nombre-branch

# Actualizar rama local
git pull origin staging
```

### Workflow del Día a Día

**Lunes: Nueva funcionalidad**
```bash
git checkout staging
git pull origin staging
git checkout -b feature/filtro-por-fecha
# ... haces cambios ...
git add .
git commit -m "Add: filtro de fotos por rango de fechas"
git push origin feature/filtro-por-fecha
# En GitHub: PR a staging → merge → auto-deploy
# Pruebas en staging
```

**Martes: Bug fix urgente**
```bash
git checkout staging
git pull origin staging
git checkout -b fix/error-carga-imagenes
# ... corriges el bug ...
git add .
git commit -m "Fix: error al cargar imágenes grandes"
git push origin fix/error-carga-imagenes
# PR a staging → merge → auto-deploy
# Verificas fix en staging
# PR a main → apruebas → deploy a production
```

**Miércoles: Mejora de performance**
```bash
git checkout staging
git checkout -b refactor/optimizar-miniaturas
# ... optimizas código ...
git commit -m "Refactor: mejorar generación de thumbnails"
git push origin refactor/optimizar-miniaturas
# Testing en staging
```

---

## 🔍 Monitoreo y Logs

### Ver Estado de Deployments

**En GitHub:**
```
1. Ve a tu repositorio
2. Pestaña "Actions"
3. Lista de workflows ejecutados
4. Verde ✅ = Éxito
   Rojo ❌ = Falló
   Amarillo ⏳ = En progreso
```

### Ver Logs de GitHub Actions

```
1. Actions tab
2. Clic en el workflow específico
3. Clic en el job (ej: "deploy-staging")
4. Expande cada step para ver output detallado
```

### Ver Logs en Servidor

```bash
# Conectarte al servidor
ssh -i "C:\Users\angel\OneDrive\Desktop\llaves\id_ed25519" morena@192.168.88.220

# Ver logs de staging
docker logs album-fotos-staging-app --tail 50 -f

# Ver logs de production
docker logs album-fotos-production-app --tail 50 -f

# Ver logs de base de datos staging
docker logs album-fotos-staging-postgres --tail 50

# Ver logs de base de datos production
docker logs album-fotos-production-postgres --tail 50

# Ver estado de contenedores
docker ps | grep album
```

---

## 🐛 Troubleshooting

### Problema: Build falla en GitHub Actions

**Síntomas:**
- Workflow muestra ❌ rojo
- Error en step "Build Docker image"

**Solución:**
```
1. Ve a Actions → workflow fallido
2. Lee el error en los logs
3. Errores comunes:
   - TypeScript errors → revisa tipos en tu código
   - Dependency errors → verifica package.json
   - Build errors → prueba `npm run build` localmente
4. Corrige localmente
5. Commit y push de nuevo
```

### Problema: Deploy se queda esperando

**Síntomas:**
- Workflow amarillo ⏳
- Step "Deploy" no completa

**Solución:**
```
1. Verifica que el servidor esté encendido
2. Prueba conexión SSH:
   ssh -i "ruta\llave" morena@192.168.88.220
3. Verifica que Docker esté corriendo:
   docker ps
4. Re-run el workflow en GitHub Actions
```

### Problema: Aplicación no responde después de deploy

**Síntomas:**
- Deploy exitoso ✅
- Pero http://IP:3000 no carga

**Solución:**
```bash
# Conectarte al servidor
ssh -i "ruta\llave" morena@192.168.88.220

# Ver estado de contenedores
docker ps | grep album

# Ver logs del contenedor
docker logs album-fotos-production-app --tail 100

# Reiniciar contenedor si es necesario
docker restart album-fotos-production-app

# Verificar puertos
netstat -tlnp | grep 3000
```

### Problema: Base de datos no conecta

**Síntomas:**
- Error: "Can't reach database server"

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker ps | grep postgres

# Ver logs de PostgreSQL
docker logs album-fotos-production-postgres

# Reiniciar PostgreSQL
docker restart album-fotos-production-postgres

# Verificar variables de entorno
docker exec album-fotos-production-app env | grep DATABASE_URL
```

---

## ⏪ Rollback y Recuperación

### Rollback Rápido (volver a versión anterior)

**Método 1: Desde GitHub Actions (recomendado)**

```
1. Ve a Actions tab
2. Encuentra el workflow exitoso anterior
3. Clic en "Re-run all jobs"
4. Approve si es production
5. Deploy de versión anterior completo
```

**Método 2: Revertir commit**

```bash
# Ver historial de commits
git log --oneline

# Revertir el último commit
git revert HEAD
git push origin main

# O revertir commit específico
git revert abc1234
git push origin main

# GitHub Actions desplegará automáticamente
```

**Método 3: Rollback manual en servidor**

```bash
# Conectar al servidor
ssh -i "ruta\llave" morena@192.168.88.220

# Ver imágenes disponibles
docker images | grep album-fotos

# Detener contenedor actual
docker stop album-fotos-production-app
docker rm album-fotos-production-app

# Usar imagen anterior (ejemplo: v1.2.0 en vez de v1.2.1)
docker run -d \
  --name album-fotos-production-app \
  --network album-fotos-production \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@album-fotos-production-postgres:5432/album_fotos_production" \
  -v /home/morena/album-fotos-deploy/production/uploads:/app/public/uploads \
  ghcr.io/angelrubilar/album-fotos:v1.2.0
```

### Recuperación de Desastres

**Si todo falla completamente:**

```bash
# 1. Restaurar desde backup
ssh -i "ruta\llave" morena@192.168.88.220

# 2. Ver backups disponibles
ls -lh /home/morena/backups/

# 3. Restaurar base de datos
docker exec -i album-fotos-production-postgres psql -U postgres album_fotos_production < /home/morena/backups/album-fotos-migration-20260115/database_backup.sql

# 4. Restaurar fotos
cp -r /home/morena/backups/album-fotos-migration-20260115/uploads/* \
      /home/morena/album-fotos-deploy/production/uploads/

# 5. Reiniciar aplicación
docker restart album-fotos-production-app
```

---

## 📊 Mejores Prácticas

### DO's ✅

- ✅ Siempre probar en staging primero
- ✅ Hacer commits pequeños y frecuentes
- ✅ Escribir mensajes de commit descriptivos
- ✅ Revisar logs después de cada deploy
- ✅ Mantener staging actualizado con main
- ✅ Hacer backups antes de cambios grandes

### DON'Ts ❌

- ❌ Nunca hacer push directo a main (usar PR)
- ❌ Nunca saltarte staging para producción
- ❌ Nunca commitear archivos .env
- ❌ Nunca modificar base de datos production manualmente
- ❌ Nunca ignorar errores en staging
- ❌ Nunca deployar sin probar localmente primero

---

## 📞 Soporte

### Recursos Adicionales

- **Documentación GitHub Actions:** https://docs.github.com/en/actions
- **Documentación Docker:** https://docs.docker.com/
- **Documentación Next.js:** https://nextjs.org/docs

### Archivos de Configuración

Todos los archivos están en:
- `C:\Users\angel\Desktop\` (documentación)
- `C:\Users\angel\OneDrive\Documentos\Proyectitos\Album de fotos\` (código)
- Servidor: `/home/morena/album-fotos-deploy/` (datos)

---

## 🎓 Glosario

**CI/CD:** Continuous Integration/Continuous Deployment - Automatización de build y deploy

**GitHub Actions:** Sistema de CI/CD integrado en GitHub

**GHCR:** GitHub Container Registry - Almacén de imágenes Docker

**Docker:** Plataforma de containerización

**Container:** Aplicación empaquetada con todas sus dependencias

**Image:** Template de un container

**Staging:** Ambiente de pre-producción para testing

**Production:** Ambiente real con usuarios

**Branch:** Rama de código en Git

**PR (Pull Request):** Solicitud para fusionar código entre ramas

**Merge:** Fusionar código de una rama a otra

**Commit:** Punto de guardado en Git

**Push:** Enviar commits a GitHub

**Pull:** Traer commits desde GitHub

**Rollback:** Volver a versión anterior

**Deployment:** Proceso de llevar código a un servidor

---

**Fecha de creación:** 15 de Enero 2026
**Versión:** 1.0
**Autor:** Sistema CI/CD Album de Fotos

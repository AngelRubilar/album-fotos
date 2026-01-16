# 📚 Guía Completa: Despliegue de Aplicaciones en CasaOS

**Fecha:** 14 de Enero, 2026
**Autor:** Documentación basada en experiencia real con Album de Fotos
**Versión:** 1.0

---

## 📖 Tabla de Contenidos

1. [Introducción a CasaOS](#introducción-a-casaos)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Formato del docker-compose.yml](#formato-del-docker-composeyml)
4. [Metadatos x-casaos](#metadatos-x-casaos)
5. [Proceso de Instalación](#proceso-de-instalación)
6. [Ejemplo Completo](#ejemplo-completo)
7. [Troubleshooting](#troubleshooting)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 🎯 Introducción a CasaOS

CasaOS es un sistema operativo basado en Linux diseñado para servidores caseros. Proporciona una interfaz web para gestionar contenedores Docker de forma visual.

### Características Clave:
- ✅ Interfaz web intuitiva
- ✅ Gestión visual de contenedores Docker
- ✅ App Store integrado
- ✅ Gestión de volúmenes y redes
- ✅ Monitoreo de recursos en tiempo real

---

## 📁 Estructura de Archivos

### Ubicación de Aplicaciones en CasaOS:

```
/var/lib/casaos/apps/
├── nombre-app-1/
│   └── docker-compose.yml
├── nombre-app-2/
│   └── docker-compose.yml
└── nombre-app-3/
    └── docker-compose.yml
```

### Estructura Típica de una App:

```
/var/lib/casaos/apps/mi-aplicacion/
├── docker-compose.yml          # Archivo PRINCIPAL requerido
├── .env (opcional)             # Variables de entorno
└── data/ (opcional)            # Datos persistentes
```

---

## 🐳 Formato del docker-compose.yml

### Requisitos Mínimos:

```yaml
name: nombre-aplicacion

services:
  app:
    image: imagen-docker:tag
    container_name: nombre-contenedor
    restart: unless-stopped
    network_mode: bridge
    ports:
      - target: 3000
        published: 3000
        protocol: tcp
    environment:
      ENV_VAR: valor
    volumes:
      - type: bind
        source: /ruta/host
        target: /ruta/contenedor
    x-casaos:
      # Metadatos del servicio (ver sección siguiente)

x-casaos:
  # Metadatos de la aplicación (ver sección siguiente)
```

### Elementos Importantes:

#### 1. **Nombre del Servicio Principal**
```yaml
name: mi-aplicacion  # Debe ser único en el sistema
```

#### 2. **Network Mode**
```yaml
network_mode: bridge  # CasaOS prefiere bridge mode
```

#### 3. **Puertos**
```yaml
ports:
  - target: 3000      # Puerto dentro del contenedor
    published: 3000   # Puerto expuesto en el host
    protocol: tcp     # tcp o udp
```

#### 4. **Volúmenes**
```yaml
volumes:
  # Bind mount (archivos del host)
  - type: bind
    source: /ruta/en/host
    target: /ruta/en/contenedor

  # Volume nombrado (gestionado por Docker)
  - type: volume
    source: nombre-volumen
    target: /ruta/en/contenedor
```

---

## 🏷️ Metadatos x-casaos

### Sección x-casaos a Nivel de Aplicación:

Esta sección va **al final del archivo**, al mismo nivel que `services:` y `volumes:`

```yaml
x-casaos:
  # Arquitecturas soportadas
  architectures:
    - amd64
    - arm64

  # Servicio principal (debe coincidir con el nombre del servicio)
  main: app

  # Información básica
  author: Tu Nombre
  category: Media  # Categories: Media, Tools, Utilities, etc.
  developer: Nombre del Desarrollador

  # Textos descriptivos
  title:
    en_us: Nombre de la Aplicación
  description:
    en_us: Descripción detallada de tu aplicación
  tagline:
    en_us: Frase corta descriptiva

  # Visuales
  icon: https://url-del-icono.png
  thumbnail: https://url-del-thumbnail.png

  # Configuración de acceso web
  port_map: "3000"      # Puerto principal de la web UI
  scheme: http          # http o https
  hostname: ""          # Dejar vacío para usar IP del servidor
  index: /              # Ruta de inicio (normalmente /)

  # ID único de la app
  store_app_id: nombre-app-unico

  # Consejos para el usuario
  tips:
    before_install:
      en_us: |
        Información importante antes de instalar.
        Puede ser multi-línea.
```

### Sección x-casaos a Nivel de Servicio:

Esta sección va **dentro de cada servicio**, al mismo nivel que `image:`, `ports:`, etc.

```yaml
services:
  app:
    image: mi-imagen
    # ... otras configuraciones ...
    x-casaos:
      # Descripción de variables de entorno
      envs:
        - container: NOMBRE_VARIABLE
          description:
            en_us: Descripción de la variable

      # Descripción de puertos
      ports:
        - container: "3000"
          description:
            en_us: Puerto de la interfaz web
          protocol: tcp

      # Descripción de volúmenes
      volumes:
        - container: /app/data
          description:
            en_us: Directorio de datos de la aplicación
```

---

## 🚀 Proceso de Instalación

### Método 1: Instalación Manual (Recomendado)

#### Paso 1: Crear la estructura
```bash
sudo mkdir -p /var/lib/casaos/apps/mi-aplicacion
```

#### Paso 2: Crear el docker-compose.yml
```bash
sudo nano /var/lib/casaos/apps/mi-aplicacion/docker-compose.yml
# Pega tu configuración aquí
```

#### Paso 3: Reiniciar CasaOS
```bash
sudo systemctl restart casaos
```

#### Paso 4: Iniciar los contenedores
```bash
cd /var/lib/casaos/apps/mi-aplicacion
sudo docker compose up -d
```

#### Paso 5: Verificar en CasaOS
1. Abre CasaOS en el navegador
2. Refresca con `Ctrl + F5`
3. Busca tu aplicación en el dashboard

### Método 2: Importación desde la Interfaz

1. Guarda tu `docker-compose.yml` en el servidor
2. En CasaOS, ve a "Apps" → "Import"
3. Selecciona el archivo
4. CasaOS lo procesará automáticamente

---

## 💡 Ejemplo Completo

### Aplicación: Album de Fotos

```yaml
name: album-fotos

services:
  # Servicio de la aplicación
  app:
    image: album-fotos-app:latest
    container_name: album-fotos-app
    restart: unless-stopped
    network_mode: bridge
    ports:
      - target: 3000
        published: 3000
        protocol: tcp
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@album-fotos-postgres:5432/album_fotos
      PORT: "3000"
      HOSTNAME: 0.0.0.0
    volumes:
      - type: bind
        source: /home/usuario/album-fotos/public/uploads
        target: /app/public/uploads
      - type: bind
        source: /home/usuario/album-fotos/public/thumbnails
        target: /app/public/thumbnails
      - type: bind
        source: /home/usuario/album-fotos/data
        target: /app/data
    depends_on:
      - postgres
    x-casaos:
      envs:
        - container: NODE_ENV
          description:
            en_us: Node Environment (production/development)
        - container: DATABASE_URL
          description:
            en_us: PostgreSQL Connection String
      ports:
        - container: "3000"
          description:
            en_us: Web UI Port
          protocol: tcp
      volumes:
        - container: /app/public/uploads
          description:
            en_us: Uploaded Images Directory
        - container: /app/public/thumbnails
          description:
            en_us: Image Thumbnails Directory
        - container: /app/data
          description:
            en_us: Application Data

  # Servicio de base de datos
  postgres:
    image: postgres:15-alpine
    container_name: album-fotos-postgres
    restart: unless-stopped
    network_mode: bridge
    ports:
      - target: 5432
        published: 5432
        protocol: tcp
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: album_fotos
    volumes:
      - type: volume
        source: album-fotos_postgres_data
        target: /var/lib/postgresql/data
      - type: bind
        source: /home/usuario/album-fotos/backups
        target: /backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

# Volúmenes
volumes:
  album-fotos_postgres_data:
    external: true  # Usar volumen existente

# Metadatos de CasaOS
x-casaos:
  architectures:
    - amd64
    - arm64
  main: app
  author: Custom
  category: Media
  description:
    en_us: Album de Fotos - Your personal photo gallery organized by years. Manage your memories with a modern and intuitive interface.
  developer: Custom
  icon: https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/photoprism.png
  tagline:
    en_us: Modern photo gallery with Next.js
  thumbnail: https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/photoprism.png
  title:
    en_us: Album de Fotos
  port_map: "3000"
  scheme: http
  hostname: ""
  index: /
  store_app_id: album-fotos-custom
  tips:
    before_install:
      en_us: |
        Album de Fotos application with Next.js and PostgreSQL.
        Make sure PostgreSQL is running before starting the app.
        Access at: http://YOUR-SERVER-IP:3000
```

---

## 🔧 Troubleshooting

### Problema 1: La aplicación no aparece en CasaOS

**Síntomas:**
- El archivo está en `/var/lib/casaos/apps/` pero no aparece en el dashboard

**Soluciones:**
```bash
# 1. Verificar que el archivo existe
ls -la /var/lib/casaos/apps/mi-aplicacion/

# 2. Verificar permisos
sudo chown -R root:root /var/lib/casaos/apps/mi-aplicacion/

# 3. Reiniciar CasaOS
sudo systemctl restart casaos

# 4. Verificar logs de CasaOS
sudo journalctl -u casaos -f
```

### Problema 2: Los campos aparecen en blanco

**Causa:** La aplicación fue instalada fuera de CasaOS (con `docker compose` directo)

**Solución:**
1. Detener contenedores: `docker compose down`
2. Copiar `docker-compose.yml` a `/var/lib/casaos/apps/nombre-app/`
3. Reiniciar CasaOS: `sudo systemctl restart casaos`
4. Iniciar desde `/var/lib/casaos/apps/nombre-app/`: `sudo docker compose up -d`

### Problema 3: El botón de acceso no funciona

**Causa:** Falta configuración de `port_map`, `scheme` o `index`

**Solución:**
Agregar en `x-casaos`:
```yaml
x-casaos:
  port_map: "3000"
  scheme: http
  hostname: ""
  index: /
```

### Problema 4: El icono no se muestra

**Causas comunes:**
- URL del icono inaccesible
- Formato incorrecto
- Cache del navegador

**Soluciones:**
```yaml
# Usar iconos de repositorios conocidos
icon: https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/nombre.png

# Alternativas
icon: https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/nombre.png
```

**Limpiar cache:**
- `Ctrl + F5` o `Ctrl + Shift + R`

---

## ✅ Mejores Prácticas

### 1. Nombrado de Aplicaciones

```yaml
# BIEN ✅
name: album-fotos
container_name: album-fotos-app

# MAL ❌
name: app
container_name: app1
```

**Regla:** Usa nombres descriptivos y únicos

### 2. Gestión de Datos

```yaml
# Para datos persistentes importantes
volumes:
  - type: volume
    source: mi-app_data
    target: /app/data

# Para archivos que quieres acceder desde el host
volumes:
  - type: bind
    source: /home/usuario/mi-app/uploads
    target: /app/uploads
```

**Regla:**
- `volume` para datos de aplicación
- `bind` para archivos que necesitas acceder directamente

### 3. Variables de Entorno Sensibles

```yaml
# NUNCA pongas contraseñas directamente
environment:
  DB_PASSWORD: password123  # ❌ MAL

# Usa archivos .env o secrets
env_file:
  - .env  # ✅ BIEN
```

### 4. Network Mode

```yaml
# Para CasaOS, usa bridge
network_mode: bridge  # ✅ BIEN

# Evita host mode a menos que sea necesario
network_mode: host    # ⚠️ Solo si es necesario
```

### 5. Health Checks

```yaml
# Siempre agrega health checks para bases de datos
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

### 6. Restart Policy

```yaml
# Para aplicaciones de producción
restart: unless-stopped  # ✅ RECOMENDADO

# Otras opciones
restart: always          # Reinicia siempre
restart: on-failure      # Solo si falla
restart: no              # No reinicia automáticamente
```

### 7. Dependencias entre Servicios

```yaml
services:
  app:
    depends_on:
      postgres:
        condition: service_healthy  # ✅ Espera que esté healthy
```

---

## 📚 Recursos Adicionales

### Iconos para Aplicaciones

**Dashboard Icons (Recomendado):**
```
https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/NOMBRE.png
```

**Buscar iconos:**
- https://github.com/walkxcode/dashboard-icons
- https://icon-icons.com/
- https://www.flaticon.com/

### Categorías de CasaOS

- `Media` - Aplicaciones multimedia (Plex, Jellyfin, etc.)
- `Tools` - Herramientas generales
- `Utilities` - Utilidades del sistema
- `Networking` - Aplicaciones de red
- `Cloud` - Almacenamiento en la nube
- `Development` - Herramientas de desarrollo
- `Games` - Juegos
- `Others` - Otras categorías

### Documentación Oficial

- **CasaOS:** https://casaos.io/
- **Docker Compose:** https://docs.docker.com/compose/
- **Compose Spec:** https://compose-spec.io/

---

## 📝 Checklist de Despliegue

Antes de desplegar una aplicación en CasaOS, verifica:

- [ ] El archivo `docker-compose.yml` está bien formateado
- [ ] El nombre de la aplicación es único
- [ ] Los puertos no están en conflicto con otras apps
- [ ] Los volúmenes están correctamente configurados
- [ ] Las variables de entorno sensibles están protegidas
- [ ] Los metadatos `x-casaos` están completos
- [ ] El icono es accesible desde el servidor
- [ ] `port_map`, `scheme`, y `index` están configurados
- [ ] Los health checks están implementados (si aplica)
- [ ] La aplicación tiene `restart: unless-stopped`

---

## 🎯 Ejemplo Rápido: Aplicación Simple

Para una aplicación web simple sin base de datos:

```yaml
name: mi-app-simple

services:
  app:
    image: mi-imagen:latest
    container_name: mi-app-simple
    restart: unless-stopped
    network_mode: bridge
    ports:
      - target: 8080
        published: 8080
        protocol: tcp
    volumes:
      - type: bind
        source: /home/usuario/mi-app/data
        target: /app/data
    x-casaos:
      ports:
        - container: "8080"
          description:
            en_us: Web UI
          protocol: tcp

x-casaos:
  architectures:
    - amd64
  main: app
  author: Tu Nombre
  category: Tools
  title:
    en_us: Mi App Simple
  description:
    en_us: Una aplicación web simple
  icon: https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/default.png
  port_map: "8080"
  scheme: http
  hostname: ""
  index: /
```

---

## 🔐 Seguridad

### Mejores Prácticas de Seguridad:

1. **No expongas puertos innecesariamente:**
```yaml
# Solo expone lo necesario
ports:
  - target: 3000
    published: 3000  # Solo el puerto de la web UI
```

2. **Usa volúmenes para datos sensibles:**
```yaml
# No uses bind mounts para datos críticos
volumes:
  - type: volume
    source: app_secrets
    target: /app/secrets
```

3. **Limita permisos:**
```yaml
# Ejecuta como usuario no-root cuando sea posible
user: "1000:1000"
```

4. **Actualiza imágenes regularmente:**
```bash
# Actualizar todas las imágenes
docker compose pull
docker compose up -d
```

---

## 📊 Comandos Útiles

### Gestión de Aplicaciones en CasaOS:

```bash
# Ver aplicaciones instaladas
ls -la /var/lib/casaos/apps/

# Ver logs de una aplicación
docker logs nombre-contenedor -f

# Reiniciar una aplicación
cd /var/lib/casaos/apps/nombre-app
sudo docker compose restart

# Ver estado de contenedores
docker ps --filter "name=nombre-app"

# Verificar uso de recursos
docker stats nombre-contenedor

# Ejecutar comando dentro del contenedor
docker exec -it nombre-contenedor bash

# Ver configuración actual
docker inspect nombre-contenedor
```

### Gestión de CasaOS:

```bash
# Reiniciar CasaOS
sudo systemctl restart casaos

# Ver logs de CasaOS
sudo journalctl -u casaos -f

# Estado de CasaOS
sudo systemctl status casaos

# Reiniciar servidor completo
sudo reboot
```

---

## 🎓 Conclusión

CasaOS simplifica enormemente la gestión de aplicaciones Docker en servidores caseros. La clave está en:

1. **Estructura correcta:** Archivos en `/var/lib/casaos/apps/`
2. **Metadatos completos:** Sección `x-casaos` bien configurada
3. **Network mode:** Usar `bridge`
4. **Reiniciar CasaOS:** Después de cambios importantes
5. **Verificar logs:** Si algo no funciona

Con esta guía, puedes desplegar cualquier aplicación en CasaOS y tenerla completamente integrada en el dashboard con su icono, configuración y acceso directo.

---

**Documentado por:** Claude Code
**Basado en:** Experiencia real desplegando "Album de Fotos" en CasaOS
**Servidor:** Ubuntu 24.04 con CasaOS
**Fecha:** 14 de Enero, 2026

---

## 📞 Referencias

- [CasaOS GitHub](https://github.com/IceWhaleTech/CasaOS)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Dashboard Icons Repository](https://github.com/walkxcode/dashboard-icons)

---

*Esta guía se actualizará con nuevas experiencias y mejores prácticas.*

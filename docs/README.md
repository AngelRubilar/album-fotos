# 📚 Documentación - Album de Fotos

Esta carpeta contiene toda la documentación del proyecto Album de Fotos.

---

## 📋 Índice de Documentos

### 1. [RESUMEN_DEPLOY_COMPLETO.md](./RESUMEN_DEPLOY_COMPLETO.md)
**Resumen completo del despliegue realizado**
- ✅ Todo lo logrado durante el deploy
- 🐛 Problemas encontrados y solucionados
- 🗂️ Estructura final del servidor
- 🚀 Comandos para deploy manual
- 📝 Próximos pasos opcionales

**Cuándo leer:** Cuando necesites recordar cómo se hizo el deploy o troubleshooting.

---

### 2. [GUIA_COMPLETA_CICD.md](./GUIA_COMPLETA_CICD.md)
**Guía completa del sistema de CI/CD**
- 📖 Introducción a CI/CD
- 🏗️ Arquitectura del sistema
- 🌍 Ambientes (staging/production)
- 🔄 Flujo de trabajo completo
- ⚙️ Configuración inicial
- 💼 Uso diario
- 🐛 Troubleshooting
- ⏪ Rollback y recuperación

**Cuándo leer:** Para entender cómo funciona el CI/CD o cuando necesites hacer cambios.

---

### 3. [GUIA_DESPLIEGUE_CASAOS.md](./GUIA_DESPLIEGUE_CASAOS.md)
**Guía para despliegue en CasaOS**
- 🎯 Introducción a CasaOS
- 📁 Estructura de archivos
- 🐳 Formato del docker-compose.yml
- 🏷️ Metadatos x-casaos
- 🚀 Proceso de instalación
- 💡 Ejemplos completos
- 🔧 Troubleshooting
- ✅ Mejores prácticas

**Cuándo leer:** Si quieres instalar la aplicación en CasaOS o crear tu propia app para CasaOS.

---

## 🎯 Guías Rápidas

### Deploy Manual Rápido

**Staging:**
```bash
ssh -i ruta/llave morena@192.168.88.220
cd /home/morena/album-fotos-deploy/staging
docker pull ghcr.io/angelrubilar/album-fotos:staging-latest
docker compose down && docker compose up -d
```

**Production:**
```bash
ssh -i ruta/llave morena@192.168.88.220
cd /home/morena/album-fotos-deploy/production
docker pull ghcr.io/angelrubilar/album-fotos:staging-latest
docker tag ghcr.io/angelrubilar/album-fotos:staging-latest ghcr.io/angelrubilar/album-fotos:production-latest
docker compose down && docker compose up -d
```

### Ver Logs

```bash
# Staging
docker logs album-fotos-staging-app -f

# Production
docker logs album-fotos-production-app -f
```

### Verificar Estado

```bash
# Ver todos los contenedores
docker ps | grep album

# Health checks
curl http://localhost:3002/api/health  # Staging
curl http://localhost:3000/api/health  # Production
```

---

## 🔗 URLs del Proyecto

- **GitHub:** https://github.com/AngelRubilar/album-fotos
- **GHCR:** https://github.com/AngelRubilar/album-fotos/pkgs/container/album-fotos
- **Staging:** http://192.168.88.220:3002
- **Production:** http://192.168.88.220:3000

---

## 📝 Notas Importantes

### Ambientes

**STAGING (Puerto 3002)**
- Para pruebas y desarrollo
- Base de datos vacía por defecto
- Deploy automático desde rama `staging`

**PRODUCTION (Puerto 3000)**
- Para usuarios finales
- 585 fotos y 13 álbumes
- Deploy manual con aprobación

### Archivos de Configuración

- `docker-compose.yml` - Para deploy en servidor Ubuntu
- `docker-compose.casaos.yml` - Para instalación en CasaOS
- `.github/workflows/staging.yml` - CI/CD para staging
- `.github/workflows/production.yml` - CI/CD para production

---

## 🆘 Ayuda y Soporte

Si tienes problemas:

1. **Revisa los logs:**
   ```bash
   docker logs album-fotos-production-app --tail 100
   ```

2. **Verifica el estado:**
   ```bash
   docker ps | grep album
   ```

3. **Consulta el troubleshooting:**
   - [GUIA_COMPLETA_CICD.md - Sección Troubleshooting](./GUIA_COMPLETA_CICD.md#-troubleshooting)
   - [RESUMEN_DEPLOY_COMPLETO.md - Problemas y Soluciones](./RESUMEN_DEPLOY_COMPLETO.md#-problemas-encontrados-y-solucionados)

---

**Última actualización:** 16 de Enero 2026

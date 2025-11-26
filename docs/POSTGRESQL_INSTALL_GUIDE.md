# Guía de Instalación de PostgreSQL en Windows

## 📥 Paso 1: Descargar PostgreSQL

1. Ve a: https://www.postgresql.org/download/windows/
2. Click en **"Download the installer"**
3. Selecciona la versión **PostgreSQL 16.x** (última estable)
4. Descarga el instalador para Windows x86-64

## 🔧 Paso 2: Instalar PostgreSQL

1. **Ejecuta el instalador** descargado (`postgresql-16.x-windows-x64.exe`)

2. **Installation Directory**: Deja la ruta por defecto
   ```
   C:\Program Files\PostgreSQL\16
   ```

3. **Select Components**: Marca todos (dejar por defecto)
   - ✅ PostgreSQL Server
   - ✅ pgAdmin 4 (interfaz gráfica)
   - ✅ Stack Builder
   - ✅ Command Line Tools

4. **Data Directory**: Deja por defecto
   ```
   C:\Program Files\PostgreSQL\16\data
   ```

5. **Password**:
   - Usuario por defecto: `postgres`
   - **IMPORTANTE**: Anota la contraseña que elijas
   - Recomendación: Usa algo simple para desarrollo local (ej: `postgres123`)

6. **Port**: Deja el puerto por defecto
   ```
   5432
   ```

7. **Locale**: Deja "Default locale"

8. Click **Next** y espera a que termine la instalación

## ✅ Paso 3: Verificar Instalación

Abre **PowerShell** o **CMD** y ejecuta:

```bash
psql --version
```

Deberías ver algo como:
```
psql (PostgreSQL) 16.x
```

## 🗄️ Paso 4: Crear Base de Datos para el Proyecto

Opción 1: **Usando pgAdmin 4** (Interfaz Gráfica)

1. Abre **pgAdmin 4** desde el menú de inicio
2. Conecta con la contraseña que configuraste
3. Click derecho en **Databases** → **Create** → **Database**
4. Nombre: `album_fotos`
5. Owner: `postgres`
6. Click **Save**

Opción 2: **Usando Command Line**

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE album_fotos;

# Verificar
\l

# Salir
\q
```

## 🔐 Paso 5: Datos de Conexión

Anota estos datos (los necesitarás para configurar Prisma):

```
Host: localhost
Port: 5432
Database: album_fotos
User: postgres
Password: [la que elegiste en el paso 2.5]
```

La **URL de conexión** será:
```
postgresql://postgres:[TU_PASSWORD]@localhost:5432/album_fotos
```

Ejemplo:
```
postgresql://postgres:postgres123@localhost:5432/album_fotos
```

## 🎯 Paso 6: Configurar Variable de Entorno (Opcional)

Para no exponer la contraseña en el código, crea un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://postgres:TU_PASSWORD@localhost:5432/album_fotos"
```

## 🔍 Verificación Final

Prueba la conexión:

```bash
psql -U postgres -d album_fotos
```

Si te pide contraseña y luego ves el prompt `album_fotos=#`, ¡todo está listo!

## 🛠️ Herramientas Útiles

### pgAdmin 4 (Ya instalado)
- Interfaz gráfica para administrar PostgreSQL
- Ver tablas, ejecutar queries, hacer backups

### DBeaver (Opcional - Alternativa más moderna)
- Descarga: https://dbeaver.io/download/
- Soporta múltiples bases de datos
- Interfaz más moderna que pgAdmin

## 🚨 Problemas Comunes

**Error: "psql no se reconoce como comando"**
- Agrega PostgreSQL al PATH:
  1. Busca "Variables de entorno" en Windows
  2. Edita la variable PATH
  3. Agrega: `C:\Program Files\PostgreSQL\16\bin`

**Error: "password authentication failed"**
- Verifica la contraseña
- Intenta resetear: https://stackoverflow.com/questions/12720967/how-to-change-postgresql-user-password

**Puerto 5432 ocupado**
- Otro servicio usa el puerto
- Cambia el puerto en la instalación o detén el otro servicio

## 📞 Siguiente Paso

Cuando termines la instalación, avísame y te proporcionaré:
1. La URL de conexión exacta
2. Configuración de Prisma
3. Scripts de migración

---

**¿Necesitas ayuda?** Si tienes problemas, envíame una captura de pantalla del error.

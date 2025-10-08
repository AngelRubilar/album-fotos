# 📸 Álbum de Fotos

Una aplicación moderna de gestión de álbumes fotográficos construida con Next.js, React y TypeScript.

## ✨ Características

### 🎨 Sistema de Temas
- **6 temas disponibles**: Claro, Oscuro, Cósmico, Océano, Atardecer, Bosque
- **Persistencia**: Los temas se guardan automáticamente
- **Transiciones suaves**: Cambios elegantes entre temas

### 📁 Navegación de 3 Niveles
1. **Vista Principal**: Años que contienen imágenes
2. **Vista de Año**: Álbumes y sub-álbumes del año seleccionado
3. **Vista de Álbum**: Galería de fotos específicas

### 🖼️ Previsualizaciones Inteligentes
- **Miniaturas adaptativas**: Layouts diferentes según cantidad de fotos
- **Placeholders coloridos**: Gradientes únicos para álbumes vacíos
- **Efectos hover**: Animaciones suaves y elegantes

### 📤 Gestión de Imágenes
- **Subida específica**: Seleccionar álbum antes de subir
- **Eliminación individual**: Borrar fotos específicas
- **Validación**: Verificación de álbumes y formatos

## 🚀 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd album-fotos

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Uso

### 1. Crear Álbumes
- Ve a **Administración** (`/admin`)
- Crea álbumes por año
- Agrega sub-álbumes para organizar mejor

### 2. Subir Fotos
- Ve a **Subir Fotos** (`/upload`)
- Selecciona el álbum de destino
- Arrastra o selecciona las imágenes
- Click en "Subir Fotos"

### 3. Explorar Álbumes
- **Vista Principal**: Click en un año
- **Vista de Año**: Click en un álbum
- **Vista de Álbum**: Ve las fotos individuales

### 4. Gestionar Fotos
- **Eliminar**: Click en el botón 🗑️ de cada foto
- **Subir más**: Click en "📸 Subir Fotos" en cada álbum

## 🎨 Temas Disponibles

### 🌞 Claro
- Fondo blanco con acentos azules
- Ideal para uso diurno

### 🌙 Oscuro
- Fondo oscuro con acentos azules
- Perfecto para uso nocturno

### 🌌 Cósmico
- Gradientes morados y púrpuras
- Tema futurista y elegante

### 🌊 Océano
- Tonos azules y cianes
- Sensación refrescante y calmante

### 🌅 Atardecer
- Colores naranjas y rojos
- Ambiente cálido y acogedor

### 🌲 Bosque
- Verdes naturales
- Conexión con la naturaleza

## 📁 Estructura del Proyecto

```
album-fotos/
├── src/
│   ├── app/                    # Páginas de Next.js
│   │   ├── admin/             # Panel de administración
│   │   ├── album/[year]/      # Vista de álbumes por año
│   │   ├── upload/            # Página de subida
│   │   └── api/               # API Routes
│   ├── components/            # Componentes React
│   ├── contexts/              # Contextos de React
│   └── lib/                   # Utilidades
├── public/                    # Archivos estáticos
│   ├── uploads/              # Imágenes subidas
│   └── thumbnails/           # Miniaturas
├── data/                     # Base de datos JSON
└── docs/                     # Documentación
```

## 🔧 API Endpoints

### Álbumes
- `GET /api/albums` - Listar todos los álbumes
- `POST /api/albums` - Crear nuevo álbum
- `GET /api/albums/year/[year]` - Álbumes de un año
- `GET /api/albums/[id]/images` - Imágenes de un álbum
- `DELETE /api/albums/[id]` - Eliminar álbum

### Imágenes
- `POST /api/upload` - Subir imágenes
- `DELETE /api/images/[id]` - Eliminar imagen

### Utilidades
- `GET /api/years` - Años con imágenes
- `POST /api/test-images` - Agregar imágenes de prueba

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm run dev      # Desarrollo
npm run build    # Construcción
npm run start    # Producción
npm run lint     # Linter
```

### Base de Datos
La aplicación usa archivos JSON para persistencia:
- `data/albums.json` - Datos de álbumes
- `data/images.json` - Datos de imágenes

### Agregar Nuevos Temas
1. Edita `src/contexts/ThemeContext.tsx`
2. Agrega el nuevo tema al objeto `themes`
3. Actualiza `src/components/ThemeSelector.tsx`

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Móvil**: 1 columna
- **Tablet**: 2 columnas  
- **Desktop**: 3-4 columnas

## 🔒 Seguridad

### Archivos Ignorados
- Imágenes subidas (`/public/uploads/`)
- Base de datos local (`/data/`)
- Archivos de configuración (`.env`)

### Validaciones
- Formatos de imagen permitidos: JPG, PNG, GIF, WebP
- Tamaño máximo: 10MB por archivo
- Verificación de álbumes antes de subir

## 🐛 Solución de Problemas

### Error: "Missing script: dev"
```bash
# Asegúrate de estar en el directorio correcto
cd album-fotos
npm run dev
```

### Error: "useTheme is on the client"
- Verifica que los componentes tengan `'use client';`

### Las imágenes no se muestran
- Verifica que las carpetas `public/uploads/` y `public/thumbnails/` existan
- Revisa los permisos de escritura

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Créditos

Desarrollado con ❤️ usando:
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**¿Tienes preguntas?** Abre un issue o contacta al desarrollador.
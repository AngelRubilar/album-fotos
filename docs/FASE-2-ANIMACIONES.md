# Fase 2: Animaciones con Framer Motion

## Resumen
Agregar animaciones fluidas y profesionales usando Framer Motion: transiciones de pagina, stagger en grids, gestos tactiles en la galeria, y micro-interacciones.

## Dependencia
- **Requiere**: Fase 1 completada (glassmorphism)
- **Instalar**: `npm install framer-motion`

---

## Paso 2.1: Instalar Framer Motion

```bash
npm install framer-motion
```

---

## Paso 2.2: Crear componente de animacion reutilizable

**Archivo nuevo**: `src/components/MotionWrap.tsx`

### Proposito
Wrapper reutilizable para animar la entrada de secciones y paginas.

```typescript
'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';

interface MotionWrapProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
}

// Fade up - para secciones individuales
export function FadeUp({ children, delay = 0, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade in - para elementos sutiles
export function FadeIn({ children, delay = 0, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger container - para grids
export function StaggerContainer({ children, ...props }: MotionWrapProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger item - hijo del StaggerContainer
export function StaggerItem({ children, ...props }: MotionWrapProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
```

---

## Paso 2.3: Animar Home (grid de años)

**Archivo**: `src/app/page.tsx`

### Cambios:
1. Importar los componentes de animacion
2. Reemplazar el grid estatico por StaggerContainer/StaggerItem
3. Eliminar las clases CSS `animate-fade-up` y `animationDelay` inline

```tsx
// Importar:
import { FadeUp, StaggerContainer, StaggerItem } from '@/components/MotionWrap';

// Header con FadeUp:
<FadeUp>
  <h1 className={...}>Bienvenido</h1>
  <p className={...}>Tus recuerdos organizados por momentos</p>
</FadeUp>

// Grid de cards con Stagger:
<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {years.map((yearData) => (
    <StaggerItem key={yearData.year}>
      <Link href={`/album/${yearData.year}`} className="group block">
        {/* ... card content sin animate-fade-up ni animationDelay ... */}
      </Link>
    </StaggerItem>
  ))}
</StaggerContainer>
```

---

## Paso 2.4: Animar Album Page (grid de sub-albums y fotos)

**Archivo**: `src/app/album/[year]/page.tsx`

### Cambios:
1. Misma estructura StaggerContainer/StaggerItem para album cards
2. Para el masonry, animar cada foto individualmente
3. Eliminar clases CSS `animate-fade-up` y `animationDelay`

```tsx
// Sub-album cards:
<StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
  {subAlbums.map((album) => (
    <StaggerItem key={album.id}>
      {/* card content */}
    </StaggerItem>
  ))}
</StaggerContainer>

// Fotos en masonry:
// Cada foto usa FadeIn con delay calculado
<div className="masonry">
  {images.map((image, index) => (
    <motion.div
      key={image.id}
      className="masonry-item group"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
    >
      {/* image content */}
    </motion.div>
  ))}
</div>
```

---

## Paso 2.5: Animar ImageGallery con gestos

**Archivo**: `src/components/ImageGallery.tsx`

### Cambios principales:

#### 2.5.1 Transicion de entrada/salida del modal:
```tsx
import { motion, AnimatePresence } from 'framer-motion';

// Envolver todo el modal en AnimatePresence:
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* contenido del modal */}
    </motion.div>
  )}
</AnimatePresence>
```

#### 2.5.2 Transicion de imagen al cambiar:
```tsx
// Envolver la imagen en AnimatePresence con key:
<AnimatePresence mode="wait">
  <motion.div
    key={img.id}
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.96 }}
    transition={{ duration: 0.2 }}
  >
    <Image src={img.fileUrl} ... />
  </motion.div>
</AnimatePresence>
```

#### 2.5.3 Gestos tactiles (drag para navegar):
```tsx
// En la imagen principal, agregar drag horizontal:
<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  dragElastic={0.2}
  onDragEnd={(_, info) => {
    if (info.offset.x > 100) go(-1);     // Swipe derecha = anterior
    else if (info.offset.x < -100) go(1); // Swipe izquierda = siguiente
  }}
>
  <Image ... />
</motion.div>
```

#### 2.5.4 Panel de info con slide:
```tsx
// Reemplazar animate-slide-up por motion:
<AnimatePresence>
  {showInfo && (
    <motion.div
      className="w-80 bg-white/[0.06] backdrop-blur-2xl ..."
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* info content */}
    </motion.div>
  )}
</AnimatePresence>
```

---

## Paso 2.6: Micro-interacciones en botones y cards

### Hover scale en cards:
```tsx
// En lugar de CSS transform, usar motion:
<motion.div
  whileHover={{ scale: 1.02, y: -4 }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
>
  {/* card content */}
</motion.div>
```

### Botones con feedback tactil:
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.97 }}
>
  Subir Fotos
</motion.button>
```

---

## Paso 2.7: Transicion de layout (masonry <-> grid)

**Archivo**: `src/app/album/[year]/page.tsx`

### Usar layout animation para transicion suave:
```tsx
import { LayoutGroup, motion } from 'framer-motion';

// Envolver en LayoutGroup:
<LayoutGroup>
  {images.map((image) => (
    <motion.div
      key={image.id}
      layout
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      {/* image */}
    </motion.div>
  ))}
</LayoutGroup>
```

---

## Paso 2.8: Limpiar animaciones CSS antiguas

**Archivo**: `src/app/globals.css`

### Eliminar (ya no se necesitan con Framer Motion):
```css
/* ELIMINAR estas reglas: */
@keyframes fade-up { ... }
.animate-fade-up { ... }
```

Las animaciones ahora son controladas por Framer Motion, que ofrece:
- Mejor rendimiento (GPU-accelerated)
- Cancelacion y interrupcion suave
- Animaciones basadas en fisica (spring)
- Gestos tactiles nativos

---

## Checklist de Implementacion

- [ ] 2.1 Instalar framer-motion
- [ ] 2.2 Crear componente MotionWrap.tsx
- [ ] 2.3 Animar Home page
- [ ] 2.4 Animar Album page
- [ ] 2.5 Animar ImageGallery (modal, transiciones, gestos)
- [ ] 2.6 Micro-interacciones en botones y cards
- [ ] 2.7 Transicion de layout masonry/grid
- [ ] 2.8 Limpiar animaciones CSS antiguas
- [ ] Verificar rendimiento en mobile (no animar en exceso)
- [ ] Probar gestos tactiles en dispositivos touch

## Dependencias
```json
{
  "framer-motion": "^11.x"
}
```

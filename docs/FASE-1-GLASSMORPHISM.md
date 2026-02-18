# Fase 1: Rediseño Glassmorphism

## Resumen
Transformar el diseño actual (flat/minimal) a un diseño glassmorphism moderno con fondos translucidos, blur, gradientes mesh y bordes luminosos.

---

## Paso 1.1: Actualizar ThemeContext.tsx - Nuevo sistema de colores glass

**Archivo**: `src/contexts/ThemeContext.tsx`

### Que cambiar
Reemplazar los colores solidos por colores glass con transparencia y blur.

### Tema Light - Cambios:
```
ANTES                              DESPUES
bg: 'bg-stone-100'             -> bg: 'bg-stone-50'
cardBg: 'bg-white'             -> cardBg: 'bg-white/60 backdrop-blur-xl'
cardBorder: 'border-black/4'   -> cardBorder: 'border border-white/60'
cardShadow: 'shadow-sm'        -> cardShadow: 'shadow-lg shadow-black/[0.04]'
sidebarBg: 'bg-stone-100/90'   -> sidebarBg: 'bg-white/40 backdrop-blur-2xl border-r border-white/50'
inputBg: 'bg-gray-100'         -> inputBg: 'bg-white/50 backdrop-blur-sm'
```

### Tema Dark - Cambios:
```
ANTES                                DESPUES
bg: 'bg-neutral-950'             -> bg: 'bg-[#0a0a0f]'
cardBg: 'bg-neutral-900'         -> cardBg: 'bg-white/[0.04] backdrop-blur-xl'
cardBorder: 'border-white/6'     -> cardBorder: 'border border-white/[0.08]'
cardShadow: 'shadow-none'        -> cardShadow: 'shadow-lg shadow-black/20'
sidebarBg: 'bg-neutral-950...'   -> sidebarBg: 'bg-white/[0.02] backdrop-blur-2xl border-r border-white/[0.06]'
inputBg: 'bg-neutral-800'        -> inputBg: 'bg-white/[0.06] backdrop-blur-sm'
```

### Nuevas propiedades a agregar al ThemeColors interface:
```typescript
// Agregar estas propiedades nuevas:
glassCard: string;      // Para cards con efecto glass mas pronunciado
glassBg: string;        // Fondo glass generico
glowAccent: string;     // Glow sutil del color accent
gradientBg: string;     // Gradiente de fondo mesh
```

### Valores para las nuevas propiedades:
```typescript
// Light theme:
glassCard: 'bg-white/70 backdrop-blur-2xl border border-white/80 shadow-xl shadow-black/[0.03]',
glassBg: 'bg-white/30 backdrop-blur-xl',
glowAccent: 'shadow-blue-500/20',
gradientBg: 'bg-gradient-to-br from-blue-50/50 via-stone-50 to-purple-50/30',

// Dark theme:
glassCard: 'bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] shadow-xl shadow-black/30',
glassBg: 'bg-white/[0.03] backdrop-blur-xl',
glowAccent: 'shadow-blue-500/10',
gradientBg: 'bg-gradient-to-br from-blue-950/20 via-[#0a0a0f] to-purple-950/10',
```

---

## Paso 1.2: Fondo con gradiente mesh animado

**Archivo**: `src/app/globals.css`

### Agregar al final del archivo:
```css
/* ===== GLASSMORPHISM BASE ===== */
.glass-bg {
  position: relative;
  overflow: hidden;
}

.glass-bg::before {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.08) 0%, transparent 50%);
  animation: mesh-float 20s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

:is(.dark) .glass-bg::before {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(120, 119, 198, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at 40% 80%, rgba(168, 85, 247, 0.04) 0%, transparent 50%);
}

@keyframes mesh-float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(2%, -1%) rotate(1deg); }
  66% { transform: translate(-1%, 1%) rotate(-1deg); }
}

/* ===== GLASS CARD HOVER ===== */
.glass-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.glass-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
}

:is(.dark) .glass-card:hover {
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
}

/* ===== GLASS GLOW EFFECT ===== */
.glass-glow {
  position: relative;
}

.glass-glow::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.2) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  pointer-events: none;
  z-index: 1;
}

:is(.dark) .glass-glow::after {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08) 0%,
    transparent 50%,
    rgba(255, 255, 255, 0.02) 100%
  );
}
```

---

## Paso 1.3: Aplicar glass-bg al layout principal

**Archivo**: `src/app/layout.tsx`

### Cambiar:
```tsx
// ANTES:
<main className="flex-1 min-h-screen overflow-y-auto">

// DESPUES:
<main className="flex-1 min-h-screen overflow-y-auto glass-bg">
```

Y agregar la clase `glass-bg` tambien al wrapper del contenido en las paginas donde aplique el gradiente de fondo.

---

## Paso 1.4: Rediseñar cards de año en Home

**Archivo**: `src/app/page.tsx`

### Cambios en el contenedor principal:
```tsx
// ANTES:
<div className={`min-h-screen transition-colors duration-300 ${t.bg}`}>

// DESPUES:
<div className={`min-h-screen transition-colors duration-300 ${t.gradientBg}`}>
```

### Cambios en cada card de año:
```tsx
// ANTES:
<div className={`rounded-2xl overflow-hidden ${t.cardBg} ${t.cardBorder} ${t.cardShadow} photo-card`}>

// DESPUES:
<div className={`rounded-2xl overflow-hidden ${t.glassCard} glass-card glass-glow`}>
```

### Cambios en el badge de fotos (top-right):
```tsx
// ANTES:
<div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${t.cardBg} ${t.text}`}>

// DESPUES:
<div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white border border-white/20">
```

---

## Paso 1.5: Sidebar glassmorphism

**Archivo**: `src/components/Sidebar.tsx`

### Cambios en el aside:
El sidebarBg ya se actualizo en el ThemeContext (paso 1.1), pero adicionalmente agregar efecto de glow:

```tsx
// Agregar al className del aside:
// Despues de ${t.sidebarBg} agregar:
glass-glow
```

### Cambios en el nav active state:
```tsx
// ANTES (en ThemeContext):
navActive: 'bg-blue-600 text-white',

// DESPUES:
navActive: 'bg-blue-600/80 backdrop-blur-sm text-white shadow-lg shadow-blue-600/20',
```

---

## Paso 1.6: Rediseñar ImageGallery con glass

**Archivo**: `src/components/ImageGallery.tsx`

### Panel de info (linea 169):
```tsx
// ANTES:
<div className="w-80 bg-black/60 backdrop-blur-xl border-l border-white/10 overflow-y-auto relative z-10 animate-slide-up">

// DESPUES:
<div className="w-80 bg-white/[0.06] backdrop-blur-2xl border-l border-white/[0.1] overflow-y-auto relative z-10 animate-slide-up">
```

### Top bar:
```tsx
// ANTES:
<div className="flex items-center justify-between px-5 py-4 relative z-10">

// DESPUES:
<div className="flex items-center justify-between px-5 py-4 relative z-10 bg-black/20 backdrop-blur-md">
```

### Botones de info y cerrar:
```tsx
// ANTES:
className={`p-2 rounded-xl transition-colors ${showInfo ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}

// DESPUES:
className={`p-2 rounded-xl transition-all duration-200 ${showInfo ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-white/5' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
```

### Botones de navegacion (prev/next):
```tsx
// ANTES:
className="absolute left-4 p-3 rounded-2xl hover:bg-white/10 transition-colors text-white/50 hover:text-white"

// DESPUES:
className="absolute left-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all text-white/50 hover:text-white border border-white/[0.06]"
```

### Thumbnail strip:
```tsx
// ANTES:
<div className="px-5 py-4 relative z-10">

// DESPUES:
<div className="px-5 py-4 relative z-10 bg-black/20 backdrop-blur-md">
```

---

## Paso 1.7: Formularios y paginas admin/upload con glass

**Archivo**: `src/app/upload/page.tsx`

### Zona de drag & drop:
```tsx
// ANTES:
<div className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : t.inputBorder}`}>

// DESPUES:
<div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-blue-500 bg-blue-500/10 backdrop-blur-sm scale-[1.01]' : t.inputBorder}`}>
```

**Archivo**: `src/app/admin/page.tsx`

### Cards de admin con glass:
Reemplazar `${t.cardBg} ${t.cardBorder} ${t.cardShadow}` por `${t.glassCard}` en las cards de albums.

---

## Paso 1.8: Botones glass modernos

**Archivo**: `src/app/globals.css`

### Agregar estilos de botones glass:
```css
/* ===== GLASS BUTTONS ===== */
.btn-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.btn-glass-accent {
  background: rgba(59, 130, 246, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transition: all 0.2s ease;
}

.btn-glass-accent:hover {
  background: rgba(59, 130, 246, 0.9);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  transform: translateY(-1px);
}
```

### Aplicar en botones principales:
En los botones que usan `${t.accentBg}`, agregar la clase `btn-glass-accent` como complemento.

---

## Paso 1.9: Scrollbar glass

**Archivo**: `src/app/globals.css`

### Reemplazar las reglas de scrollbar existentes:
```css
/* ===== SCROLLBAR GLASS ===== */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  backdrop-filter: blur(4px);
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

:is(.dark) ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
}

:is(.dark) ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.15);
}
```

---

## Checklist de Implementacion

- [ ] 1.1 Actualizar ThemeContext.tsx con colores glass
- [ ] 1.2 Agregar CSS de glassmorphism en globals.css
- [ ] 1.3 Aplicar glass-bg al layout
- [ ] 1.4 Rediseñar cards de home
- [ ] 1.5 Sidebar glass
- [ ] 1.6 ImageGallery glass
- [ ] 1.7 Formularios upload/admin glass
- [ ] 1.8 Botones glass
- [ ] 1.9 Scrollbar glass
- [ ] Verificar que no haya regresiones visuales
- [ ] Probar en mobile y desktop
- [ ] Probar transicion light/dark

## Dependencias a instalar
**Ninguna** - Todo se logra con Tailwind CSS y CSS puro.

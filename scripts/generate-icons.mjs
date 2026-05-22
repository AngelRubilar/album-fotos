/**
 * Genera los íconos PWA (public/icon-*.png) a partir de un SVG diseñado a mano.
 * Identidad "editorial sereno": fondo verde petróleo + glifo de foto en crema.
 *
 * Uso: npm run generate-icons
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// glyphScale: cuánto ocupa el glifo. 1.12 = lleno (any), 0.95 = con zona segura (maskable)
const buildSVG = (glyphScale) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#357575"/>
      <stop offset="1" stop-color="#234f4f"/>
    </linearGradient>
    <linearGradient id="frame" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f6f3ed"/>
      <stop offset="1" stop-color="#e4ddd0"/>
    </linearGradient>
    <clipPath id="photoclip">
      <rect x="151" y="181" width="210" height="170" rx="22"/>
    </clipPath>
  </defs>

  <rect width="512" height="512" fill="url(#bg)"/>
  <circle cx="120" cy="110" r="240" fill="#ffffff" opacity="0.06"/>

  <g transform="translate(256 256) scale(${glyphScale}) translate(-256 -256)">
    <!-- foto trasera: insinúa un álbum / pila de fotos -->
    <g transform="rotate(-9 256 266)">
      <rect x="151" y="181" width="210" height="170" rx="22" fill="#f6f3ed" opacity="0.32"/>
    </g>
    <!-- foto frontal -->
    <rect x="151" y="181" width="210" height="170" rx="22" fill="url(#frame)"/>
    <g clip-path="url(#photoclip)">
      <circle cx="205" cy="228" r="20" fill="#5fa3a0"/>
      <path d="M151 351 L211 286 L255 322 L312 258 L361 312 L361 351 Z" fill="#234f4f"/>
      <path d="M151 351 L243 300 L300 334 L361 296 L361 351 Z" fill="#2f6b6b"/>
    </g>
  </g>
</svg>`;

const targets = [
  { file: 'icon-192.png', size: 192, scale: 1.12 },
  { file: 'icon-512.png', size: 512, scale: 1.12 },
  { file: 'icon-512-maskable.png', size: 512, scale: 0.95 },
  { file: 'apple-touch-icon.png', size: 180, scale: 1.12 },
];

for (const { file, size, scale } of targets) {
  const svg = Buffer.from(buildSVG(scale));
  await sharp(svg, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(publicDir, file));
  console.log(`✅ ${file} (${size}×${size})`);
}

console.log('🎉 Íconos generados en public/');

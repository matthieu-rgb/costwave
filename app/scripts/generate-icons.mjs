import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [192, 512];
const publicDir = join(__dirname, '..', 'public', 'icons');

await mkdir(publicDir, { recursive: true });

// Placeholder: carre noir avec lettre C blanche (IBM Plex Mono)
const createIcon = async (size) => {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#07090b"/>
      <text x="50%" y="50%" font-family="monospace" font-size="${size * 0.6}"
            fill="#f5f5f5" text-anchor="middle" dominant-baseline="central"
            font-weight="600">C</text>
    </svg>
  `;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(publicDir, `icon-${size}.png`));
};

// Icons normales
await Promise.all(sizes.map(createIcon));

// Icon maskable (padding 10%)
const svgMaskable = `
  <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#0b968a"/>
    <text x="50%" y="50%" font-family="monospace" font-size="300"
          fill="#f5f5f5" text-anchor="middle" dominant-baseline="central"
          font-weight="600">C</text>
  </svg>
`;
await sharp(Buffer.from(svgMaskable))
  .png()
  .toFile(join(publicDir, 'icon-maskable-512.png'));

console.log('✓ Icons generated in public/icons/');

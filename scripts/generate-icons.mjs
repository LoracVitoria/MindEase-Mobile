import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const assetsDir = path.join(root, 'assets');

const svgPath = path.join(assetsDir, 'mindease-logo.svg');
const iconPath = path.join(assetsDir, 'icon.png');
const adaptiveIconPath = path.join(assetsDir, 'adaptive-icon.png');
const splashPath = path.join(assetsDir, 'splash.png');

if (!fs.existsSync(svgPath)) {
  throw new Error(`SVG não encontrado: ${svgPath}`);
}

const svgText = fs.readFileSync(svgPath, 'utf8');

// Remove o contorno do círculo (muitas vezes é percebido como "sombra" em tamanhos pequenos)
const svgNoRingText = svgText.replace(
  /<circle([^>]*?)stroke="[^"]*"([^>]*?)stroke-width="[^"]*"([^>]*)\/>/i,
  '<circle$1stroke="none"$2stroke-width="0"$3/>'
);

const svg = Buffer.from(svgNoRingText);

function whiteCanvas(size) {
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  });
}

// A logo (160x160) tem uma margem natural; para ícone ela precisa ficar maior.
// Esses percentuais deixam a marca bem evidente sem encostar nas bordas.
const ICON_SIZE = 1024;
const ICON_INNER = 940;

const ADAPTIVE_SIZE = 1024;
const ADAPTIVE_INNER = 900;

// Splash padrão do Expo aceita qualquer tamanho; usamos um "safe" grande (aspect ratio mobile)
const SPLASH_W = 1242;
const SPLASH_H = 2436;
const SPLASH_INNER = 760;

const renderedForIcon = await sharp(svg, { density: 600 })
  .resize(ICON_INNER, ICON_INNER, { fit: 'contain' })
  .png()
  .toBuffer();

await whiteCanvas(ICON_SIZE)
  .composite([{ input: renderedForIcon, gravity: 'center' }])
  .png()
  .toFile(iconPath);

const renderedForAdaptive = await sharp(svg, { density: 600 })
  .resize(ADAPTIVE_INNER, ADAPTIVE_INNER, { fit: 'contain' })
  .png()
  .toBuffer();

await whiteCanvas(ADAPTIVE_SIZE)
  .composite([{ input: renderedForAdaptive, gravity: 'center' }])
  .png()
  .toFile(adaptiveIconPath);

const renderedForSplash = await sharp(svg, { density: 600 })
  .resize(SPLASH_INNER, SPLASH_INNER, { fit: 'contain' })
  .png()
  .toBuffer();

await sharp({
  create: {
    width: SPLASH_W,
    height: SPLASH_H,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  },
})
  .composite([{ input: renderedForSplash, gravity: 'center' }])
  .png()
  .toFile(splashPath);

console.log('Gerado:', iconPath);
console.log('Gerado:', adaptiveIconPath);
console.log('Gerado:', splashPath);

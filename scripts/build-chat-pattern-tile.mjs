import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const iconPath = path.join(root, 'src/assets/daros-chat-pattern-icon.png');
const wordPath = path.join(root, 'src/assets/daros-chat-pattern-wordmark.png');
const outPath = path.join(root, 'src/assets/daros-chat-pattern-tile.png');

const TILE = 520;
const GAP = 8;

function mulberry32(seed) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260324);

const iconMeta = await sharp(iconPath).metadata();
const wordMeta = await sharp(wordPath).metadata();

function rotatedBounds(width, height, rotateDeg) {
  const rad = (Math.abs(rotateDeg) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  return {
    width: Math.ceil(width * cos + height * sin),
    height: Math.ceil(width * sin + height * cos),
  };
}

function estimateBox(type, scale, rotate, x, y) {
  const meta = type === 'icon' ? iconMeta : wordMeta;
  const width = Math.round(meta.width * scale);
  const height = Math.round(meta.height * scale);
  const bounds = rotatedBounds(width, height, rotate);
  const left = Math.round(x);
  const top = Math.round(y);
  return {
    left,
    top,
    right: left + bounds.width,
    bottom: top + bounds.height,
  };
}

/** @type {{ left: number; top: number; right: number; bottom: number }[]} */
const occupied = [];

function intersects(a, b) {
  return !(a.right + GAP <= b.left || b.right + GAP <= a.left || a.bottom + GAP <= b.top || b.bottom + GAP <= a.top);
}

function canPlace(box) {
  if (box.left < 2 || box.top < 2 || box.right > TILE - 2 || box.bottom > TILE - 2) return false;
  return !occupied.some((other) => intersects(box, other));
}

function remember(box) {
  occupied.push(box);
}

/** @type {{ type: 'icon' | 'word'; x: number; y: number; rotate: number; scale: number }[]} */
const placements = [];

for (let row = 0, y = 6; y < TILE - 10; row += 1, y += 36) {
  const rowOffset = (row % 3) * 12;
  for (let x = 6 + rowOffset; x < TILE - 10; x += 46) {
    const type = (row + Math.floor(x / 46)) % 4 === 0 ? 'word' : 'icon';
    const scale =
      type === 'icon' ? 0.12 + rand() * 0.05 : 0.065 + rand() * 0.03;
    const rotate = Math.round((rand() - 0.5) * 28);

    let placed = false;
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const jitterX = attempt === 0 ? 0 : Math.round((rand() - 0.5) * 18);
      const jitterY = attempt === 0 ? 0 : Math.round((rand() - 0.5) * 14);
      const box = estimateBox(type, scale, rotate, x + jitterX, y + jitterY);
      if (canPlace(box)) {
        placements.push({
          type,
          x: box.left,
          y: box.top,
          rotate,
          scale,
        });
        remember(box);
        placed = true;
        break;
      }
    }

    if (!placed && type === 'word') {
      const smallerScale = 0.06;
      const rotate2 = Math.round((rand() - 0.5) * 20);
      const box = estimateBox('word', smallerScale, rotate2, x, y);
      if (canPlace(box)) {
        placements.push({ type: 'word', x: box.left, y: box.top, rotate: rotate2, scale: smallerScale });
        remember(box);
      }
    }
  }
}

async function renderAsset(type, scale, rotate) {
  const source = type === 'icon' ? iconPath : wordPath;
  const meta = await sharp(source).metadata();
  const width = Math.round(meta.width * scale);
  const height = Math.round(meta.height * scale);

  return sharp(source)
    .resize(width, height, { fit: 'inside' })
    .rotate(rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
}

const composites = [];
for (const placement of placements) {
  const input = await renderAsset(placement.type, placement.scale, placement.rotate);
  const meta = await sharp(input).metadata();
  const left = Math.max(0, Math.min(TILE - meta.width, placement.x));
  const top = Math.max(0, Math.min(TILE - meta.height, placement.y));
  composites.push({ input, left, top });
}

await sharp({
  create: {
    width: TILE,
    height: TILE,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(outPath);

console.log(`Wrote ${outPath} (${composites.length} marks with ${GAP}px gap)`);
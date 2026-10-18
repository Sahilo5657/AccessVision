import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Minimal pure Node.js PNG encoder without external packages
function createPng(width, height, pixelFn) {
  const rowSize = width * 4;
  const rawData = Buffer.alloc(height * (1 + rowSize));

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // Helper to create chunk
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);

    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);

    // CRC32 calculation
    const crc = calcCrc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 table & helper
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function calcCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Icon Pixel Generator
function renderIconPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = x - cx;
  const ry = y - cy;
  const dist = Math.sqrt(rx * rx + ry * ry);

  // Background rounded rectangle or circle
  const maxR = w * 0.46;
  if (!isMaskable && dist > maxR) {
    return [0, 0, 0, 0]; // Transparent outside icon bounds
  }

  // Deep indigo/navy gradient
  const t = (x + y) / (w + h);
  let r = Math.round(15 + t * 15);
  let g = Math.round(23 + t * 35);
  let b = Math.round(42 + t * 100);

  // Center Eye geometry
  const eyeRadius = w * 0.28;
  const eyeYScale = 0.55;
  const normX = rx / eyeRadius;
  const normY = ry / (eyeRadius * eyeYScale);
  const eyeDist = Math.sqrt(normX * normX + normY * normY);

  // Eye outline
  if (eyeDist >= 0.88 && eyeDist <= 1.05) {
    return [255, 255, 255, 255];
  }

  // Pupil / Iris
  const pupilDist = Math.sqrt(rx * rx + ry * ry) / (w * 0.12);
  if (pupilDist <= 1.0) {
    if (pupilDist <= 0.45) {
      // Golden pupil
      return [251, 191, 36, 255];
    }
    // Cyan iris
    return [56, 189, 248, 255];
  }

  // Audio wave arcs
  const waveDist = Math.abs(rx);
  if (Math.abs(ry) < w * 0.15 && ((waveDist > w * 0.32 && waveDist < w * 0.35) || (waveDist > w * 0.38 && waveDist < w * 0.41))) {
    return [56, 189, 248, 200];
  }

  // Audio equalizer bars under eye
  if (y > cy + h * 0.18 && y < cy + h * 0.32) {
    const barX = Math.abs(rx);
    if (barX < w * 0.18 && Math.floor(x / (w * 0.05)) % 2 === 0) {
      return [245, 158, 11, 230];
    }
  }

  return [r, g, b, 255];
}

const outDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate standard and maskable icons
console.log('Generating 192x192 icon...');
fs.writeFileSync(path.join(outDir, 'icon-192.png'), createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));

console.log('Generating 192x192 maskable icon...');
fs.writeFileSync(path.join(outDir, 'icon-192-maskable.png'), createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, true)));

console.log('Generating 512x512 icon...');
fs.writeFileSync(path.join(outDir, 'icon-512.png'), createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false)));

console.log('Generating 512x512 maskable icon...');
fs.writeFileSync(path.join(outDir, 'icon-512-maskable.png'), createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true)));

console.log('✅ All PWA PNG icons generated successfully!');

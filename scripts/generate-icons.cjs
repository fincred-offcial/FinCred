const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Minimal PNG generator using pure standard Node.js zlib
function createPng(width, height, drawFn) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression method
  ihdr[11] = 0; // filter method
  ihdr[12] = 0; // interlace method
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([len, body, crc]);
}

// CRC32 table & calculation
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c = c >>> 1;
    }
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Icon Drawing: FinCred Blue gradient with shield & letter F
function fincredIcon(x, y, w, h) {
  // Normalize 0 to 1
  const nx = x / w;
  const ny = y / h;

  // Background rounded squircle / circle
  const cx = 0.5;
  const cy = 0.5;
  const dx = Math.abs(nx - cx);
  const dy = Math.abs(ny - cy);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Deep Blue background: #1d4ed8 to #2563eb
  const bgR = 29 + Math.floor(ny * 8);
  const bgG = 78 + Math.floor(ny * 21);
  const bgB = 216 + Math.floor(ny * 19);

  // Shield boundary
  const insideShield = (nx >= 0.22 && nx <= 0.78 && ny >= 0.2 && ny <= 0.76);
  
  if (insideShield) {
    // White shield icon center
    const relX = (nx - 0.22) / 0.56;
    const relY = (ny - 0.2) / 0.56;
    
    // Draw "F" & shield accent
    const isFStem = (relX >= 0.25 && relX <= 0.37 && relY >= 0.2 && relY <= 0.8);
    const isFTopBar = (relX >= 0.25 && relX <= 0.75 && relY >= 0.2 && relY <= 0.34);
    const isFMidBar = (relX >= 0.25 && relX <= 0.65 && relY >= 0.45 && relY <= 0.57);
    const isCheckDot = (relX >= 0.7 && relX <= 0.82 && relY >= 0.68 && relY <= 0.8);

    if (isFStem || isFTopBar || isFMidBar || isCheckDot) {
      return [255, 255, 255, 255]; // Pure crisp white
    }
  }

  // Outside rounded border margin check (for maskable padding)
  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, fincredIcon));
// Generate 512x512
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, fincredIcon));
// Generate 512x512 maskable
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, fincredIcon));
// Generate apple-touch-icon 180x180
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, fincredIcon));

console.log('PNG icons created successfully!');

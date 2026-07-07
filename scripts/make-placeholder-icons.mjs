// Erzeugt einfache einfarbige Platzhalter-Icons (PNG), bis ein echtes App-Icon
// gestaltet wird. Kein Abhängigkeit auf sharp/canvas nötig.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c;
  const table = crc32.table ?? (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function makePng(size, { r, g, b }, padPercent = 0) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type: RGB
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const pad = Math.round(size * padPercent);
  const raw = Buffer.alloc(size * (1 + size * 3));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + size * 3);
    raw[rowStart] = 0; // filter type none
    const inset = y < pad || y >= size - pad;
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 3;
      const insetX = x < pad || x >= size - pad;
      if (inset || insetX) {
        // Rand: etwas dunklerer Ton, damit maskable Icons sauber wirken
        raw[px] = Math.max(0, r - 25);
        raw[px + 1] = Math.max(0, g - 25);
        raw[px + 2] = Math.max(0, b - 25);
      } else {
        raw[px] = r;
        raw[px + 1] = g;
        raw[px + 2] = b;
      }
    }
  }

  const idat = deflateSync(raw);
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const accent = { r: 0x3f, g: 0x78, b: 0x59 };

writeFileSync(join(outDir, "icon-192.png"), makePng(192, accent, 0));
writeFileSync(join(outDir, "icon-512.png"), makePng(512, accent, 0));
writeFileSync(join(outDir, "icon-maskable-512.png"), makePng(512, accent, 0.1));

console.log("Platzhalter-Icons erzeugt in", outDir);

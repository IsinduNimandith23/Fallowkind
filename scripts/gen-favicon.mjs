import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src/app/icon.png");
const out = path.join(root, "src/app/favicon.ico");
const sizes = [16, 32, 48];

const pngs = await Promise.all(
  sizes.map((s) =>
    sharp(src)
      .resize(s, s, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer(),
  ),
);

const count = pngs.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: 1 = icon
header.writeUInt16LE(count, 4);

const entries = [];
let offset = 6 + count * 16;
for (let i = 0; i < count; i++) {
  const s = sizes[i];
  const png = pngs[i];
  const e = Buffer.alloc(16);
  e.writeUInt8(s >= 256 ? 0 : s, 0); // width
  e.writeUInt8(s >= 256 ? 0 : s, 1); // height
  e.writeUInt8(0, 2); // palette count
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(png.length, 8); // image size
  e.writeUInt32LE(offset, 12); // image offset
  entries.push(e);
  offset += png.length;
}

fs.writeFileSync(out, Buffer.concat([header, ...entries, ...pngs]));
console.log("Wrote", out, fs.statSync(out).size, "bytes");

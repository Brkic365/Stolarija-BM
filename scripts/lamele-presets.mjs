// Packs a mesh (binary STL) into the compact preset format used by the
// slat-wall tool (/admin/lamele). Usage:
//   node scripts/lamele-presets.mjs input.stl public/models/lamele/<id>.bin [keepTop]
// keepTop (0..1, optional) keeps only the top part of the model, e.g. 0.55 drops
// a bust's pedestal so the face, not the plinth, is the nearest point.
// The mesh must already be Y-up and facing +Z.
// Format (gzipped): "BMSH", vertex count, triangle count (uint32), bbox min and
// size (6 × float32), vertices quantised to uint16 (padded to 4 bytes),
// triangle indices as uint32. Decoded by decodePreset() in src/lib/slatwall/model.ts.
import { readFileSync, writeFileSync } from "fs";
import { gzipSync } from "fflate";

const [input, output, keepArg] = process.argv.slice(2);
const keepTop = keepArg ? Number(keepArg) : 1;
const src = readFileSync(input);
const n0 = src.readUInt32LE(80);
if (84 + n0 * 50 !== src.length) throw new Error("expected a binary STL");
let ylo = Infinity, yhi = -Infinity;
for (let t = 0; t < n0; t++) for (let v = 0; v < 3; v++) {
  const y = src.readFloatLE(84 + t * 50 + 12 + v * 12 + 4);
  ylo = Math.min(ylo, y); yhi = Math.max(yhi, y);
}
const cutY = yhi - (yhi - ylo) * keepTop;
const keptTris = [];
for (let t = 0; t < n0; t++) {
  let ok = true;
  for (let v = 0; v < 3; v++) if (src.readFloatLE(84 + t * 50 + 12 + v * 12 + 4) < cutY) ok = false;
  if (ok) keptTris.push(t);
}
const n = keptTris.length;
const b = Buffer.alloc(84 + n * 50);
b.writeUInt32LE(n, 80);
keptTris.forEach((t, i) => src.copy(b, 84 + i * 50, 84 + t * 50, 84 + t * 50 + 50));

const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
const raw = new Float32Array(n * 9);
for (let t = 0; t < n; t++) for (let k = 0; k < 9; k++) {
  const v = b.readFloatLE(84 + t * 50 + 12 + k * 4);
  raw[t * 9 + k] = v;
  min[k % 3] = Math.min(min[k % 3], v);
  max[k % 3] = Math.max(max[k % 3], v);
}
const size = max.map((m, k) => Math.max(m - min[k], 1e-9));
const q = (v, k) => Math.round(((v - min[k]) / size[k]) * 65535);

// weld identical quantised vertices
const ids = new Map();
const verts = [];
const idx = new Uint32Array(n * 3);
for (let i = 0; i < n * 3; i++) {
  const x = q(raw[i * 3], 0), y = q(raw[i * 3 + 1], 1), z = q(raw[i * 3 + 2], 2);
  const key = (x * 65536 + y) * 65536 + z;
  let id = ids.get(key);
  if (id === undefined) { id = verts.length / 3; ids.set(key, id); verts.push(x, y, z); }
  idx[i] = id;
}
const nv = verts.length / 3;
const vBytes = nv * 6 + ((nv * 6) % 4 ? 4 - ((nv * 6) % 4) : 0);
const out = Buffer.alloc(36 + vBytes + n * 12);
out.writeUInt32LE(0x48534d42, 0);
out.writeUInt32LE(nv, 4);
out.writeUInt32LE(n, 8);
for (let k = 0; k < 3; k++) { out.writeFloatLE(min[k], 12 + k * 4); out.writeFloatLE(size[k], 24 + k * 4); }
for (let i = 0; i < verts.length; i++) out.writeUInt16LE(verts[i], 36 + i * 2);
for (let i = 0; i < idx.length; i++) out.writeUInt32LE(idx[i], 36 + vBytes + i * 4);
const gz = gzipSync(new Uint8Array(out), { level: 9 });
writeFileSync(output, gz);
console.log(`${output}: ${n} triangles, ${nv} vertices, ${(gz.length / 1024).toFixed(0)} KB`);

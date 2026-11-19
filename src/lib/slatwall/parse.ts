/**
 * Fast, low-memory mesh readers. Everything returns a flat xyz triangle soup
 * (9 floats per triangle). These run inside the model worker, so they avoid
 * DOM APIs.
 */

class FloatList {
  a: Float32Array;
  n = 0;
  constructor(cap = 1 << 16) {
    this.a = new Float32Array(cap);
  }
  push3(x: number, y: number, z: number) {
    if (this.n + 3 > this.a.length) {
      const b = new Float32Array(Math.max(this.a.length * 2, this.n + 3));
      b.set(this.a);
      this.a = b;
    }
    this.a[this.n++] = x;
    this.a[this.n++] = y;
    this.a[this.n++] = z;
  }
  done() {
    return this.a.subarray(0, this.n);
  }
}

export function parseSTL(buf: ArrayBuffer): Float32Array {
  const dv = new DataView(buf);
  if (buf.byteLength >= 84) {
    const n = dv.getUint32(80, true);
    if (84 + n * 50 === buf.byteLength) {
      const out = new Float32Array(n * 9);
      for (let t = 0; t < n; t++) {
        const o = 84 + t * 50 + 12;
        for (let k = 0; k < 9; k++) out[t * 9 + k] = dv.getFloat32(o + k * 4, true);
      }
      return out;
    }
  }
  // ASCII: every "vertex x y z" line, in order, three per facet
  const txt = new TextDecoder().decode(new Uint8Array(buf));
  const list = new FloatList();
  const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(txt))) list.push3(+m[1], +m[2], +m[3]);
  const out = list.done();
  return out.subarray(0, out.length - (out.length % 9));
}

/** OBJ reader working on bytes: v and f lines only, polygons fan-triangulated, negative indices allowed. */
export function parseOBJ(buf: ArrayBuffer): Float32Array {
  const s = new Uint8Array(buf);
  const N = s.length;
  const verts = new FloatList(1 << 18);
  const out = new FloatList(1 << 18);
  let i = 0;

  const skipLine = () => {
    while (i < N && s[i] !== 10) i++;
    i++;
  };
  const skipSpaces = () => {
    while (i < N && (s[i] === 32 || s[i] === 9)) i++;
  };
  const readFloat = (): number => {
    skipSpaces();
    const st = i;
    while (i < N && s[i] > 32) i++;
    // Fast path for plain decimals; fall back to parseFloat for exponents
    let neg = false, j = st, val = 0, frac = 0, div = 1, exp = false;
    if (s[j] === 45) { neg = true; j++; } else if (s[j] === 43) j++;
    for (; j < i; j++) {
      const c = s[j];
      if (c >= 48 && c <= 57) {
        if (frac) { div *= 10; val += (c - 48) / div; } else val = val * 10 + (c - 48);
      } else if (c === 46) frac = 1;
      else { exp = true; break; }
    }
    if (exp) {
      let str = "";
      for (let k = st; k < i; k++) str += String.fromCharCode(s[k]);
      return parseFloat(str);
    }
    return neg ? -val : val;
  };
  const readIndex = (): number => {
    // first number of "v/vt/vn"; returns NaN at end of line
    skipSpaces();
    if (i >= N || s[i] === 10 || s[i] === 13 || s[i] === 35) return NaN;
    let neg = false, v = 0, any = false;
    if (s[i] === 45) { neg = true; i++; }
    while (i < N && s[i] >= 48 && s[i] <= 57) { v = v * 10 + (s[i] - 48); i++; any = true; }
    while (i < N && s[i] > 32) i++; // skip /vt/vn
    if (!any) return NaN;
    return neg ? -v : v;
  };

  const poly: number[] = [];
  while (i < N) {
    const c0 = s[i];
    if (c0 === 118 && (s[i + 1] === 32 || s[i + 1] === 9)) {
      // "v "
      i += 2;
      const x = readFloat(), y = readFloat(), z = readFloat();
      verts.push3(x, y, z);
      skipLine();
    } else if (c0 === 102 && (s[i + 1] === 32 || s[i + 1] === 9)) {
      // "f "
      i += 2;
      poly.length = 0;
      const nv = verts.n / 3;
      for (;;) {
        const k = readIndex();
        if (Number.isNaN(k)) break;
        poly.push(k < 0 ? nv + k : k - 1);
      }
      const va = verts.a;
      for (let t = 1; t + 1 < poly.length; t++) {
        const a = poly[0] * 3, b = poly[t] * 3, c = poly[t + 1] * 3;
        if (a < 0 || b < 0 || c < 0 || a >= verts.n || b >= verts.n || c >= verts.n) continue;
        out.push3(va[a], va[a + 1], va[a + 2]);
        out.push3(va[b], va[b + 1], va[b + 2]);
        out.push3(va[c], va[c + 1], va[c + 2]);
      }
      skipLine();
    } else {
      skipLine();
    }
  }
  return out.done();
}

/** Indexed or non-indexed position arrays to a soup. */
export function soupFromIndexed(pos: ArrayLike<number>, index?: ArrayLike<number> | null): Float32Array {
  if (!index) {
    const n = pos.length - (pos.length % 9);
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) out[k] = pos[k];
    return out;
  }
  const out = new Float32Array(index.length * 3);
  for (let k = 0; k < index.length; k++) {
    const v = index[k] * 3;
    out[k * 3] = pos[v];
    out[k * 3 + 1] = pos[v + 1];
    out[k * 3 + 2] = pos[v + 2];
  }
  return out;
}

export function concatSoups(parts: Float32Array[]): Float32Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Float32Array(total);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/**
 * Drop vertices that are far away from everything else: cameras, lights,
 * a stray point at the origin. A single outlier shrinks the real model to a
 * dot when it is scaled to the wall. Keeps triangles whose vertices all lie
 * inside the 0.2–99.8 % range (widened by 25 %) on every axis.
 */
export function dropOutliers(p: Float32Array): Float32Array {
  const n = p.length / 3;
  if (n < 300) return p;
  const lo = [0, 0, 0], hi = [0, 0, 0];
  const sample = Math.min(n, 60000);
  const step = n / sample;
  for (let k = 0; k < 3; k++) {
    const arr = new Float32Array(sample);
    for (let i = 0; i < sample; i++) arr[i] = p[Math.floor(i * step) * 3 + k];
    arr.sort();
    const a = arr[Math.floor(sample * 0.002)];
    const b = arr[Math.ceil(sample * 0.998) - 1];
    const pad = (b - a) * 0.25;
    lo[k] = a - pad;
    hi[k] = b + pad;
  }
  let keep = 0;
  const ok = new Uint8Array(p.length / 9);
  for (let t = 0; t < ok.length; t++) {
    let good = 1;
    for (let v = 0; v < 3 && good; v++) {
      for (let k = 0; k < 3; k++) {
        const c = p[t * 9 + v * 3 + k];
        if (!(c >= lo[k] && c <= hi[k])) { good = 0; break; }
      }
    }
    ok[t] = good;
    keep += good;
  }
  if (keep === ok.length || keep < ok.length * 0.9) return p; // nothing to drop, or it's real geometry
  const out = new Float32Array(keep * 9);
  let o = 0;
  for (let t = 0; t < ok.length; t++) if (ok[t]) { out.set(p.subarray(t * 9, t * 9 + 9), o); o += 9; }
  return out;
}

/**
 * Vertex-clustering simplification: snap vertices to a 3D grid, merge the ones
 * in the same cell and drop triangles that collapse. The finest cell is
 * ~1/1000 of the model size, far finer than an 18 mm slat, so the relief is
 * unchanged while a 4-million-triangle scan becomes workable.
 */
export function simplifySoup(p: Float32Array, maxTris = 500000): Float32Array {
  let tris = p.length / 9;
  if (tris <= maxTris) return p;
  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < p.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const c = p[i + k];
      if (c < mn[k]) mn[k] = c;
      if (c > mx[k]) mx[k] = c;
    }
  }
  const size = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2], 1e-12);
  let G = 700;
  let out = p;
  for (let attempt = 0; attempt < 6; attempt++) {
    const cell = size / G;
    const G1 = G + 2;
    // open-addressing hash: cell key -> merged vertex id
    let cap = 1;
    while (cap < tris * 1.2) cap <<= 1;
    cap = Math.min(cap, 1 << 25);
    const shift = 32 - Math.log2(cap);
    const keys = new Float64Array(cap).fill(-1);
    const vals = new Int32Array(cap);
    const rep = new FloatList(1 << 18);
    const tri = new Int32Array(3);
    const res = new FloatList(Math.min(p.length, maxTris * 9 * 2));
    let full = false;
    for (let t = 0; t < tris && !full; t++) {
      for (let v = 0; v < 3; v++) {
        const o = t * 9 + v * 3;
        const key =
          (Math.floor((p[o] - mn[0]) / cell) * G1 + Math.floor((p[o + 1] - mn[1]) / cell)) * G1 +
          Math.floor((p[o + 2] - mn[2]) / cell);
        let h = Math.imul((key % 4294967296) ^ Math.floor(key / 4294967296), 2654435761) >>> shift;
        let probes = 0;
        while (keys[h] !== -1 && keys[h] !== key) {
          h = (h + 1) & (cap - 1);
          if (++probes > cap) { full = true; break; }
        }
        if (keys[h] === -1) {
          keys[h] = key;
          vals[h] = rep.n / 3;
          rep.push3(p[o], p[o + 1], p[o + 2]);
        }
        tri[v] = vals[h];
      }
      if (tri[0] === tri[1] || tri[1] === tri[2] || tri[0] === tri[2]) continue;
      const r = rep.a;
      for (let v = 0; v < 3; v++) res.push3(r[tri[v] * 3], r[tri[v] * 3 + 1], r[tri[v] * 3 + 2]);
    }
    if (full) { G = Math.floor(G * 0.7); continue; }
    out = res.done();
    if (out.length / 9 <= maxTris) break;
    G = Math.floor(G * 0.7);
  }
  return out;
}

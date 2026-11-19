import type { FrontAxis, HeightMap, WallSettings } from "./types";

/**
 * Rotate the model so the chosen front axis points at the viewer (+Z),
 * then apply the in-plane rotation and optional mirror.
 * Input/output: flat xyz triangle soup.
 */
export function orientPositions(
  src: Float32Array,
  front: FrontAxis,
  rotation: number,
  mirror: boolean
): Float32Array {
  const out = new Float32Array(src.length);
  const rad = (rotation * Math.PI) / 180;
  const c = Math.round(Math.cos(rad) * 1e9) / 1e9;
  const s = Math.round(Math.sin(rad) * 1e9) / 1e9;
  for (let i = 0; i < src.length; i += 3) {
    const x = src[i];
    const y = src[i + 1];
    const z = src[i + 2];
    let a: number, b: number, d: number; // new x, y, z
    switch (front) {
      case "-z": a = -x; b = y; d = -z; break;
      case "+x": a = -z; b = y; d = x; break;
      case "-x": a = z; b = y; d = -x; break;
      case "+y": a = x; b = -z; d = y; break;
      case "-y": a = x; b = z; d = -y; break;
      default: a = x; b = y; d = z; // "+z"
    }
    let rx = a * c - b * s;
    const ry = a * s + b * c;
    if (mirror) rx = -rx;
    out[i] = rx;
    out[i + 1] = ry;
    out[i + 2] = d;
  }
  return out;
}

export interface FitInfo {
  scale: number;
  /** Model size on the wall after scaling, mm */
  sizeX: number;
  sizeY: number;
  sizeZ: number;
}

/**
 * Z-buffer the oriented model onto a grid covering the wall and turn it
 * into a relief height field (0 = wall surface, reliefDepth = closest point).
 */
export function buildHeightMap(
  positions: Float32Array,
  s: WallSettings,
  maxCells = 1400
): { map: HeightMap; fit: FitInfo } {
  const p = orientPositions(positions, s.frontAxis, s.rotation, s.mirror);

  let minx = Infinity, miny = Infinity, minz = Infinity;
  let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], y = p[i + 1], z = p[i + 2];
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    if (z < minz) minz = z; if (z > maxz) maxz = z;
  }
  const bx = Math.max(maxx - minx, 1e-9);
  const by = Math.max(maxy - miny, 1e-9);
  const scale = Math.max(0.01, Math.min(1, s.fill)) * Math.min(s.width / bx, s.height / by);
  const cx = (minx + maxx) / 2;
  const cy = (miny + maxy) / 2;
  const tx = s.width / 2 + s.offsetX;
  const ty = s.height / 2 + s.offsetY;

  const res = Math.max(0.5, Math.max(s.width, s.height) / maxCells);
  const nx = Math.max(1, Math.ceil(s.width / res));
  const ny = Math.max(1, Math.ceil(s.height / res));
  const zb = new Float32Array(nx * ny).fill(-Infinity);

  const gx = (x: number) => ((x - cx) * scale + tx) / res - 0.5;
  const gy = (y: number) => ((y - cy) * scale + ty) / res - 0.5;
  const splat = (X: number, Y: number, Z: number) => {
    const ix = Math.round(X), iy = Math.round(Y);
    if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) return;
    const k = iy * nx + ix;
    if (Z > zb[k]) zb[k] = Z;
  };

  for (let i = 0; i + 8 < p.length; i += 9) {
    const X0 = gx(p[i]), Y0 = gy(p[i + 1]), Z0 = (p[i + 2] - minz) * scale;
    const X1 = gx(p[i + 3]), Y1 = gy(p[i + 4]), Z1 = (p[i + 5] - minz) * scale;
    const X2 = gx(p[i + 6]), Y2 = gy(p[i + 7]), Z2 = (p[i + 8] - minz) * scale;

    const ix0 = Math.max(0, Math.ceil(Math.min(X0, X1, X2)));
    const ix1 = Math.min(nx - 1, Math.floor(Math.max(X0, X1, X2)));
    const iy0 = Math.max(0, Math.ceil(Math.min(Y0, Y1, Y2)));
    const iy1 = Math.min(ny - 1, Math.floor(Math.max(Y0, Y1, Y2)));

    const area = (X1 - X0) * (Y2 - Y0) - (X2 - X0) * (Y1 - Y0);
    if (Math.abs(area) < 1e-12 || ix0 > ix1 || iy0 > iy1) {
      // Degenerate or smaller than a cell: keep its vertices so thin details survive.
      splat(X0, Y0, Z0); splat(X1, Y1, Z1); splat(X2, Y2, Z2);
      continue;
    }
    const inv = 1 / area;
    const eps = -1e-6;
    for (let iy = iy0; iy <= iy1; iy++) {
      for (let ix = ix0; ix <= ix1; ix++) {
        const w0 = ((X1 - ix) * (Y2 - iy) - (X2 - ix) * (Y1 - iy)) * inv;
        if (w0 < eps) continue;
        const w1 = ((X2 - ix) * (Y0 - iy) - (X0 - ix) * (Y2 - iy)) * inv;
        if (w1 < eps) continue;
        const w2 = 1 - w0 - w1;
        if (w2 < eps) continue;
        const z = w0 * Z0 + w1 * Z1 + w2 * Z2;
        const k = iy * nx + ix;
        if (z > zb[k]) zb[k] = z;
      }
    }
  }

  // Relief normalisation
  let zlo = Infinity, zhi = -Infinity, hits = 0;
  const hit = new Uint8Array(nx * ny);
  for (let k = 0; k < zb.length; k++) {
    const z = zb[k];
    if (z !== -Infinity) {
      hit[k] = 1;
      hits++;
      if (z < zlo) zlo = z;
      if (z > zhi) zhi = z;
    }
  }
  const data = new Float32Array(nx * ny);
  const range = zhi - zlo;
  const R = Math.max(0, s.reliefDepth);
  for (let k = 0; k < zb.length; k++) {
    if (!hit[k]) continue;
    const z = zb[k];
    let h: number;
    if (s.depthMode === "true") {
      h = s.invert ? zhi - z : z - zlo;
      h = Math.min(R, h);
    } else if (range < 1e-9) {
      h = R;
    } else {
      const t = (z - zlo) / range;
      h = (s.invert ? 1 - t : t) * R;
    }
    data[k] = h;
  }

  const radius = Math.round(Math.max(0, s.smoothing) / res);
  if (radius > 0) boxBlur(data, nx, ny, radius);

  return {
    map: { nx, ny, res, data, hit, coverage: hits / (nx * ny) },
    fit: { scale, sizeX: bx * scale, sizeY: by * scale, sizeZ: (maxz - minz) * scale },
  };
}

/** Separable box blur, in place. */
function boxBlur(d: Float32Array, nx: number, ny: number, r: number) {
  const tmp = new Float32Array(Math.max(nx, ny));
  const pass = (len: number, get: (i: number) => number, set: (i: number, v: number) => void) => {
    let sum = 0;
    for (let i = -r; i <= r; i++) sum += get(Math.min(len - 1, Math.max(0, i)));
    for (let i = 0; i < len; i++) {
      tmp[i] = sum / (2 * r + 1);
      sum += get(Math.min(len - 1, i + r + 1)) - get(Math.max(0, i - r));
    }
    for (let i = 0; i < len; i++) set(i, tmp[i]);
  };
  for (let y = 0; y < ny; y++) {
    const o = y * nx;
    pass(nx, (i) => d[o + i], (i, v) => (d[o + i] = v));
  }
  for (let x = 0; x < nx; x++) {
    pass(ny, (i) => d[i * nx + x], (i, v) => (d[i * nx + x] = v));
  }
}

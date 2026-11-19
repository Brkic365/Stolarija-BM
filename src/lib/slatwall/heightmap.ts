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

function bounds(p: Float32Array) {
  let minx = Infinity, miny = Infinity, minz = Infinity;
  let maxx = -Infinity, maxy = -Infinity, maxz = -Infinity;
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], y = p[i + 1], z = p[i + 2];
    if (x < minx) minx = x; if (x > maxx) maxx = x;
    if (y < miny) miny = y; if (y > maxy) maxy = y;
    if (z < minz) minz = z; if (z > maxz) maxz = z;
  }
  return { minx, miny, minz, maxx, maxy, maxz };
}

/**
 * Z-buffer a triangle soup into an nx × ny grid. gx/gy map model x/y to grid
 * coordinates (cell centres at integers), gz maps z. Returns -Infinity where
 * nothing was hit.
 */
function zbuffer(
  p: Float32Array,
  nx: number,
  ny: number,
  gx: (x: number) => number,
  gy: (y: number) => number,
  gz: (z: number) => number,
  stride = 1
): Float32Array {
  const zb = new Float32Array(nx * ny).fill(-Infinity);
  const splat = (X: number, Y: number, Z: number) => {
    const ix = Math.round(X), iy = Math.round(Y);
    if (ix < 0 || iy < 0 || ix >= nx || iy >= ny) return;
    const k = iy * nx + ix;
    if (Z > zb[k]) zb[k] = Z;
  };
  const step = 9 * Math.max(1, Math.floor(stride));
  for (let i = 0; i + 8 < p.length; i += step) {
    const X0 = gx(p[i]), Y0 = gy(p[i + 1]), Z0 = gz(p[i + 2]);
    const X1 = gx(p[i + 3]), Y1 = gy(p[i + 4]), Z1 = gz(p[i + 5]);
    const X2 = gx(p[i + 6]), Y2 = gy(p[i + 7]), Z2 = gz(p[i + 8]);

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
  return zb;
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
  const { minx, miny, minz, maxx, maxy, maxz } = bounds(p);
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
  const zb = zbuffer(
    p,
    nx,
    ny,
    (x) => ((x - cx) * scale + tx) / res - 0.5,
    (y) => ((y - cy) * scale + ty) / res - 0.5,
    (z) => (z - minz) * scale
  );

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
  const R = Math.max(0, s.reliefDepth);
  // Only the front part of the model becomes relief; whatever lies behind
  // the cut sits flat on the wall. A full head is mostly "back of the head",
  // so keeping the front ~60% gives the face far more of the available depth.
  const cut = Math.min(1, Math.max(0.05, s.depthCut ?? 1));
  const front = s.invert ? zlo : zhi;
  const span = (zhi - zlo) * cut;
  for (let k = 0; k < zb.length; k++) {
    if (!hit[k]) continue;
    const d = Math.abs(front - zb[k]); // distance behind the frontmost point
    let h: number;
    if (s.depthMode === "true") {
      // Real proportions at wall scale: the front R mm of the model.
      h = Math.max(0, R - d);
    } else if (span < 1e-9) {
      h = R;
    } else {
      h = Math.max(0, 1 - d / span) * R;
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

export interface OrientationPreview {
  axis: FrontAxis;
  /** In-plane rotation that stands this view upright (model "up" pointing up) */
  rotation: 0 | 90 | 180 | 270;
  nx: number;
  ny: number;
  /** 0..1 brightness per cell (1 = closest), -1 = empty; row 0 = bottom. Already rotated upright. */
  data: Float32Array;
}

export interface FrontGuess {
  axis: FrontAxis;
  rotation: 0 | 90 | 180 | 270;
  /** Which way is up in the model file */
  up: FrontAxis;
}

export const FRONT_AXES: FrontAxis[] = ["+z", "-z", "+x", "-x", "-y", "+y"];

const OPPOSITE: Record<FrontAxis, FrontAxis> = { "+x": "-x", "-x": "+x", "+y": "-y", "-y": "+y", "+z": "-z", "-z": "+z" };
const UNIT: Record<FrontAxis, [number, number, number]> = {
  "+x": [1, 0, 0], "-x": [-1, 0, 0], "+y": [0, 1, 0], "-y": [0, -1, 0], "+z": [0, 0, 1], "-z": [0, 0, -1],
};

/** Rotation (0/90/180/270) that makes the model's `up` point up when seen from `front`. */
export function uprightRotation(front: FrontAxis, up: FrontAxis): 0 | 90 | 180 | 270 {
  const u = new Float32Array(UNIT[up]);
  for (const r of [0, 90, 180, 270] as const) {
    const o = orientPositions(u, front, r, false);
    if (o[1] > 0.5) return r;
  }
  return 0;
}

/** Rotate a row-0-at-bottom grid by 90° steps, counter-clockwise like orientPositions. */
function rotateGrid(data: Float32Array, nx: number, ny: number, r: number) {
  if (r === 0) return { data, nx, ny };
  const tx = r === 180 ? nx : ny;
  const ty = r === 180 ? ny : nx;
  const out = new Float32Array(tx * ty);
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++) {
      let X: number, Y: number;
      if (r === 90) { X = ny - 1 - y; Y = x; }
      else if (r === 180) { X = nx - 1 - x; Y = ny - 1 - y; }
      else { X = y; Y = nx - 1 - x; }
      out[Y * tx + X] = data[y * nx + x];
    }
  }
  return { data: out, nx: tx, ny: ty };
}

interface ViewStats {
  axis: FrontAxis;
  nx: number;
  ny: number;
  data: Float32Array;
  /** silhouette area in model units² */
  area: number;
  /** depth range in preview pixels, to turn 0..1 depth back into geometry */
  rpx: number;
}

function renderView(positions: Float32Array, axis: FrontAxis, size: number, stride: number): ViewStats {
  const p = orientPositions(positions, axis, 0, false);
  const b = bounds(p);
  const bx = Math.max(b.maxx - b.minx, 1e-9);
  const by = Math.max(b.maxy - b.miny, 1e-9);
  const sc = (size - 1) / Math.max(bx, by);
  const nx = Math.max(2, Math.round(bx * sc) + 1);
  const ny = Math.max(2, Math.round(by * sc) + 1);
  const zb = zbuffer(p, nx, ny, (x) => (x - b.minx) * sc, (y) => (y - b.miny) * sc, (z) => z, stride);
  let zlo = Infinity, zhi = -Infinity, hits = 0;
  for (let k = 0; k < zb.length; k++) {
    const z = zb[k];
    if (z !== -Infinity) { hits++; if (z < zlo) zlo = z; if (z > zhi) zhi = z; }
  }
  const range = Math.max(zhi - zlo, 1e-9);
  const data = new Float32Array(nx * ny).fill(-1);
  for (let k = 0; k < zb.length; k++) if (zb[k] !== -Infinity) data[k] = (zb[k] - zlo) / range;
  return { axis, nx, ny, data, area: (hits / (nx * ny)) * bx * by, rpx: range * sc };
}

/**
 * Surface measures on one depth view, away from the silhouette edge:
 * flat = share of perfectly flat cells (a sawn-off base or the back of a plaque),
 * hollows = share of concave cells (eye sockets, mouth, folds; the back of a head has none),
 * detail = mean curvature.
 */
function surfaceStats(v: { nx: number; ny: number; data: Float32Array; rpx: number }) {
  const { nx, ny, data, rpx } = v;
  const E = 3;
  let n = 0, flat = 0, hollows = 0, detail = 0;
  for (let y = E; y < ny - E; y++) {
    for (let x = E; x < nx - E; x++) {
      let edge = false;
      for (let dy = -E; dy <= E && !edge; dy++)
        for (let dx = -E; dx <= E; dx++)
          if (data[(y + dy) * nx + x + dx] < 0) { edge = true; break; }
      if (edge) continue;
      const k = y * nx + x;
      const c = data[k], l = data[k - 1], r = data[k + 1], u = data[k + nx], d = data[k - nx];
      const L = (l + r + u + d - 4 * c) * rpx;
      n++;
      detail += Math.min(0.3, Math.abs(L));
      if (L > 0.1) hollows++;
      if (Math.abs(L) < 0.02 && Math.abs(r - l) * rpx < 0.05 && Math.abs(u - d) * rpx < 0.05) flat++;
    }
  }
  return n ? { flat: flat / n, hollows: hollows / n, detail: detail / n } : { flat: 0, hollows: 0, detail: 0 };
}

/** Left/right mirror similarity of an upright view (faces and figures are symmetric from the front and back, not from the side). */
function symmetry(v: { nx: number; ny: number; data: Float32Array }) {
  const { nx, ny, data } = v;
  let hits = 0, cx = 0;
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) if (data[y * nx + x] >= 0) { hits++; cx += x; }
  if (!hits) return 0;
  cx /= hits;
  let best = 0;
  const span = Math.round(nx * 0.1);
  for (let c2 = Math.round(2 * cx) - span; c2 <= Math.round(2 * cx) + span; c2++) {
    let u = 0, diff = 0;
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const a = data[y * nx + x];
        const xm = c2 - x;
        const b = xm >= 0 && xm < nx ? data[y * nx + xm] : -1;
        if (a < 0 && b < 0) continue;
        u++;
        diff += a < 0 || b < 0 ? 1 : Math.min(1, Math.abs(a - b) * 4);
      }
    }
    const S = u ? 1 - diff / u : 0;
    if (S > best) best = S;
  }
  return best;
}

/**
 * Front-versus-back vote between two opposite views. Fitted on 18 scanned
 * heads, busts and statues (all heads and busts right, a few full statues not): the front has more surface detail and fewer
 * cells right at the nearest depth (a nose and chin, not a round skull or a
 * flat back).
 */
function faceScore(
  st: { hollows: number; detail: number; flat: number },
  p: { nx: number; ny: number; data: Float32Array }
) {
  let h = 0, near = 0, mean = 0;
  let x0 = Infinity, x1 = -Infinity;
  for (let y = 0; y < p.ny; y++) {
    for (let x = 0; x < p.nx; x++) {
      const v = p.data[y * p.nx + x];
      if (v < 0) continue;
      h++;
      mean += v;
      if (v > 0.9) near++;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
    }
  }
  if (!h) return -Infinity;
  // Where the nearest points sit: a nose is on the centre line, the rim of a
  // hollow mask seen from behind is not.
  const cx = (x0 + x1) / 2, half = Math.max(1, (x1 - x0) / 2);
  let off = 0, nTop = 0;
  for (let y = 0; y < p.ny; y++) {
    for (let x = 0; x < p.nx; x++) {
      if (p.data[y * p.nx + x] > 0.95) { off += Math.abs(x - cx) / half; nTop++; }
    }
  }
  const offCentre = nTop ? off / nTop : 0;
  return 5 * st.detail - 0.5 * (near / h) + mean / h - st.hollows - 2 * st.flat - 0.3 * offCentre;
}

/**
 * Six small depth previews of the model, each stood upright, plus a guess of
 * which side is the front and which way is up.
 *
 * Up: a flat sawn-off base gives it away; otherwise the taller of Y/Z
 * (OBJ/glTF are usually Y-up, scans and STL often Z-up); a flat plaque faces
 * along its thin axis. Front: of the four side views, the left/right
 * symmetric pair (front + back, not the profiles); then the one of the two
 * with hollows (eyes, mouth, folds) rather than the smooth back.
 */
export function orientationPreviews(
  positions: Float32Array,
  size = 112
): { previews: OrientationPreview[]; guess: FrontGuess } {
  const tris = positions.length / 9;
  const stride = Math.max(1, Math.floor(tris / 400000));
  const views = FRONT_AXES.map((a) => renderView(positions, a, size, stride));
  const stats = views.map((v) => surfaceStats(v));

  let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    for (let k = 0; k < 3; k++) {
      const c = positions[i + k];
      if (c < mn[k]) mn[k] = c;
      if (c > mx[k]) mx[k] = c;
    }
  }
  const ext = [0, 1, 2].map((k) => mx[k] - mn[k]);
  const sorted = [...ext].sort((a, b) => a - b);
  const AX = ["x", "y", "z"] as const;

  const idx = (a: FrontAxis) => FRONT_AXES.indexOf(a);
  const amax = Math.max(...views.map((v) => v.area), 1e-12);
  const flatIdx = stats.reduce((bi, s, i) => (s.flat > stats[bi].flat ? i : bi), 0);
  const thinK = ext.indexOf(sorted[0]);
  const isPlaque = sorted[0] < 0.45 * sorted[1];

  // Possible "up" directions. A sawn-off base settles it; otherwise try Y and
  // Z (and X for a plaque lying on its side) and keep whichever stands the
  // model up symmetrically.
  let ups: FrontAxis[];
  if (isPlaque) ups = [AX[thinK] === "y" ? "+z" : "+y"];
  else if (stats[flatIdx].flat > 0.5) ups = [OPPOSITE[FRONT_AXES[flatIdx]]];
  else ups = ["+y", "+z"];

  const upright = (axis: FrontAxis, up: FrontAxis) => {
    const v = views[idx(axis)];
    const rotation = axis[1] === up[1] ? 0 : uprightRotation(axis, up);
    const g = rotateGrid(v.data, v.nx, v.ny, rotation);
    return { axis, rotation, nx: g.nx, ny: g.ny, data: g.data } as OrientationPreview;
  };

  let best: { axis: FrontAxis; up: FrontAxis; score: number } = { axis: "+z", up: "+y", score: -Infinity };
  for (const up of ups) {
    const cands: FrontAxis[] = isPlaque
      ? ([`+${AX[thinK]}`, `-${AX[thinK]}`] as FrontAxis[])
      : FRONT_AXES.filter((a) => a[1] !== up[1]);
    const prev = new Map(cands.map((a) => [a, upright(a, up)]));
    const sym = new Map(cands.map((a) => [a, symmetry(prev.get(a)!)]));
    for (const a of cands) {
      const o = OPPOSITE[a];
      const pair = (((sym.get(a) ?? 0) + (sym.get(o) ?? 0)) / 2) * Math.sqrt(views[idx(a)].area / amax);
      const face = faceScore(stats[idx(a)], prev.get(a)!);
      const faceO = faceScore(stats[idx(o)], prev.get(o)!);
      // Y-up is the most common convention, so it wins a near tie.
      const score = pair * 10 + (face > faceO ? 1 : 0) + (up === "+y" ? 0.2 : 0);
      if (score > best.score) best = { axis: a, up, score };
    }
  }
  const up = best.up;
  const previews = views.map((v) => upright(v.axis, up));
  return { previews, guess: { axis: best.axis, rotation: previews[idx(best.axis)].rotation, up } };
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

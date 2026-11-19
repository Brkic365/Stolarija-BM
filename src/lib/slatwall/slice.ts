import type { HeightMap, Part, Pt, Slat, WallSettings } from "./types";

export interface SliceResult {
  slats: Slat[];
  parts: Part[];
  warnings: string[];
}

/** Positions of slat near faces along the wall, centred. */
export function slatPositions(span: number, t: number, gap: number): number[] {
  if (t <= 0) return [];
  const n = Math.max(0, Math.floor((span + gap) / (t + gap) + 1e-9));
  const used = n * t + Math.max(0, n - 1) * gap;
  const start = (span - used) / 2;
  return Array.from({ length: n }, (_, i) => start + i * (t + gap));
}

/** Douglas–Peucker polyline simplification. */
export function simplify(pts: Pt[], tol: number): Pt[] {
  if (pts.length <= 2) return pts.slice();
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = pts[a];
    const [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay;
    const len = Math.hypot(dx, dy) || 1;
    let best = -1, bestD = tol;
    for (let i = a + 1; i < b; i++) {
      const d = Math.abs(dy * (pts[i][0] - ax) - dx * (pts[i][1] - ay)) / len;
      if (d > bestD) { bestD = d; best = i; }
    }
    if (best >= 0) {
      keep[best] = 1;
      stack.push([a, best], [best, b]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

function interpAt(front: Pt[], u: number): number {
  if (u <= front[0][0]) return front[0][1];
  for (let i = 1; i < front.length; i++) {
    const [u1, v1] = front[i];
    if (u <= u1) {
      const [u0, v0] = front[i - 1];
      const t = u1 - u0 < 1e-12 ? 0 : (u - u0) / (u1 - u0);
      return v0 + (v1 - v0) * t;
    }
  }
  return front[front.length - 1][1];
}

/** Part of the front polyline between u0 and u1, shifted so it starts at 0. */
function clipFront(front: Pt[], u0: number, u1: number): Pt[] {
  const out: Pt[] = [[0, interpAt(front, u0)]];
  for (const [u, v] of front) if (u > u0 + 1e-6 && u < u1 - 1e-6) out.push([u - u0, v]);
  out.push([u1 - u0, interpAt(front, u1)]);
  return out;
}

export function polygonArea(poly: Pt[]): number {
  let a = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  }
  return Math.abs(a / 2);
}

/** Notch centres along a slat of the given length (same for every slat so battens line up). */
export function notchCentres(s: WallSettings, length: number): number[] {
  if (!s.notches.enabled || s.notches.count <= 0) return [];
  const n = Math.round(s.notches.count);
  return Array.from({ length: n }, (_, k) => (length * (k + 1)) / (n + 1));
}

/**
 * Slice the height map into slat profiles and cut them into parts that fit
 * on a sheet (`maxPartLength`).
 */
export function sliceWall(hm: HeightMap, s: WallSettings, maxPartLength: number): SliceResult {
  const warnings: string[] = [];
  const vertical = s.direction === "vertical";
  const span = vertical ? s.width : s.height;
  const length = vertical ? s.height : s.width;
  const t = s.slatThickness;
  const positions = slatPositions(span, t, s.gap);
  const { nx, ny, res, data } = hm;

  const notchW = s.notches.width;
  const notchD = s.notches.depth;
  let centres = notchCentres(s, length);
  if (centres.length && notchD >= s.baseDepth - 3) {
    warnings.push(
      `Utori (${notchD} mm) su predubi za osnovnu dubinu lamele (${s.baseDepth} mm), pa su izostavljeni.`
    );
    centres = [];
  }

  // Split points for slats longer than a sheet; avoid cutting through a notch.
  const pieces = Math.max(1, Math.ceil(length / Math.max(1, maxPartLength) - 1e-9));
  const splits: number[] = [0];
  for (let k = 1; k < pieces; k++) {
    let at = (length * k) / pieces;
    for (const c of centres) {
      if (Math.abs(at - c) < notchW / 2 + 15) at = c + notchW / 2 + 15;
    }
    splits.push(at);
  }
  splits.push(length);
  if (pieces > 1) {
    warnings.push(
      `Lamele su duže od ploče (${Math.round(length)} mm), pa je svaka podijeljena na ${pieces} dijela (A, B…).`
    );
  }

  const slats: Slat[] = [];
  const parts: Part[] = [];
  const cells = vertical ? ny : nx;

  positions.forEach((pos, i) => {
    // Cells across the slat thickness
    const a0 = Math.max(0, Math.floor(pos / res));
    const a1 = Math.min((vertical ? nx : ny) - 1, Math.ceil((pos + t) / res) - 1);
    const raw: Pt[] = [];
    for (let k = 0; k < cells; k++) {
      let h = 0;
      for (let a = a0; a <= a1; a++) {
        const idx = vertical ? k * nx + a : a * nx + k;
        if (data[idx] > h) h = data[idx];
      }
      raw.push([Math.min(length, (k + 0.5) * res), s.baseDepth + h]);
    }
    if (!raw.length) return;
    const full: Pt[] = [[0, raw[0][1]], ...raw, [length, raw[raw.length - 1][1]]];
    const front = simplify(full, 0.25);

    const slat: Slat = {
      number: i + 1,
      position: pos,
      length,
      maxDepth: Math.max(...front.map((p) => p[1])),
      parts: [],
    };

    for (let pi = 0; pi < pieces; pi++) {
      const u0 = splits[pi];
      const u1 = splits[pi + 1];
      const L = u1 - u0;
      const pf = clipFront(front, u0, u1);
      const poly: Pt[] = [[0, 0]];
      const local = centres
        .map((c) => c - u0)
        .filter((c) => c - notchW / 2 > 5 && c + notchW / 2 < L - 5);
      for (const c of local) {
        poly.push([c - notchW / 2, 0], [c - notchW / 2, notchD], [c + notchW / 2, notchD], [c + notchW / 2, 0]);
      }
      poly.push([L, 0]);
      for (let k = pf.length - 1; k >= 0; k--) poly.push([pf[k][0], pf[k][1]]);

      // Label inside the solid back strip, away from notches
      const candidates = [L / 2, L / 3, (2 * L) / 3, L / 4, (3 * L) / 4];
      let labelU = L / 2, bestDist = -1;
      for (const c of candidates) {
        const d = local.length ? Math.min(...local.map((n) => Math.abs(n - c))) : Infinity;
        if (d > bestDist + 1) { bestDist = d; labelU = c; }
      }
      const depths = pf.map((p) => p[1]);
      const part: Part = {
        id: pieces > 1 ? `${i + 1}${String.fromCharCode(65 + pi)}` : `${i + 1}`,
        slat: i + 1,
        piece: pi,
        pieces,
        offset: u0,
        length: L,
        maxDepth: Math.max(...depths),
        minDepth: Math.min(...depths),
        polygon: poly,
        front: pf,
        area: polygonArea(poly),
        label: [labelU, (local.length ? Math.max(notchD, 0) : 0) + (s.baseDepth - (local.length ? notchD : 0)) / 2],
      };
      slat.parts.push(part);
      parts.push(part);
    }
    slats.push(slat);
  });

  if (!positions.length) warnings.push("Zid je preuzak za barem jednu lamelu.");
  return { slats, parts, warnings };
}

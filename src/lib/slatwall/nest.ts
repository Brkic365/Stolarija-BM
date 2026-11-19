import type { Part, Placement, Pt, SheetLayout, SheetSettings } from "./types";

const STEP = 2; // skyline resolution, mm

/**
 * Upper envelope of a part's front edge, sampled per STEP cell along the
 * sheet. With `flip` the part is rotated 180°, so u runs backwards.
 */
function envelope(front: Pt[], L: number, flip: boolean): Float32Array {
  const n = Math.max(1, Math.ceil(L / STEP - 1e-9));
  const e = new Float32Array(n);
  const cell = (u: number) => Math.min(n - 1, Math.max(0, Math.floor((flip ? L - u : u) / STEP)));
  for (let i = 1; i < front.length; i++) {
    const [ua, va] = front[i - 1];
    const [ub, vb] = front[i];
    const v = Math.max(va, vb);
    let k0 = cell(ua), k1 = cell(ub);
    if (k0 > k1) [k0, k1] = [k1, k0];
    for (let k = k0; k <= k1; k++) if (v > e[k]) e[k] = v;
  }
  return e;
}

interface SheetState {
  sky: Float32Array; // top of material per cell (0 = nothing yet)
  occ: Uint8Array;
  skyD: Float32Array; // sky dilated by spacing, what a new part must clear
  layout: SheetLayout;
}

function refreshDilated(st: SheetState, spacing: number) {
  const n = st.sky.length;
  const r = Math.ceil(spacing / STEP);
  for (let k = 0; k < n; k++) {
    let m = -1;
    for (let j = Math.max(0, k - r); j <= Math.min(n - 1, k + r); j++) {
      if (st.occ[j] && st.sky[j] > m) m = st.sky[j];
    }
    st.skyD[k] = m < 0 ? 0 : m + spacing;
  }
}

interface Candidate {
  x0: number;
  flipped: boolean;
  /** For normal: back edge y. For flipped: back edge y (top). */
  y: number;
  top: number;
}

function bestOnSheet(
  st: SheetState,
  envN: Float32Array,
  envF: Float32Array,
  maxN: number,
  usableH: number
): Candidate | null {
  const n = st.sky.length;
  const nL = envN.length;
  if (nL > n) return null;
  const stride = Math.max(1, Math.round(20 / STEP));
  const xs: number[] = [];
  for (let x = 0; x <= n - nL; x += stride) xs.push(x);
  if (xs[xs.length - 1] !== n - nL) xs.push(n - nL);

  let best: Candidate | null = null;
  for (const x0 of xs) {
    // Normal: straight back edge down
    let y = 0;
    for (let k = 0; k < nL; k++) if (st.skyD[x0 + k] > y) y = st.skyD[x0 + k];
    const topN = y + maxN;
    if (topN <= usableH && (!best || topN < best.top - 1e-6)) best = { x0, flipped: false, y, top: topN };

    // Flipped: relief edge faces down into the gaps of the part below
    let yt = 0;
    for (let k = 0; k < nL; k++) {
      const need = st.skyD[x0 + k] + envF[k];
      if (need > yt) yt = need;
    }
    if (yt <= usableH && (!best || yt < best.top - 1e-6)) best = { x0, flipped: true, y: yt, top: yt };
  }
  return best;
}

export interface NestResult {
  sheets: SheetLayout[];
  unplaced: Part[];
}

/**
 * Skyline nesting of profile strips on rectangular sheets. Every part keeps
 * its length along the sheet's long side (grain). Parts may be rotated 180°
 * so a relief edge drops into the valleys of the part below it.
 */
export function nestParts(parts: Part[], sheet: SheetSettings): NestResult {
  const usableL = sheet.length - 2 * sheet.margin;
  const usableH = sheet.width - 2 * sheet.margin;
  const nCells = Math.max(1, Math.floor(usableL / STEP));
  const sorted = parts
    .slice()
    .sort((a, b) => b.length - a.length || a.slat - b.slat || a.piece - b.piece);

  const states: SheetState[] = [];
  const unplaced: Part[] = [];
  const newSheet = (): SheetState => {
    const st: SheetState = {
      sky: new Float32Array(nCells),
      occ: new Uint8Array(nCells),
      skyD: new Float32Array(nCells),
      layout: { index: states.length + 1, placements: [], partArea: 0, usedHeight: 0 },
    };
    states.push(st);
    return st;
  };

  for (const part of sorted) {
    const envN = envelope(part.front, part.length, false);
    const envF = envelope(part.front, part.length, true);
    let maxN = 0;
    for (let k = 0; k < envN.length; k++) if (envN[k] > maxN) maxN = envN[k];

    let target: SheetState | null = null;
    let cand: Candidate | null = null;
    for (const st of states) {
      cand = bestOnSheet(st, envN, envF, maxN, usableH);
      if (cand) { target = st; break; }
    }
    if (!target) {
      const st = newSheet();
      cand = bestOnSheet(st, envN, envF, maxN, usableH);
      if (!cand) {
        states.pop();
        unplaced.push(part);
        continue;
      }
      target = st;
    }
    const c = cand!;
    const env = c.flipped ? envF : envN;
    for (let k = 0; k < env.length; k++) {
      target.sky[c.x0 + k] = c.flipped ? c.y : c.y + env[k];
      target.occ[c.x0 + k] = 1;
    }
    refreshDilated(target, sheet.spacing);
    target.layout.placements.push({
      part,
      x: sheet.margin + c.x0 * STEP,
      y: sheet.margin + c.y,
      flipped: c.flipped,
    });
    target.layout.partArea += part.area;
    target.layout.usedHeight = Math.max(target.layout.usedHeight, c.top);
  }

  return { sheets: states.map((s) => s.layout), unplaced };
}

/** Map a point in part coordinates to sheet coordinates. */
export function toSheet(pl: Placement, [u, v]: Pt): Pt {
  return pl.flipped ? [pl.x + pl.part.length - u, pl.y - v] : [pl.x + u, pl.y + v];
}

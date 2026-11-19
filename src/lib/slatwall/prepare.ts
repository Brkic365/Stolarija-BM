import { orientationPreviews, type FrontGuess, type OrientationPreview } from "./heightmap";
import { dropOutliers, parseOBJ, parseSTL, simplifySoup, soupFromIndexed } from "./parse";

/** Model ready for the tool: a soup small enough to slice interactively, plus orientation previews. */
export interface PreparedModel {
  positions: Float32Array;
  triangles: number;
  /** Triangle count in the file, before simplification */
  sourceTriangles: number;
  previews: OrientationPreview[];
  guess: FrontGuess;
}

export type Progress = (msg: string) => void;

/** Above this the mesh is simplified; the relief is sampled on a ~2 mm grid anyway. */
export const MAX_WORKING_TRIANGLES = 500000;

const fmt = (n: number) => n.toLocaleString("hr-HR");

export function prepareSoup(soup: Float32Array, progress: Progress = () => {}): PreparedModel {
  const sourceTriangles = soup.length / 9;
  if (sourceTriangles < 1) throw new Error("Datoteka ne sadrži trokute.");
  let p = dropOutliers(soup);
  if (p.length / 9 > MAX_WORKING_TRIANGLES) {
    progress(`Pojednostavljujem ${fmt(sourceTriangles)} trokuta…`);
    p = simplifySoup(p, MAX_WORKING_TRIANGLES);
  }
  progress("Tražim prednju stranu…");
  const { previews, guess } = orientationPreviews(p);
  return { positions: p, triangles: p.length / 9, sourceTriangles, previews, guess };
}

/** Formats that can be read without the DOM (and so inside the worker). */
export const WORKER_FORMATS = ["stl", "obj", "ply"];

export async function parseInWorkerFormat(ext: string, buf: ArrayBuffer): Promise<Float32Array> {
  if (ext === "stl") return parseSTL(buf);
  if (ext === "obj") return parseOBJ(buf);
  if (ext === "ply") {
    const { PLYLoader } = await import("three/examples/jsm/loaders/PLYLoader.js");
    const g = new PLYLoader().parse(buf);
    const pos = g.getAttribute("position");
    if (!g.index && pos.count % 3 !== 0) throw new Error("PLY datoteka sadrži samo točke, bez trokuta.");
    return soupFromIndexed(pos.array as ArrayLike<number>, g.index ? (g.index.array as ArrayLike<number>) : null);
  }
  throw new Error(`Format .${ext} nije podržan.`);
}

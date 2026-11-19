import { unzipSync } from "fflate";
import { concatSoups, soupFromIndexed } from "./parse";
import { prepareSoup, WORKER_FORMATS, type PreparedModel, type Progress } from "./prepare";

export interface LoadedModel extends PreparedModel {
  name: string;
  /** Fixed front for built-in presets; otherwise the guess is used */
  preset?: boolean;
}

export const ACCEPTED_FORMATS = ["stl", "obj", "ply", "glb", "gltf", "fbx", "3mf", "zip"];
export const ACCEPT_ATTR = ACCEPTED_FORMATS.map((e) => "." + e).join(",");

const extOf = (name: string) => name.toLowerCase().split(".").pop() || "";
const fmtMB = (b: number) => (b / 1e6).toLocaleString("hr-HR", { maximumFractionDigits: 1 }) + " MB";

// ---------------------------------------------------------------------------
// Worker plumbing. Falls back to the main thread where workers aren't available.

let worker: Worker | null = null;
let nextId = 1;
const pending = new Map<number, { resolve: (m: PreparedModel) => void; reject: (e: Error) => void; progress: Progress }>();

function getWorker(): Worker | null {
  if (typeof window === "undefined" || typeof Worker === "undefined") return null;
  if (worker) return worker;
  try {
    worker = new Worker(new URL("./model.worker.ts", import.meta.url));
    worker.onmessage = (e: MessageEvent) => {
      const { id, progress, result, error } = e.data || {};
      const job = pending.get(id);
      if (!job) return;
      if (progress) return job.progress(progress);
      pending.delete(id);
      if (error) job.reject(new Error(error));
      else job.resolve(result);
    };
    worker.onerror = (e) => {
      // A crashed worker (usually out of memory) fails every waiting job
      const err = new Error(e.message || "Model je prevelik za ovaj preglednik.");
      pending.forEach((j) => j.reject(err));
      pending.clear();
      worker?.terminate();
      worker = null;
    };
  } catch {
    worker = null;
  }
  return worker;
}

function runInWorker(msg: any, transfer: Transferable[], progress: Progress): Promise<PreparedModel> | null {
  const w = getWorker();
  if (!w) return null;
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, progress });
    w.postMessage({ ...msg, id }, transfer);
  });
}

async function prepareFromBuffer(ext: string, buf: ArrayBuffer, progress: Progress): Promise<PreparedModel> {
  const viaWorker = runInWorker({ kind: "file", ext, buf }, [buf], progress);
  if (viaWorker) return viaWorker;
  const { parseInWorkerFormat } = await import("./prepare");
  return prepareSoup(await parseInWorkerFormat(ext, buf), progress);
}

async function prepareFromSoup(soup: Float32Array, progress: Progress): Promise<PreparedModel> {
  const viaWorker = runInWorker({ kind: "soup", positions: soup }, [soup.buffer], progress);
  if (viaWorker) return viaWorker;
  return prepareSoup(soup, progress);
}

// ---------------------------------------------------------------------------
// Formats that need three.js loaders with DOM access (textures, XML).

async function soupFromObject3D(root: any): Promise<Float32Array> {
  root.updateMatrixWorld(true);
  const parts: Float32Array[] = [];
  root.traverse((o: any) => {
    if (!o.isMesh || !o.geometry) return;
    const g = o.geometry.clone();
    g.applyMatrix4(o.matrixWorld);
    const pos = g.getAttribute("position");
    if (!pos) return;
    parts.push(soupFromIndexed(pos.array, g.index ? g.index.array : null));
    g.dispose();
  });
  if (!parts.length) throw new Error("U datoteci nema mreže trokuta.");
  return concatSoups(parts);
}

async function parseDomFormat(ext: string, buf: ArrayBuffer, files?: Map<string, Uint8Array>): Promise<Float32Array> {
  if (ext === "glb" || ext === "gltf") {
    const THREE = await import("three");
    const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
    const manager = new THREE.LoadingManager();
    const urls: string[] = [];
    if (files) {
      // .gltf from a zip: point its external .bin/textures at the zip contents
      manager.setURLModifier((url) => {
        const name = decodeURIComponent(url.split("/").pop() || url);
        const hit = Array.from(files.entries()).find(([k]) => k.split("/").pop() === name);
        if (!hit) return url;
        const u = URL.createObjectURL(new Blob([hit[1] as BlobPart]));
        urls.push(u);
        return u;
      });
    }
    const loader = new GLTFLoader(manager);
    try {
      const gltf: any = await new Promise((res, rej) => loader.parse(buf, "", res, rej));
      return soupFromObject3D(gltf.scene);
    } catch (e: any) {
      if (String(e?.message || e).includes("DRACO") || String(e?.message || e).includes("KHR_draco"))
        throw new Error("Ovaj GLB je komprimiran (Draco). Izvezite ga bez kompresije ili kao STL/OBJ.");
      throw e;
    } finally {
      urls.forEach((u) => URL.revokeObjectURL(u));
    }
  }
  if (ext === "fbx") {
    const { FBXLoader } = await import("three/examples/jsm/loaders/FBXLoader.js");
    return soupFromObject3D(new FBXLoader().parse(buf, ""));
  }
  if (ext === "3mf") {
    const { ThreeMFLoader } = await import("three/examples/jsm/loaders/3MFLoader.js");
    return soupFromObject3D(new ThreeMFLoader().parse(buf));
  }
  throw new Error(`Format .${ext} nije podržan. Koristite STL, OBJ, PLY, GLB, FBX ili 3MF.`);
}

const toBuffer = (u: Uint8Array): ArrayBuffer => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer;

/** Biggest model file inside a zip (Thingiverse, Sketchfab and scan downloads come zipped). */
async function prepareZip(buf: ArrayBuffer, progress: Progress): Promise<{ inner: string; model: PreparedModel }> {
  progress("Raspakiravam ZIP…");
  const files = new Map(Object.entries(unzipSync(new Uint8Array(buf))).filter(([k]) => !k.startsWith("__MACOSX")));
  const order = ["glb", "gltf", "obj", "stl", "ply", "fbx", "3mf"];
  const candidates = Array.from(files.entries())
    .filter(([k]) => order.includes(extOf(k)))
    .sort((a, b) => b[1].length - a[1].length);
  if (!candidates.length) throw new Error("U ZIP-u nema STL, OBJ, PLY, GLB, FBX ni 3MF datoteke.");
  const [inner, data] = candidates[0];
  const ext = extOf(inner);
  const model = WORKER_FORMATS.includes(ext)
    ? await prepareFromBuffer(ext, toBuffer(data), progress)
    : await prepareFromSoup(await parseDomFormat(ext, toBuffer(data), files), progress);
  return { inner: inner.split("/").pop() || inner, model };
}

export async function loadModelFile(file: File, progress: Progress = () => {}): Promise<LoadedModel> {
  const ext = extOf(file.name);
  if (!ACCEPTED_FORMATS.includes(ext))
    throw new Error(`Format .${ext} nije podržan. Koristite STL, OBJ, PLY, GLB, FBX, 3MF ili ZIP.`);
  progress(`Učitavam ${fmtMB(file.size)}…`);
  const buf = await file.arrayBuffer();
  if (ext === "zip") {
    const { model } = await prepareZip(buf, progress);
    return { ...model, name: file.name };
  }
  const model = WORKER_FORMATS.includes(ext)
    ? await prepareFromBuffer(ext, buf, progress)
    : await prepareFromSoup(await parseDomFormat(ext, buf), progress);
  return { ...model, name: file.name };
}

// ---------------------------------------------------------------------------
// Built-in presets: compact quantised meshes in /public/models/lamele.

export interface Preset {
  id: string;
  name: string;
  kind: string;
  credit: string;
}

export const PRESETS: Preset[] = [
  { id: "glava", name: "Glava", kind: "3D sken glave", credit: "Lee Perry-Smith, Infinite Realities, CC BY 3.0" },
  { id: "platon", name: "Platon", kind: "bista", credit: "Three D Scans" },
  { id: "gutenberg", name: "Gutenberg", kind: "bista", credit: "Three D Scans" },
  { id: "herma", name: "Filozof", kind: "herma, glava i prsa", credit: "Three D Scans" },
  { id: "atena", name: "Atena", kind: "kip", credit: "Three D Scans" },
  { id: "nimfa", name: "Nimfa", kind: "kip", credit: "Three D Scans" },
];

/**
 * Preset format (gzipped): "BMSH", vertex count, triangle count (uint32),
 * bounding box min and size (6 × float32), vertices quantised to uint16,
 * triangle indices as uint32. Y-up, front +Z.
 */
export function decodePreset(gz: Uint8Array, gunzip: (d: Uint8Array) => Uint8Array): Float32Array {
  const raw = gunzip(gz);
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  if (dv.getUint32(0, true) !== 0x48534d42) throw new Error("Neispravna datoteka primjera.");
  const nv = dv.getUint32(4, true);
  const nt = dv.getUint32(8, true);
  const min = [0, 1, 2].map((k) => dv.getFloat32(12 + k * 4, true));
  const size = [0, 1, 2].map((k) => dv.getFloat32(24 + k * 4, true));
  const vOff = 36;
  const iOff = vOff + nv * 6 + ((nv * 6) % 4 ? 4 - ((nv * 6) % 4) : 0);
  const verts = new Float32Array(nv * 3);
  for (let i = 0; i < nv * 3; i++) {
    const k = i % 3;
    verts[i] = min[k] + (dv.getUint16(vOff + i * 2, true) / 65535) * size[k];
  }
  const out = new Float32Array(nt * 9);
  for (let t = 0; t < nt * 3; t++) {
    const v = dv.getUint32(iOff + t * 4, true) * 3;
    out[t * 3] = verts[v];
    out[t * 3 + 1] = verts[v + 1];
    out[t * 3 + 2] = verts[v + 2];
  }
  return out;
}

export async function loadPreset(p: Preset, progress: Progress = () => {}): Promise<LoadedModel> {
  progress(`Učitavam primjer: ${p.name}…`);
  const res = await fetch(`/models/lamele/${p.id}.bin`);
  if (!res.ok) throw new Error("Primjer nije moguće učitati.");
  const { gunzipSync } = await import("fflate");
  const soup = decodePreset(new Uint8Array(await res.arrayBuffer()), gunzipSync);
  const model = await prepareFromSoup(soup, progress);
  // Presets are stored facing +Z, upright; keep that instead of guessing.
  const front = model.previews.find((v) => v.axis === "+z");
  return {
    ...model,
    guess: { axis: "+z", rotation: front?.rotation ?? 0, up: "+y" },
    name: p.name,
    preset: true,
  };
}

/**
 * Built-in sample so the tool can be tried without a file: a dome with
 * ripples, like a stone dropped into water. Y-up, front +Z.
 */
export function demoModel(): LoadedModel {
  const n = 240;
  const size = 1000;
  const z = (x: number, y: number) => {
    const r = Math.hypot(x, y) / (size / 2);
    const dome = Math.max(0, 1 - r * r) * 0.55;
    const ripple = 0.45 * (0.5 + 0.5 * Math.cos(r * Math.PI * 5)) * Math.max(0, 1 - r);
    const wave = 0.12 * (0.5 + 0.5 * Math.sin((x / size) * Math.PI * 3 + (y / size) * 2));
    return (dome + ripple + wave) * 220;
  };
  const positions = new Float32Array(n * n * 18);
  let o = 0;
  const P = (i: number, j: number) => {
    const x = (i / n - 0.5) * size;
    const y = (j / n - 0.5) * size;
    positions[o++] = x;
    positions[o++] = y;
    positions[o++] = z(x, y);
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      P(i, j); P(i + 1, j); P(i + 1, j + 1);
      P(i, j); P(i + 1, j + 1); P(i, j + 1);
    }
  }
  const m = prepareSoup(positions);
  return { ...m, guess: { axis: "+z", rotation: 0, up: "+y" }, name: "Valovi", preset: true };
}

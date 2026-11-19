import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

export interface LoadedModel {
  name: string;
  /** Flat xyz triangle soup */
  positions: Float32Array;
  triangles: number;
}

function geometryToSoup(geos: THREE.BufferGeometry[]): Float32Array {
  const arrays: Float32Array[] = [];
  let total = 0;
  for (const g of geos) {
    const ng = g.index ? g.toNonIndexed() : g;
    const arr = ng.getAttribute("position").array as Float32Array;
    arrays.push(arr);
    total += arr.length;
  }
  const out = new Float32Array(total);
  let o = 0;
  for (const a of arrays) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}

export async function loadModelFile(file: File): Promise<LoadedModel> {
  const ext = file.name.toLowerCase().split(".").pop();
  let positions: Float32Array;
  if (ext === "stl") {
    const buf = await file.arrayBuffer();
    const geo = new STLLoader().parse(buf);
    positions = geometryToSoup([geo]);
  } else if (ext === "obj") {
    const txt = await file.text();
    const group = new OBJLoader().parse(txt);
    group.updateMatrixWorld(true);
    const geos: THREE.BufferGeometry[] = [];
    group.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        const g = mesh.geometry.clone();
        g.applyMatrix4(mesh.matrixWorld);
        geos.push(g);
      }
    });
    positions = geometryToSoup(geos);
  } else {
    throw new Error("Podržani su samo STL i OBJ formati.");
  }
  if (positions.length < 9) throw new Error("Datoteka ne sadrži trokute.");
  return { name: file.name, positions, triangles: positions.length / 9 };
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
  const pts: number[] = [];
  const P = (i: number, j: number): [number, number, number] => {
    const x = (i / n - 0.5) * size;
    const y = (j / n - 0.5) * size;
    return [x, y, z(x, y)];
  };
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const a = P(i, j), b = P(i + 1, j), c = P(i + 1, j + 1), d = P(i, j + 1);
      pts.push(...a, ...b, ...c, ...a, ...c, ...d);
    }
  }
  const positions = new Float32Array(pts);
  return { name: "Primjer: valovi", positions, triangles: positions.length / 9 };
}

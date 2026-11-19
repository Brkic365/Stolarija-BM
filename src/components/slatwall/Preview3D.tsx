"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Slat, WallSettings } from "@/lib/slatwall/types";
import { FINISHES, type Finish } from "./finishes";

function buildSlatGeometry(slats: Slat[], wall: WallSettings): THREE.BufferGeometry | null {
  const t = wall.slatThickness;
  const geos: THREE.BufferGeometry[] = [];
  const m = new THREE.Matrix4();
  for (const slat of slats) {
    for (const part of slat.parts) {
      const shape = new THREE.Shape(part.polygon.map(([u, v]) => new THREE.Vector2(u, v)));
      const g = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false, curveSegments: 1 });
      if (wall.direction === "vertical") {
        // u -> wall Y, v -> depth Z, extrusion -> wall X
        m.set(0, 0, 1, slat.position, 1, 0, 0, part.offset, 0, 1, 0, 0, 0, 0, 0, 1);
      } else {
        // u -> wall X, v -> depth Z, extrusion -> -Y
        m.set(1, 0, 0, part.offset, 0, 0, -1, slat.position + t, 0, 1, 0, 0, 0, 0, 0, 1);
      }
      g.applyMatrix4(m);
      geos.push(g);
    }
  }
  if (!geos.length) return null;
  const merged = mergeGeometries(geos, false);
  geos.forEach((g) => g.dispose());
  merged.computeVertexNormals();
  return merged;
}

export default function Preview3D({
  slats,
  wall,
  finish = "breza",
}: {
  slats: Slat[];
  wall: WallSettings;
  finish?: Finish;
}) {
  const geometry = useMemo(() => buildSlatGeometry(slats, wall), [slats, wall]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  const f = FINISHES.find((x) => x.id === finish) ?? FINISHES[0];

  const W = wall.width / 1000;
  const H = wall.height / 1000;
  const size = Math.max(W, H);
  return (
    <Canvas
      camera={{ position: [-size * 0.8, size * 0.1, size * 1.6], fov: 35, near: 0.01, far: 100 }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#f3f0e9"]} />
      <hemisphereLight args={["#fffaf0", "#8a8174", 0.55]} />
      {/* Raking key light from the side, the way a slat wall is usually lit, so the relief reads */}
      <directionalLight
        castShadow
        position={[-size * 1.6, size * 0.9, size * 0.9]}
        intensity={2.2}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0004}
        shadow-normalBias={0.002}
        shadow-camera-left={-size}
        shadow-camera-right={size}
        shadow-camera-top={size}
        shadow-camera-bottom={-size}
        shadow-camera-near={0.01}
        shadow-camera-far={size * 6}
      />
      <directionalLight position={[size, size * 0.2, size * 1.5]} intensity={0.35} />
      <group scale={0.001} position={[-W / 2, -H / 2, 0]}>
        <mesh position={[wall.width / 2, wall.height / 2, -0.5]} receiveShadow>
          <planeGeometry args={[wall.width + 600, wall.height + 600]} />
          <meshStandardMaterial color={f.wall} roughness={1} />
        </mesh>
        {geometry && (
          <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial color={f.color} roughness={f.roughness} metalness={0} />
          </mesh>
        )}
      </group>
      <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
    </Canvas>
  );
}

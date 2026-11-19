"use client";

import React, { useEffect, useMemo } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { Slat, WallSettings } from "@/lib/slatwall/types";

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
  return merged;
}

export default function Preview3D({ slats, wall }: { slats: Slat[]; wall: WallSettings }) {
  const geometry = useMemo(() => buildSlatGeometry(slats, wall), [slats, wall]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const size = Math.max(wall.width, wall.height) / 1000;
  return (
    <Canvas
      camera={{ position: [size * 0.55, size * 0.15, size * 1.35], fov: 40, near: 0.01, far: 100 }}
      dpr={[1, 2]}
      shadows={false}
    >
      <color attach="background" args={["#eceae6"]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[-size * 2, size, size * 1.2]} intensity={1.6} />
      <directionalLight position={[size, -size * 0.3, size]} intensity={0.35} />
      <group scale={0.001} position={[-wall.width / 2000, -wall.height / 2000, 0]}>
        <mesh position={[wall.width / 2, wall.height / 2, -1]}>
          <planeGeometry args={[wall.width + 200, wall.height + 200]} />
          <meshStandardMaterial color="#f6f3ee" roughness={1} />
        </mesh>
        {geometry && (
          <mesh geometry={geometry}>
            <meshStandardMaterial color="#d8b98e" roughness={0.75} metalness={0} />
          </mesh>
        )}
      </group>
      <OrbitControls makeDefault enableDamping target={[0, 0, 0]} />
    </Canvas>
  );
}

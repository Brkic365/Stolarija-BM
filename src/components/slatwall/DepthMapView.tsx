"use client";

import React, { useEffect, useRef } from "react";
import type { HeightMap, Slat, WallSettings } from "@/lib/slatwall/types";

/** Grey-scale depth map (white = closest to the viewer) with slat outlines on top. */
export default function DepthMapView({ map, slats, wall }: { map: HeightMap; slats: Slat[]; wall: WallSettings }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const { nx, ny, data, hit } = map;
    c.width = nx;
    c.height = ny;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(nx, ny);
    const R = Math.max(1e-6, wall.reliefDepth);
    for (let y = 0; y < ny; y++) {
      for (let x = 0; x < nx; x++) {
        const k = y * nx + x;
        const o = ((ny - 1 - y) * nx + x) * 4;
        const v = hit[k] ? 40 + Math.round((data[k] / R) * 215) : 18;
        img.data[o] = v;
        img.data[o + 1] = v;
        img.data[o + 2] = hit[k] ? v : 30;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    ctx.fillStyle = "rgba(180, 56, 31, 0.32)";
    const s = nx / wall.width;
    for (const sl of slats) {
      if (wall.direction === "vertical") ctx.fillRect(sl.position * s, 0, wall.slatThickness * s, ny);
      else ctx.fillRect(0, ny - (sl.position + wall.slatThickness) * s, nx, wall.slatThickness * s);
    }
  }, [map, slats, wall]);

  return <canvas ref={ref} style={{ width: "100%", height: "100%", objectFit: "contain", imageRendering: "auto" }} />;
}

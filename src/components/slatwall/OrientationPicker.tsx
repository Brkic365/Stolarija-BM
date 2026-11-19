"use client";

import React, { useEffect, useRef } from "react";
import type { OrientationPreview } from "@/lib/slatwall/heightmap";
import type { FrontAxis } from "@/lib/slatwall/types";
import styles from "@/styles/pages/admin/SlatWall.module.scss";

const LABEL: Record<FrontAxis, string> = {
  "+z": "+Z",
  "-z": "−Z",
  "+x": "+X",
  "-x": "−X",
  "+y": "+Y",
  "-y": "−Y",
};

function Thumb({ p }: { p: OrientationPreview }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.width = p.nx;
    c.height = p.ny;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const img = ctx.createImageData(p.nx, p.ny);
    for (let y = 0; y < p.ny; y++) {
      for (let x = 0; x < p.nx; x++) {
        const v = p.data[y * p.nx + x];
        const o = ((p.ny - 1 - y) * p.nx + x) * 4;
        if (v < 0) {
          img.data[o + 3] = 0;
        } else {
          const g = Math.round(60 + v * 180);
          img.data[o] = g;
          img.data[o + 1] = g - 6;
          img.data[o + 2] = g - 16;
          img.data[o + 3] = 255;
        }
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [p]);
  return <canvas ref={ref} />;
}

/** Six small "what the wall would see" previews; click the one that shows the front. */
export default function OrientationPicker({
  previews,
  value,
  suggested,
  onChange,
}: {
  previews: OrientationPreview[];
  value: FrontAxis;
  suggested: FrontAxis | null;
  onChange: (a: FrontAxis) => void;
}) {
  return (
    <div className={styles.orient}>
      {previews.map((p) => (
        <button
          key={p.axis}
          type="button"
          className={p.axis === value ? styles.orientActive : undefined}
          onClick={() => onChange(p.axis)}
          aria-pressed={p.axis === value}
          title={`Gledaj s ${LABEL[p.axis]}`}
        >
          <Thumb p={p} />
          <span>
            {LABEL[p.axis]}
            {p.axis === suggested && <i>prijedlog</i>}
          </span>
        </button>
      ))}
    </div>
  );
}

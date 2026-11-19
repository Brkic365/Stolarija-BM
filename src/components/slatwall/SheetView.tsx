"use client";

import React from "react";
import { toSheet } from "@/lib/slatwall/nest";
import type { SheetLayout, SheetSettings } from "@/lib/slatwall/types";

export default function SheetView({
  layout,
  sheet,
  labelSize,
}: {
  layout: SheetLayout;
  sheet: SheetSettings;
  labelSize: number;
}) {
  const H = sheet.width;
  return (
    <svg
      viewBox={`-5 -5 ${sheet.length + 10} ${sheet.width + 10}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      role="img"
      aria-label={`Raspored ploče ${layout.index}`}
    >
      <rect x={0} y={0} width={sheet.length} height={sheet.width} fill="#efe4d2" stroke="#9b8a73" strokeWidth={3} />
      <rect
        x={sheet.margin}
        y={sheet.margin}
        width={sheet.length - 2 * sheet.margin}
        height={sheet.width - 2 * sheet.margin}
        fill="none"
        stroke="#c9b89f"
        strokeDasharray="12 10"
        strokeWidth={2}
      />
      {layout.placements.map((pl) => {
        const d =
          pl.part.polygon
            .map((p, i) => {
              const [x, y] = toSheet(pl, p);
              return `${i ? "L" : "M"}${x.toFixed(1)} ${(H - y).toFixed(1)}`;
            })
            .join("") + "Z";
        const [lx, ly] = toSheet(pl, pl.part.label);
        return (
          <g key={pl.part.id}>
            <path d={d} fill="#d8b98e" stroke="#5b4630" strokeWidth={2} />
            <text
              x={lx}
              y={H - ly}
              fontSize={labelSize}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#2b2117"
              fontWeight={700}
            >
              {pl.part.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

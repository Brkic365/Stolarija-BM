import { toSheet } from "./nest";
import type { Pt, SheetLayout, SheetSettings } from "./types";

// Plain ASCII DXF R12 (AC1009): the most widely accepted flavour for CAM
// import (Biesse bSolid / BiesseWorks, Aspire, Fusion, LibreCAD...).
// Units are millimetres. Layers:
//   PLOCA  – sheet outline (reference only, do not cut)
//   REZ    – closed part outlines to profile-cut
//   OZNAKE – part numbers (engrave or ignore)

const LAYERS: [string, number][] = [
  ["PLOCA", 8],
  ["REZ", 1],
  ["OZNAKE", 5],
];

const f = (n: number) => (Math.round(n * 1000) / 1000).toString();

function polyline(out: string[], layer: string, pts: Pt[]) {
  out.push("0", "POLYLINE", "8", layer, "66", "1", "70", "1", "10", "0", "20", "0", "30", "0");
  for (const [x, y] of pts) out.push("0", "VERTEX", "8", layer, "10", f(x), "20", f(y), "30", "0");
  out.push("0", "SEQEND", "8", layer);
}

function text(out: string[], layer: string, [x, y]: Pt, h: number, s: string, rot = 0) {
  out.push(
    "0", "TEXT", "8", layer,
    "10", f(x), "20", f(y), "30", "0",
    "40", f(h), "1", s, "50", f(rot),
    "72", "1", "73", "2",
    "11", f(x), "21", f(y), "31", "0"
  );
}

export function sheetToDxf(layout: SheetLayout, sheet: SheetSettings, baseDepth: number): string {
  const out: string[] = [];
  out.push(
    "0", "SECTION", "2", "HEADER",
    "9", "$ACADVER", "1", "AC1009",
    "9", "$EXTMIN", "10", "0", "20", "0", "30", "0",
    "9", "$EXTMAX", "10", f(sheet.length), "20", f(sheet.width), "30", "0",
    "0", "ENDSEC"
  );
  out.push("0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER", "70", String(LAYERS.length));
  for (const [name, color] of LAYERS) {
    out.push("0", "LAYER", "2", name, "70", "0", "62", String(color), "6", "CONTINUOUS");
  }
  out.push("0", "ENDTAB", "0", "ENDSEC");

  out.push("0", "SECTION", "2", "ENTITIES");
  polyline(out, "PLOCA", [
    [0, 0],
    [sheet.length, 0],
    [sheet.length, sheet.width],
    [0, sheet.width],
  ]);
  const h = Math.max(4, Math.min(12, baseDepth * 0.45));
  for (const pl of layout.placements) {
    polyline(out, "REZ", pl.part.polygon.map((p) => toSheet(pl, p)));
    text(out, "OZNAKE", toSheet(pl, pl.part.label), h, pl.part.id, 0);
  }
  out.push("0", "ENDSEC", "0", "EOF");
  return out.join("\r\n") + "\r\n";
}

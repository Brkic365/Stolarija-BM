// Shared types for the slat-wall (lamelni zid) tool.
// All lengths are in millimetres.

export type Pt = [number, number];

export type FrontAxis = "+z" | "-z" | "+x" | "-x" | "+y" | "-y";

export interface WallSettings {
  /** Overall wall width (X) */
  width: number;
  /** Overall wall height (Y) */
  height: number;
  /** Slat thickness = sheet material thickness */
  slatThickness: number;
  /** Gap between neighbouring slats */
  gap: number;
  direction: "vertical" | "horizontal";
  /** Solid depth every slat has behind the relief */
  baseDepth: number;
  /** Maximum relief depth added on top of baseDepth */
  reliefDepth: number;
  /** "fit" stretches the model depth to reliefDepth, "true" keeps proportions (clipped) */
  depthMode: "fit" | "true";

  // Model placement
  frontAxis: FrontAxis;
  rotation: 0 | 90 | 180 | 270;
  mirror: boolean;
  invert: boolean;
  /** How much of the wall the model fills, 0.05..1 */
  fill: number;
  offsetX: number;
  offsetY: number;
  /** Blur radius in mm applied to the relief (0 = off) */
  smoothing: number;

  // Mounting notches cut into the back edge (for battens)
  notches: {
    enabled: boolean;
    count: number;
    width: number;
    depth: number;
  };
}

export interface SheetSettings {
  /** Long side of the sheet; profiles run along it (grain direction) */
  length: number;
  /** Short side */
  width: number;
  /** Unused border along every sheet edge */
  margin: number;
  /** Minimum distance between parts (router bit diameter + safety) */
  spacing: number;
}

export interface HeightMap {
  nx: number;
  ny: number;
  /** Cell size in mm */
  res: number;
  /** Relief height per cell, 0..reliefDepth; row-major, row 0 = bottom */
  data: Float32Array;
  /** 1 where the model covers the cell */
  hit: Uint8Array;
  coverage: number;
}

export interface Part {
  /** Label printed on the part and in the guide, e.g. "12" or "12B" */
  id: string;
  /** 1-based slat number */
  slat: number;
  /** 0-based piece index when a slat is split */
  piece: number;
  pieces: number;
  /** Start of this piece along the slat, mm from the slat's start */
  offset: number;
  length: number;
  maxDepth: number;
  minDepth: number;
  /** Closed outline, CCW, part coordinates: u along length, v depth (0 = back edge) */
  polygon: Pt[];
  /** Front (relief) edge, u ascending, part coordinates */
  front: Pt[];
  area: number;
  label: Pt;
}

export interface Slat {
  number: number;
  /** Distance from the wall's left edge (vertical) or bottom edge (horizontal) to the slat's near face */
  position: number;
  length: number;
  maxDepth: number;
  parts: Part[];
}

export interface Placement {
  part: Part;
  /** Sheet coordinates of the part's u=0 end (already includes the margin) */
  x: number;
  /** Normal: y of the straight back edge. Flipped: y of the back edge, which is then on top */
  y: number;
  flipped: boolean;
}

export interface SheetLayout {
  index: number;
  placements: Placement[];
  partArea: number;
  usedHeight: number;
}

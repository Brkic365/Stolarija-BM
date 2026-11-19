import { zipSync, strToU8 } from "fflate";
import { sheetToDxf } from "./dxf";
import { buildGuidePdf, type GuideInput } from "./pdf";

export function dxfName(index: number) {
  return `ploca-${String(index).padStart(2, "0")}.dxf`;
}

export function slug(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase() || "lamelni-zid"
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function dxfBlob(g: GuideInput, index: number): Blob {
  const sh = g.sheets.find((s) => s.index === index)!;
  return new Blob([sheetToDxf(sh, g.sheet, g.wall.baseDepth)], { type: "application/dxf" });
}

/** Everything for the workshop in one file: DXF per sheet, PDF guide, settings. */
export async function buildZip(g: GuideInput, settings: unknown): Promise<Blob> {
  const pdf = await buildGuidePdf(g);
  const files: Record<string, Uint8Array> = {
    "vodic-i-popis.pdf": new Uint8Array(await pdf.arrayBuffer()),
    "postavke.json": strToU8(JSON.stringify(settings, null, 2)),
  };
  for (const sh of g.sheets) {
    files[`dxf/${dxfName(sh.index)}`] = strToU8(sheetToDxf(sh, g.sheet, g.wall.baseDepth));
  }
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as BlobPart], { type: "application/zip" });
}

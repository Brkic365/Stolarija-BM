import { jsPDF } from "jspdf";
import { toSheet } from "./nest";
import type { Part, SheetLayout, SheetSettings, Slat, WallSettings } from "./types";

export interface GuideInput {
  projectName: string;
  modelName: string;
  wall: WallSettings;
  sheet: SheetSettings;
  slats: Slat[];
  sheets: SheetLayout[];
  notchCentres: number[];
}

let fontCache: { regular: string; bold: string } | null = null;

async function loadFont(url: string): Promise<string> {
  const buf = await (await fetch(url)).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  }
  return btoa(bin);
}

const r0 = (n: number) => Math.round(n).toString();
const r1 = (n: number) => (Math.round(n * 10) / 10).toString().replace(".", ",");

/** Builds the printable assembly guide + cut list. Returns the PDF as a Blob. */
export async function buildGuidePdf(g: GuideInput): Promise<Blob> {
  if (!fontCache) {
    const [regular, bold] = await Promise.all([
      loadFont("/fonts/DejaVuSans.ttf"),
      loadFont("/fonts/DejaVuSans-Bold.ttf"),
    ]);
    fontCache = { regular, bold };
  }
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.addFileToVFS("DejaVuSans.ttf", fontCache.regular);
  doc.addFont("DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFileToVFS("DejaVuSans-Bold.ttf", fontCache.bold);
  doc.addFont("DejaVuSans-Bold.ttf", "DejaVu", "bold");

  const PW = 297, PH = 210, M = 12;
  const { wall, sheet, slats, sheets } = g;
  const vertical = wall.direction === "vertical";
  const parts: Part[] = slats.flatMap((s) => s.parts);
  const sheetOf = new Map<Part, { sheet: number; flipped: boolean }>();
  sheets.forEach((sh) => sh.placements.forEach((pl) => sheetOf.set(pl.part, { sheet: sh.index, flipped: pl.flipped })));
  const date = new Date().toLocaleDateString("hr-HR");

  const font = (size: number, bold = false) => {
    doc.setFont("DejaVu", bold ? "bold" : "normal");
    doc.setFontSize(size);
  };
  const header = (title: string) => {
    font(16, true);
    doc.setTextColor(20);
    doc.text(title, M, M + 6);
    font(8);
    doc.setTextColor(110);
    doc.text(`${g.projectName} · ${date}`, PW - M, M + 6, { align: "right" });
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(M, M + 9, PW - M, M + 9);
    doc.setTextColor(20);
  };
  const footer = () => {
    const n = doc.getNumberOfPages();
    font(7);
    doc.setTextColor(140);
    doc.text(`Stolarija BM · lamelni zid · str. ${n}`, PW / 2, PH - 6, { align: "center" });
    doc.setTextColor(20);
  };

  // ---------- Page 1: overview ----------
  header("Lamelni zid: pregled");
  const totalSheetArea = sheets.length * sheet.length * sheet.width;
  const partArea = sheets.reduce((a, s) => a + s.partArea, 0);
  const rows: [string, string][] = [
    ["Model", g.modelName],
    ["Dimenzije zida", `${r0(wall.width)} × ${r0(wall.height)} mm`],
    ["Smjer lamela", vertical ? "okomito" : "vodoravno"],
    ["Broj lamela", `${slats.length}`],
    ["Broj dijelova za rezanje", `${parts.length}`],
    ["Debljina lamele (ploče)", `${r1(wall.slatThickness)} mm`],
    ["Razmak između lamela", `${r1(wall.gap)} mm`],
    ["Dubina lamele", `${r0(wall.baseDepth)} mm osnova + do ${r0(wall.reliefDepth)} mm reljefa`],
    ["Ploča", `${r0(sheet.length)} × ${r0(sheet.width)} mm, rub ${r0(sheet.margin)} mm, razmak glodala ${r1(sheet.spacing)} mm`],
    ["Broj ploča", `${sheets.length}`],
    ["Iskorištenost materijala", totalSheetArea ? `${r0((partArea / totalSheetArea) * 100)} %` : "-"],
  ];
  if (g.notchCentres.length) {
    rows.push([
      "Utori za letve",
      `${g.notchCentres.length} × ${r0(wall.notches.width)} × ${r0(wall.notches.depth)} mm`,
    ]);
  }
  let y = M + 18;
  for (const [k, v] of rows) {
    font(9);
    doc.setTextColor(110);
    doc.text(k, M, y);
    font(9, true);
    doc.setTextColor(20);
    const lines = doc.splitTextToSize(v, 66);
    doc.text(lines, M + 52, y);
    y += 3 + lines.length * 4.2;
  }

  // Front view of the wall with slat numbers
  {
    const bx = M + 128, by = M + 16, bw = PW - M - bx, bh = PH - 2 * M - 28;
    const sc = Math.min(bw / wall.width, bh / wall.height);
    const ox = bx + (bw - wall.width * sc) / 2;
    const oy = by + (bh - wall.height * sc) / 2;
    const X = (x: number) => ox + x * sc;
    const Y = (yy: number) => oy + (wall.height - yy) * sc; // wall y up
    doc.setDrawColor(150);
    doc.setLineWidth(0.2);
    doc.rect(X(0), Y(wall.height), wall.width * sc, wall.height * sc);
    const maxD = Math.max(1, ...slats.map((s) => s.maxDepth));
    const every = slats.length * 4 * (vertical ? 1 : wall.height / wall.width) > 200 ? 5 : 1;
    slats.forEach((s) => {
      const shade = 230 - Math.round((s.maxDepth / maxD) * 130);
      doc.setFillColor(shade, shade - 10, shade - 25);
      if (vertical) {
        doc.rect(X(s.position), Y(wall.height), wall.slatThickness * sc, wall.height * sc, "F");
      } else {
        doc.rect(X(0), Y(s.position + wall.slatThickness), wall.width * sc, wall.slatThickness * sc, "F");
      }
      if (s.number === 1 || s.number % every === 0 || s.number === slats.length) {
        font(5.5);
        if (vertical) doc.text(String(s.number), X(s.position + wall.slatThickness / 2), Y(wall.height) - 1.5, { align: "center" });
        else doc.text(String(s.number), X(0) - 1.5, Y(s.position + wall.slatThickness / 2) + 1, { align: "right" });
      }
    });
    // Split joints
    slats.forEach((s) =>
      s.parts.slice(1).forEach((p) => {
        doc.setDrawColor(200, 40, 40);
        if (vertical) doc.line(X(s.position), Y(p.offset), X(s.position + wall.slatThickness), Y(p.offset));
        else doc.line(X(p.offset), Y(s.position), X(p.offset), Y(s.position + wall.slatThickness));
      })
    );
    font(7);
    doc.setTextColor(110);
    doc.text(
      `Pogled sprijeda. Lamela 1 je ${vertical ? "krajnje lijevo" : "na dnu"}. Tamnije = dublja lamela.`,
      bx + bw / 2,
      PH - M - 6,
      { align: "center" }
    );
    doc.setTextColor(20);
  }
  footer();

  // ---------- Assembly instructions ----------
  doc.addPage();
  header("Montaža");
  const pitch = wall.slatThickness + wall.gap;
  const first = slats[0]?.position ?? 0;
  const steps: string[] = [
    `Izrežite sve ploče (DXF datoteke, sloj REZ). Svaki dio ima svoj broj na sloju OZNAKE; prenesite broj olovkom ako ga ne gravirate.`,
    `Ravni rub svakog dijela je stražnja strana (uz zid), valoviti rub gleda prema prostoru.`,
    vertical
      ? `Lamele idu slijeva nadesno. Lamela 1 počinje ${r1(first)} mm od lijevog ruba zida, a svaka sljedeća je ${r1(pitch)} mm dalje (${r1(wall.slatThickness)} mm lamela + ${r1(wall.gap)} mm razmak). Za razmak koristite odstojnik od ${r1(wall.gap)} mm.`
      : `Lamele idu odozdo prema gore. Lamela 1 počinje ${r1(first)} mm od dna zida, a svaka sljedeća je ${r1(pitch)} mm više (${r1(wall.slatThickness)} mm lamela + ${r1(wall.gap)} mm razmak). Za razmak koristite odstojnik od ${r1(wall.gap)} mm.`,
  ];
  if (g.notchCentres.length) {
    steps.push(
      `Na zid prvo postavite ${g.notchCentres.length} ${vertical ? "vodoravne" : "okomite"} letve presjeka ${r0(wall.notches.width)} × ${r0(wall.notches.depth)} mm, sredinom na ${g.notchCentres
        .map((c) => r0(c))
        .join(", ")} mm od ${vertical ? "dna" : "lijevog ruba"} zida. Lamele se utorima nataknu na letve.`
    );
  }
  if (parts.some((p) => p.pieces > 1)) {
    steps.push(
      `Lamele duže od ploče izrezane su iz više dijelova (npr. 12A, 12B). Dio A je ${vertical ? "donji" : "lijevi"}; spojite ih na mjestima označenim crveno na pregledu (lamelo, tipli ili spojna pločica sa stražnje strane).`
    );
  }
  steps.push(`Prije lijepljenja složite nekoliko susjednih lamela na podu i provjerite da se oblik lijepo nastavlja.`);
  y = M + 18;
  steps.forEach((t, i) => {
    font(10, true);
    doc.text(`${i + 1}.`, M, y);
    font(10);
    const lines = doc.splitTextToSize(t, PW - 2 * M - 10);
    doc.text(lines, M + 8, y);
    y += lines.length * 5 + 3;
  });

  // Position table
  y += 4;
  font(11, true);
  doc.text(vertical ? "Položaj lamela (mm od lijevog ruba zida)" : "Položaj lamela (mm od dna zida)", M, y);
  y += 6;
  const cols = 8;
  const cw = (PW - 2 * M) / cols;
  slats.forEach((s, i) => {
    const cx = M + (i % cols) * cw;
    if (i % cols === 0 && i > 0) y += 5;
    if (y > PH - M - 8) {
      footer();
      doc.addPage();
      header("Montaža (nastavak)");
      y = M + 18;
    }
    font(8.5, true);
    doc.text(`${s.number}`, cx, y);
    font(8.5);
    doc.text(`${r1(s.position)}`, cx + 9, y);
  });
  footer();

  // ---------- Cut list ----------
  const headers = ["Dio", "Lamela", "Duljina", "Dubina min", "Dubina max", "Ploča", "Okrenut", vertical ? "Od dna" : "Od lijevo"];
  const widths = [18, 18, 26, 26, 26, 18, 20, 26];
  const drawTableHeader = () => {
    header("Popis za rezanje");
    let x = M;
    font(8.5, true);
    headers.forEach((h, i) => {
      doc.text(h, x, M + 18);
      x += widths[i];
    });
    doc.setDrawColor(200);
    doc.line(M, M + 20, M + widths.reduce((a, b) => a + b, 0), M + 20);
    return M + 25;
  };
  doc.addPage();
  y = drawTableHeader();
  for (const p of parts) {
    if (y > PH - M - 8) {
      footer();
      doc.addPage();
      y = drawTableHeader();
    }
    const info = sheetOf.get(p);
    const cells = [
      p.id,
      String(p.slat),
      `${r0(p.length)} mm`,
      `${r0(p.minDepth)} mm`,
      `${r0(p.maxDepth)} mm`,
      info ? String(info.sheet) : "-",
      info?.flipped ? "da" : "",
      `${r0(p.offset)} mm`,
    ];
    let x = M;
    font(8.5, false);
    cells.forEach((c, i) => {
      doc.text(c, x, y);
      x += widths[i];
    });
    y += 5.2;
  }
  footer();

  // ---------- Sheets ----------
  for (const sh of sheets) {
    doc.addPage();
    header(`Ploča ${sh.index} / ${sheets.length}`);
    const bx = M, by = M + 16, bw = PW - 2 * M, bh = PH - 2 * M - 26;
    const sc = Math.min(bw / sheet.length, bh / sheet.width);
    const ox = bx + (bw - sheet.length * sc) / 2;
    const oy = by + (bh - sheet.width * sc) / 2;
    const X = (x: number) => ox + x * sc;
    const Y = (yy: number) => oy + (sheet.width - yy) * sc;
    doc.setDrawColor(150);
    doc.setLineWidth(0.25);
    doc.rect(X(0), Y(sheet.width), sheet.length * sc, sheet.width * sc);
    doc.setDrawColor(30);
    doc.setLineWidth(0.15);
    for (const pl of sh.placements) {
      const pts = pl.part.polygon.map((p) => toSheet(pl, p));
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        doc.line(X(a[0]), Y(a[1]), X(b[0]), Y(b[1]));
      }
      const [lx, ly] = toSheet(pl, pl.part.label);
      font(Math.max(4, Math.min(8, wall.baseDepth * sc * 2.2)), true);
      doc.text(pl.part.id, X(lx), Y(ly) + 1, { align: "center" });
    }
    font(8);
    doc.setTextColor(110);
    doc.text(
      `${r0(sheet.length)} × ${r0(sheet.width)} mm · ${sh.placements.length} dijelova · iskorištenost ${r0(
        (sh.partArea / (sheet.length * sheet.width)) * 100
      )} % · DXF: ploca-${String(sh.index).padStart(2, "0")}.dxf`,
      PW / 2,
      PH - M - 4,
      { align: "center" }
    );
    doc.setTextColor(20);
    footer();
  }

  return doc.output("blob");
}

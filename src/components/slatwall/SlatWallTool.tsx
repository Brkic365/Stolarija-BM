"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "@/styles/pages/admin/SlatWall.module.scss";

import { buildHeightMap } from "@/lib/slatwall/heightmap";
import { sliceWall, notchCentres } from "@/lib/slatwall/slice";
import { nestParts } from "@/lib/slatwall/nest";
import { demoModel, loadModelFile, type LoadedModel } from "@/lib/slatwall/model";
import { buildZip, downloadBlob, dxfBlob, dxfName, slug } from "@/lib/slatwall/export";
import { buildGuidePdf, type GuideInput } from "@/lib/slatwall/pdf";
import type { FrontAxis, SheetSettings, WallSettings } from "@/lib/slatwall/types";
import SheetView from "./SheetView";
import DepthMapView from "./DepthMapView";

const Preview3D = dynamic(() => import("./Preview3D"), {
  ssr: false,
  loading: () => <div className={styles.placeholder}>Učitavam 3D prikaz…</div>,
});

const DEFAULT_WALL: WallSettings = {
  width: 2000,
  height: 2400,
  slatThickness: 18,
  gap: 20,
  direction: "vertical",
  baseDepth: 40,
  reliefDepth: 120,
  depthMode: "fit",
  frontAxis: "+z",
  rotation: 0,
  mirror: false,
  invert: false,
  fill: 0.9,
  offsetX: 0,
  offsetY: 0,
  smoothing: 0,
  notches: { enabled: false, count: 2, width: 20, depth: 15 },
};

const DEFAULT_SHEET: SheetSettings = { length: 2800, width: 2070, margin: 10, spacing: 12 };

const STORAGE_KEY = "stolarija-bm:lamele:v1";

type Tab = "3d" | "sheets" | "list" | "map";

function NumberField({
  label,
  value,
  onChange,
  unit = "mm",
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
}) {
  const [text, setText] = useState(String(value));
  useEffect(() => {
    setText((t) => (Number(t.replace(",", ".")) === value ? t : String(value)));
  }, [value]);
  return (
    <label className={styles.field} title={hint}>
      <span>{label}</span>
      <div className={styles.inputWrap}>
        <input
          inputMode="decimal"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = Number(e.target.value.replace(",", "."));
            if (e.target.value.trim() !== "" && Number.isFinite(n)) {
              let v = n;
              if (min !== undefined) v = Math.max(min, v);
              if (max !== undefined) v = Math.min(max, v);
              onChange(v);
            }
          }}
          onBlur={() => setText(String(value))}
          step={step}
        />
        {unit && <em>{unit}</em>}
      </div>
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.toggle}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className={styles.field}>
      <span>{label}</span>
      <div className={styles.segmented}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            className={o.value === value ? styles.segActive : undefined}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SlatWallTool() {
  const [wall, setWall] = useState<WallSettings>(DEFAULT_WALL);
  const [sheet, setSheet] = useState<SheetSettings>(DEFAULT_SHEET);
  const [projectName, setProjectName] = useState("Lamelni zid");
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [tab, setTab] = useState<Tab>("3d");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLInputElement>(null);

  // Restore last settings (per browser)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.wall) setWall({ ...DEFAULT_WALL, ...saved.wall, notches: { ...DEFAULT_WALL.notches, ...saved.wall.notches } });
        if (saved.sheet) setSheet({ ...DEFAULT_SHEET, ...saved.sheet });
        if (saved.projectName) setProjectName(saved.projectName);
      }
    } catch {}
    setModel(demoModel());
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ wall, sheet, projectName }));
    } catch {}
  }, [wall, sheet, projectName]);

  const w = useDeferredValue(wall);
  const sh = useDeferredValue(sheet);
  const stale = w !== wall || sh !== sheet;

  const height = useMemo(() => {
    if (!model) return null;
    return buildHeightMap(model.positions, w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, w.width, w.height, w.reliefDepth, w.depthMode, w.frontAxis, w.rotation, w.mirror, w.invert, w.fill, w.offsetX, w.offsetY, w.smoothing]);

  const sliced = useMemo(() => {
    if (!height) return null;
    return sliceWall(height.map, w, sh.length - 2 * sh.margin);
  }, [height, w, sh.length, sh.margin]);

  const nested = useMemo(() => (sliced ? nestParts(sliced.parts, sh) : null), [sliced, sh]);

  const guide: GuideInput | null =
    sliced && nested && model
      ? {
          projectName,
          modelName: model.name,
          wall: w,
          sheet: sh,
          slats: sliced.slats,
          sheets: nested.sheets,
          notchCentres: sliced.warnings.some((x) => x.startsWith("Utori"))
            ? []
            : notchCentres(w, w.direction === "vertical" ? w.height : w.width),
        }
      : null;

  const setW = <K extends keyof WallSettings>(k: K, v: WallSettings[K]) => setWall((p) => ({ ...p, [k]: v }));
  const setN = <K extends keyof WallSettings["notches"]>(k: K, v: WallSettings["notches"][K]) =>
    setWall((p) => ({ ...p, notches: { ...p.notches, [k]: v } }));
  const setS = <K extends keyof SheetSettings>(k: K, v: SheetSettings[K]) => setSheet((p) => ({ ...p, [k]: v }));

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    setBusy("Učitavam model…");
    try {
      const m = await loadModelFile(f);
      setModel(m);
      setProjectName(f.name.replace(/\.[^.]+$/, ""));
    } catch (e: any) {
      setError(e?.message || "Model nije moguće učitati.");
    } finally {
      setBusy(null);
    }
  };

  const run = async (label: string, fn: () => Promise<void>) => {
    setError(null);
    setBusy(label);
    try {
      await fn();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Došlo je do greške.");
    } finally {
      setBusy(null);
    }
  };

  const settingsJson = () => ({ version: 1, projectName, modelName: model?.name, wall, sheet });

  const totals = useMemo(() => {
    if (!nested || !sliced) return null;
    const area = nested.sheets.length * sh.length * sh.width;
    const used = nested.sheets.reduce((a, s) => a + s.partArea, 0);
    return { util: area ? (used / area) * 100 : 0 };
  }, [nested, sliced, sh]);

  const labelSize = Math.max(14, Math.min(40, w.baseDepth * 0.7));

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <header className={styles.brand}>
          <div>
            <strong>Lamelni zid</strong>
            <small>Stolarija BM · interni alat</small>
          </div>
          <nav>
            <Link href="/admin">Admin</Link>
            <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
              Odjava
            </button>
          </nav>
        </header>

        <section className={styles.panel}>
          <h3>1. Model</h3>
          <label className={styles.field}>
            <span>Naziv projekta</span>
            <div className={styles.inputWrap}>
              <input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </div>
          </label>
          <div className={styles.row}>
            <button type="button" className={styles.primary} onClick={() => fileRef.current?.click()}>
              Učitaj STL / OBJ
            </button>
            <button type="button" onClick={() => setModel(demoModel())}>
              Primjer
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".stl,.obj"
            hidden
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {model && (
            <p className={styles.muted}>
              {model.name} · {model.triangles.toLocaleString("hr-HR")} trokuta
              {height && (
                <>
                  {" "}
                  · na zidu {Math.round(height.fit.sizeX)} × {Math.round(height.fit.sizeY)} mm
                </>
              )}
            </p>
          )}
          <label className={styles.field}>
            <span>Prednja strana modela</span>
            <div className={styles.inputWrap}>
              <select value={wall.frontAxis} onChange={(e) => setW("frontAxis", e.target.value as FrontAxis)}>
                <option value="+z">+Z (Blender/OBJ, Y gore)</option>
                <option value="-y">−Y (STL iz CAD-a, Z gore)</option>
                <option value="-z">−Z</option>
                <option value="+y">+Y</option>
                <option value="+x">+X</option>
                <option value="-x">−X</option>
              </select>
            </div>
          </label>
          <Segmented
            label="Rotacija"
            value={wall.rotation}
            options={[0, 90, 180, 270].map((r) => ({ value: r as 0 | 90 | 180 | 270, label: `${r}°` }))}
            onChange={(v) => setW("rotation", v)}
          />
          <div className={styles.row}>
            <Toggle label="Zrcali" checked={wall.mirror} onChange={(v) => setW("mirror", v)} />
            <Toggle label="Obrni dubinu" checked={wall.invert} onChange={(v) => setW("invert", v)} />
          </div>
          <div className={styles.grid2}>
            <NumberField label="Veličina modela" unit="%" value={Math.round(wall.fill * 100)} min={5} max={100} onChange={(v) => setW("fill", v / 100)} />
            <NumberField label="Zaglađivanje" value={wall.smoothing} min={0} max={100} onChange={(v) => setW("smoothing", v)} />
            <NumberField label="Pomak lijevo/desno" value={wall.offsetX} onChange={(v) => setW("offsetX", v)} />
            <NumberField label="Pomak gore/dolje" value={wall.offsetY} onChange={(v) => setW("offsetY", v)} />
          </div>
        </section>

        <section className={styles.panel}>
          <h3>2. Zid i lamele</h3>
          <div className={styles.grid2}>
            <NumberField label="Širina zida" value={wall.width} min={50} max={20000} onChange={(v) => setW("width", v)} />
            <NumberField label="Visina zida" value={wall.height} min={50} max={20000} onChange={(v) => setW("height", v)} />
          </div>
          <Segmented
            label="Smjer lamela"
            value={wall.direction}
            options={[
              { value: "vertical", label: "Okomito" },
              { value: "horizontal", label: "Vodoravno" },
            ]}
            onChange={(v) => setW("direction", v)}
          />
          <div className={styles.grid2}>
            <NumberField label="Debljina lamele" value={wall.slatThickness} min={3} max={100} step={0.5} onChange={(v) => setW("slatThickness", v)} hint="Debljina ploče iz koje se reže" />
            <NumberField label="Razmak lamela" value={wall.gap} min={0} max={500} step={0.5} onChange={(v) => setW("gap", v)} />
            <NumberField label="Osnovna dubina" value={wall.baseDepth} min={5} max={500} onChange={(v) => setW("baseDepth", v)} hint="Puni dio uz zid koji ima svaka lamela" />
            <NumberField label="Dubina reljefa" value={wall.reliefDepth} min={0} max={1000} onChange={(v) => setW("reliefDepth", v)} hint="Koliko najviša točka modela izlazi ispred osnove" />
          </div>
          <Segmented
            label="Dubina modela"
            value={wall.depthMode}
            options={[
              { value: "fit", label: "Rastegni na reljef" },
              { value: "true", label: "Stvarne proporcije" },
            ]}
            onChange={(v) => setW("depthMode", v)}
          />
          <Toggle label="Utori za montažne letve" checked={wall.notches.enabled} onChange={(v) => setN("enabled", v)} />
          {wall.notches.enabled && (
            <div className={styles.grid3}>
              <NumberField label="Broj" unit="" value={wall.notches.count} min={1} max={10} onChange={(v) => setN("count", Math.round(v))} />
              <NumberField label="Širina" value={wall.notches.width} min={3} max={200} onChange={(v) => setN("width", v)} />
              <NumberField label="Dubina" value={wall.notches.depth} min={2} max={200} onChange={(v) => setN("depth", v)} />
            </div>
          )}
        </section>

        <section className={styles.panel}>
          <h3>3. Ploča i CNC</h3>
          <div className={styles.grid2}>
            <NumberField label="Dužina ploče" value={sheet.length} min={100} max={6000} onChange={(v) => setS("length", v)} hint="Dulja strana; lamele idu uzduž (smjer vlakana)" />
            <NumberField label="Širina ploče" value={sheet.width} min={100} max={3000} onChange={(v) => setS("width", v)} />
            <NumberField label="Rub ploče" value={sheet.margin} min={0} max={200} onChange={(v) => setS("margin", v)} hint="Neiskorišteni rub uz svaku stranicu" />
            <NumberField label="Razmak glodala" value={sheet.spacing} min={0} max={100} step={0.5} onChange={(v) => setS("spacing", v)} hint="Najmanji razmak između dijelova: promjer glodala + sigurnost" />
          </div>
        </section>

        <section className={styles.panel}>
          <h3>4. Izvoz</h3>
          <button
            type="button"
            className={styles.primary}
            disabled={!guide || !!busy || !guide.sheets.length}
            onClick={() =>
              guide &&
              run("Pripremam ZIP…", async () =>
                downloadBlob(await buildZip(guide, settingsJson()), `${slug(projectName)}.zip`)
              )
            }
          >
            Preuzmi sve (DXF + PDF)
          </button>
          <div className={styles.row}>
            <button
              type="button"
              disabled={!guide || !!busy}
              onClick={() =>
                guide && run("Izrađujem PDF…", async () => downloadBlob(await buildGuidePdf(guide), `${slug(projectName)}-vodic.pdf`))
              }
            >
              Samo PDF vodič
            </button>
            <button
              type="button"
              onClick={() =>
                downloadBlob(new Blob([JSON.stringify(settingsJson(), null, 2)], { type: "application/json" }), `${slug(projectName)}-postavke.json`)
              }
            >
              Spremi postavke
            </button>
            <button type="button" onClick={() => settingsRef.current?.click()}>
              Učitaj postavke
            </button>
          </div>
          <input
            ref={settingsRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              try {
                const s = JSON.parse(await f.text());
                if (s.wall) setWall({ ...DEFAULT_WALL, ...s.wall, notches: { ...DEFAULT_WALL.notches, ...s.wall.notches } });
                if (s.sheet) setSheet({ ...DEFAULT_SHEET, ...s.sheet });
                if (s.projectName) setProjectName(s.projectName);
              } catch {
                setError("Datoteka s postavkama nije ispravna.");
              }
            }}
          />
          <p className={styles.muted}>Postavke se pamte u ovom pregledniku. Model treba ponovno učitati nakon osvježavanja.</p>
        </section>
      </aside>

      <main className={styles.main}>
        <div className={styles.stats}>
          <div>
            <b>{sliced?.slats.length ?? "-"}</b>
            <span>lamela</span>
          </div>
          <div>
            <b>{sliced?.parts.length ?? "-"}</b>
            <span>dijelova</span>
          </div>
          <div>
            <b>{nested?.sheets.length ?? "-"}</b>
            <span>ploča</span>
          </div>
          <div>
            <b>{totals ? `${Math.round(totals.util)} %` : "-"}</b>
            <span>iskorištenost</span>
          </div>
          <div>
            <b>{sliced?.slats.length ? `${Math.round(Math.max(...sliced.slats.map((s) => s.maxDepth)))}` : "-"}</b>
            <span>max dubina mm</span>
          </div>
          {(stale || busy) && <div className={styles.busy}>{busy ?? "Računam…"}</div>}
        </div>

        {!!(error || sliced?.warnings.length || nested?.unplaced.length) && (
          <div className={styles.alerts}>
            {error && <p className={styles.error}>{error}</p>}
            {sliced?.warnings.map((x) => (
              <p key={x}>{x}</p>
            ))}
            {!!nested?.unplaced.length && (
              <p className={styles.error}>
                {nested.unplaced.length} dijelova ne stane na ploču (preduboki za širinu ploče): {nested.unplaced.map((p) => p.id).join(", ")}
              </p>
            )}
          </div>
        )}

        <div className={styles.tabs}>
          {(
            [
              ["3d", "3D prikaz"],
              ["sheets", "Ploče"],
              ["list", "Popis dijelova"],
              ["map", "Dubinska mapa"],
            ] as [Tab, string][]
          ).map(([k, l]) => (
            <button key={k} type="button" className={tab === k ? styles.tabActive : undefined} onClick={() => setTab(k)}>
              {l}
            </button>
          ))}
        </div>

        <div className={styles.view}>
          {tab === "3d" &&
            (sliced ? <Preview3D slats={sliced.slats} wall={w} /> : <div className={styles.placeholder}>Učitajte model.</div>)}

          {tab === "map" && height && sliced && (
            <div className={styles.mapWrap}>
              <DepthMapView map={height.map} slats={sliced.slats} wall={w} />
            </div>
          )}

          {tab === "sheets" && nested && guide && (
            <div className={styles.sheets}>
              {nested.sheets.map((s) => (
                <figure key={s.index} className={styles.sheetCard}>
                  <figcaption>
                    <b>
                      Ploča {s.index} / {nested.sheets.length}
                    </b>
                    <span>
                      {s.placements.length} dijelova · {Math.round((s.partArea / (sh.length * sh.width)) * 100)} %
                    </span>
                    <button type="button" onClick={() => downloadBlob(dxfBlob(guide, s.index), dxfName(s.index))}>
                      DXF
                    </button>
                  </figcaption>
                  <SheetView layout={s} sheet={sh} labelSize={labelSize} />
                </figure>
              ))}
            </div>
          )}

          {tab === "list" && sliced && nested && (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Dio</th>
                    <th>Lamela</th>
                    <th>Položaj na zidu</th>
                    <th>Duljina</th>
                    <th>Dubina min</th>
                    <th>Dubina max</th>
                    <th>Ploča</th>
                  </tr>
                </thead>
                <tbody>
                  {sliced.slats.flatMap((s) =>
                    s.parts.map((p) => {
                      const sheetNo = nested.sheets.find((x) => x.placements.some((pl) => pl.part === p))?.index;
                      return (
                        <tr key={p.id}>
                          <td>
                            <b>{p.id}</b>
                          </td>
                          <td>{p.slat}</td>
                          <td>{(Math.round(s.position * 10) / 10).toLocaleString("hr-HR")} mm</td>
                          <td>{Math.round(p.length)} mm</td>
                          <td>{Math.round(p.minDepth)} mm</td>
                          <td>{Math.round(p.maxDepth)} mm</td>
                          <td>{sheetNo ?? "-"}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

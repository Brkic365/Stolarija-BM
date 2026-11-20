"use client";

import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { signOut } from "next-auth/react";
import styles from "@/styles/pages/admin/SlatWall.module.scss";

import { buildHeightMap } from "@/lib/slatwall/heightmap";
import { sliceWall, notchCentres } from "@/lib/slatwall/slice";
import { nestParts } from "@/lib/slatwall/nest";
import { ACCEPT_ATTR, PRESETS, demoModel, loadModelFile, loadPreset, type LoadedModel, type Preset } from "@/lib/slatwall/model";
import { buildZip, downloadBlob, dxfBlob, dxfName, slug } from "@/lib/slatwall/export";
import { buildGuidePdf, type GuideInput } from "@/lib/slatwall/pdf";
import type { FrontAxis, SheetSettings, WallSettings } from "@/lib/slatwall/types";
import SheetView from "./SheetView";
import DepthMapView from "./DepthMapView";
import OrientationPicker from "./OrientationPicker";
import { FINISHES, type Finish } from "./finishes";

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
  reliefDepth: 200,
  depthMode: "fit",
  depthCut: 0.6,
  frontAxis: "+z",
  rotation: 0,
  mirror: false,
  invert: false,
  fill: 0.9,
  offsetX: 0,
  offsetY: 0,
  smoothing: 3,
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

/** A ruler-like slider with the value printed beside the label. */
function RangeField({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "%",
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <label className={styles.range} title={hint}>
      <span>
        {label}
        <b>
          {value}
          {unit && <em>{unit}</em>}
        </b>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
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
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className={styles.panel}>
      <h3>
        <i>{n}</i>
        {title}
      </h3>
      {children}
    </section>
  );
}

function SlatMark() {
  return (
    <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const h = 6 + Math.round(7 * Math.sin((Math.PI * (i + 0.5)) / 6));
        return <rect key={i} x={2 + i * 4.3} y={14 - h} width="2.4" height={h * 2} fill="currentColor" />;
      })}
    </svg>
  );
}

export default function SlatWallTool() {
  const [wall, setWall] = useState<WallSettings>(DEFAULT_WALL);
  const [sheet, setSheet] = useState<SheetSettings>(DEFAULT_SHEET);
  const [projectName, setProjectName] = useState("Lamelni zid");
  const [model, setModel] = useState<LoadedModel | null>(null);
  const [tab, setTab] = useState<Tab>("3d");
  const [finish, setFinish] = useState<Finish>("breza");
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
        // The page always opens on the sample, so its front is +Z whatever the last model was.
        if (saved.wall)
          setWall({
            ...DEFAULT_WALL,
            ...saved.wall,
            frontAxis: "+z",
            rotation: 0,
            notches: { ...DEFAULT_WALL.notches, ...saved.wall.notches },
          });
        if (saved.sheet) setSheet({ ...DEFAULT_SHEET, ...saved.sheet });
        if (saved.projectName) setProjectName(saved.projectName);
        if (saved.finish) setFinish(saved.finish);
      }
    } catch {}
    setModel(demoModel());
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ wall, sheet, projectName, finish }));
    } catch {}
  }, [wall, sheet, projectName, finish]);

  const previews = model?.previews ?? [];
  const suggested: FrontAxis | null = model && !model.preset ? model.guess.axis : null;

  const w = useDeferredValue(wall);
  const sh = useDeferredValue(sheet);
  const stale = w !== wall || sh !== sheet;

  const height = useMemo(() => {
    if (!model) return null;
    return buildHeightMap(model.positions, w);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model, w.width, w.height, w.reliefDepth, w.depthMode, w.depthCut, w.frontAxis, w.rotation, w.mirror, w.invert, w.fill, w.offsetX, w.offsetY, w.smoothing]);

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

  const applyModel = (m: LoadedModel, name: string) => {
    setWall((p) => ({
      ...p,
      frontAxis: m.guess.axis,
      rotation: m.guess.rotation,
      mirror: false,
      invert: false,
      offsetX: 0,
      offsetY: 0,
    }));
    setModel(m);
    setProjectName(name);
  };

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError(null);
    setBusy("Učitavam model…");
    try {
      // Parsing, simplifying and the front-side guess run in a background worker.
      const m = await loadModelFile(f, (msg) => setBusy(msg));
      applyModel(m, f.name.replace(/\.[^.]+$/, ""));
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "Model nije moguće učitati.");
    } finally {
      setBusy(null);
    }
  };

  const onPreset = async (p: Preset | null) => {
    setError(null);
    if (!p) return applyModel(demoModel(), "Valovi");
    setBusy(`Učitavam primjer: ${p.name}…`);
    try {
      applyModel(await loadPreset(p, (msg) => setBusy(msg)), p.name);
    } catch (e: any) {
      setError(e?.message || "Primjer nije moguće učitati.");
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

  const settingsJson = () => ({ version: 2, projectName, modelName: model?.name, wall, sheet });

  const util = useMemo(() => {
    if (!nested) return null;
    const area = nested.sheets.length * sh.length * sh.width;
    const used = nested.sheets.reduce((a, s) => a + s.partArea, 0);
    return area ? (used / area) * 100 : 0;
  }, [nested, sh]);

  const maxDepth = sliced?.slats.length ? Math.round(Math.max(...sliced.slats.map((s) => s.maxDepth))) : null;
  const labelSize = Math.max(14, Math.min(40, w.baseDepth * 0.7));
  const hasAlerts = !!(error || sliced?.warnings.length || nested?.unplaced.length);

  return (
    <div className={styles.app}>
      <aside className={styles.sidebar}>
        <header className={styles.brand}>
          <div className={styles.mark}>
            <SlatMark />
            <div>
              <small>Stolarija BM · radionica</small>
              <input
                className={styles.projectName}
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                aria-label="Naziv projekta"
              />
            </div>
          </div>
          <nav>
            <Link href="/admin">Admin</Link>
            <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
              Odjava
            </button>
          </nav>
        </header>

        <Section n="01" title="Model">
          <button type="button" className={styles.primary} onClick={() => fileRef.current?.click()} disabled={!!busy}>
            Učitaj model
          </button>
          <p className={styles.formats}>STL · OBJ · PLY · GLB · FBX · 3MF · ZIP, i skenovi s milijunima trokuta</p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT_ATTR}
            hidden
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          <div className={styles.field}>
            <span>Ili krenite od primjera</span>
            <div className={styles.presets}>
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!!busy}
                  className={model?.preset && model.name === p.name ? styles.presetActive : undefined}
                  onClick={() => onPreset(p)}
                  title={`${p.name}: ${p.kind}. Izvor: ${p.credit}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/images/lamele/presets/${p.id}.webp`} alt="" width={120} height={150} />
                  <span>{p.name}</span>
                  <small>{p.kind}</small>
                </button>
              ))}
              <button
                type="button"
                disabled={!!busy}
                className={model?.preset && model.name === "Valovi" ? styles.presetActive : undefined}
                onClick={() => onPreset(null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/lamele/presets/valovi.webp" alt="" width={120} height={150} />
                <span>Valovi</span>
                <small>apstraktno</small>
              </button>
            </div>
            <p className={styles.credit}>
              Skenovi: Three D Scans (slobodni za korištenje) · Glava: Lee Perry-Smith / Infinite Realities, CC BY 3.0
            </p>
          </div>
          {model && (
            <p className={styles.meta}>
              <span>{model.name}</span>
              <span>
                {model.sourceTriangles.toLocaleString("hr-HR")} trokuta
                {model.sourceTriangles > model.triangles && ` (radim s ${model.triangles.toLocaleString("hr-HR")})`}
              </span>
              {height && (
                <span>
                  {Math.round(height.fit.sizeX)} × {Math.round(height.fit.sizeY)} mm na zidu
                </span>
              )}
            </p>
          )}
          {!!previews.length && (
            <div className={styles.field}>
              <span>Prednja strana: kliknite pogled na kojem se vidi lice modela</span>
              <OrientationPicker
                previews={previews}
                value={wall.frontAxis}
                suggested={suggested}
                onChange={(a) =>
                  setWall((p) => ({ ...p, frontAxis: a, rotation: previews.find((v) => v.axis === a)?.rotation ?? 0 }))
                }
              />
            </div>
          )}
          <Segmented
            label="Zakreni"
            value={wall.rotation}
            options={[0, 90, 180, 270].map((r) => ({ value: r as 0 | 90 | 180 | 270, label: `${r}°` }))}
            onChange={(v) => setW("rotation", v)}
          />
          <div className={styles.row}>
            <Toggle label="Zrcali" checked={wall.mirror} onChange={(v) => setW("mirror", v)} />
            <Toggle label="Obrni dubinu" checked={wall.invert} onChange={(v) => setW("invert", v)} />
          </div>
          <RangeField label="Veličina modela" value={Math.round(wall.fill * 100)} min={10} max={100} onChange={(v) => setW("fill", v / 100)} />
          <div className={styles.grid2}>
            <NumberField label="Pomak lijevo / desno" value={wall.offsetX} onChange={(v) => setW("offsetX", v)} />
            <NumberField label="Pomak gore / dolje" value={wall.offsetY} onChange={(v) => setW("offsetY", v)} />
          </div>
        </Section>

        <Section n="02" title="Zid">
          <div className={styles.grid2}>
            <NumberField label="Širina" value={wall.width} min={50} max={20000} onChange={(v) => setW("width", v)} />
            <NumberField label="Visina" value={wall.height} min={50} max={20000} onChange={(v) => setW("height", v)} />
          </div>
          <div className={styles.grid2}>
            <NumberField label="Osnova" value={wall.baseDepth} min={5} max={500} onChange={(v) => setW("baseDepth", v)} hint="Puni dio uz zid koji ima svaka lamela" />
            <NumberField label="Reljef do" value={wall.reliefDepth} min={0} max={1000} onChange={(v) => setW("reliefDepth", v)} hint="Koliko najistaknutija točka izlazi ispred osnove" />
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
          {wall.depthMode === "fit" && (
            <RangeField
              label="Koristi prednji dio modela"
              value={Math.round(wall.depthCut * 100)}
              min={10}
              max={100}
              onChange={(v) => setW("depthCut", v / 100)}
              hint="Manje = lice dobiva više dubine, a stražnji dio modela legne na zid"
            />
          )}
          <RangeField label="Zaglađivanje" unit="mm" value={wall.smoothing} min={0} max={40} onChange={(v) => setW("smoothing", v)} />
        </Section>

        <Section n="03" title="Lamele">
          <Segmented
            label="Smjer"
            value={wall.direction}
            options={[
              { value: "vertical", label: "Okomito" },
              { value: "horizontal", label: "Vodoravno" },
            ]}
            onChange={(v) => setW("direction", v)}
          />
          <div className={styles.grid2}>
            <NumberField label="Debljina" value={wall.slatThickness} min={3} max={100} step={0.5} onChange={(v) => setW("slatThickness", v)} hint="Debljina ploče iz koje se reže" />
            <NumberField label="Razmak" value={wall.gap} min={0} max={500} step={0.5} onChange={(v) => setW("gap", v)} />
          </div>
          <Toggle label="Utori za montažne letve" checked={wall.notches.enabled} onChange={(v) => setN("enabled", v)} />
          {wall.notches.enabled && (
            <div className={styles.grid3}>
              <NumberField label="Broj" unit="kom" value={wall.notches.count} min={1} max={10} onChange={(v) => setN("count", Math.round(v))} />
              <NumberField label="Širina" value={wall.notches.width} min={3} max={200} onChange={(v) => setN("width", v)} />
              <NumberField label="Dubina" value={wall.notches.depth} min={2} max={200} onChange={(v) => setN("depth", v)} />
            </div>
          )}
        </Section>

        <Section n="04" title="Ploča i glodalo">
          <div className={styles.grid2}>
            <NumberField label="Dužina ploče" value={sheet.length} min={100} max={6000} onChange={(v) => setS("length", v)} hint="Dulja strana; lamele idu uzduž (smjer vlakana)" />
            <NumberField label="Širina ploče" value={sheet.width} min={100} max={3000} onChange={(v) => setS("width", v)} />
            <NumberField label="Rub" value={sheet.margin} min={0} max={200} onChange={(v) => setS("margin", v)} hint="Neiskorišteni rub uz svaku stranicu" />
            <NumberField label="Razmak glodala" value={sheet.spacing} min={0} max={100} step={0.5} onChange={(v) => setS("spacing", v)} hint="Najmanji razmak između dijelova: promjer glodala + sigurnost" />
          </div>
        </Section>

        <Section n="05" title="Izvoz">
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
            Preuzmi sve: DXF + PDF
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
          <p className={styles.note}>Postavke se pamte u ovom pregledniku. Model treba ponovno učitati nakon osvježavanja.</p>
        </Section>
      </aside>

      <main className={styles.main}>
        <div className={styles.titleBlock}>
          <div>
            <span>Lamela</span>
            <b>{sliced?.slats.length ?? "–"}</b>
          </div>
          <div>
            <span>Dijelova</span>
            <b>{sliced?.parts.length ?? "–"}</b>
          </div>
          <div>
            <span>Ploča</span>
            <b>{nested?.sheets.length ?? "–"}</b>
          </div>
          <div>
            <span>Iskorištenost</span>
            <b>
              {util !== null ? Math.round(util) : "–"}
              <em>%</em>
            </b>
          </div>
          <div>
            <span>Najveća dubina</span>
            <b>
              {maxDepth ?? "–"}
              <em>mm</em>
            </b>
          </div>
          <div className={styles.titleStatus}>
            <span>Stanje</span>
            <b className={stale || busy ? styles.working : undefined}>{busy ?? (stale ? "Računam…" : "Spremno")}</b>
          </div>
        </div>

        {hasAlerts && (
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

        <div className={styles.tabs} role="tablist">
          {(
            [
              ["3d", "A", "3D prikaz"],
              ["sheets", "B", "Ploče"],
              ["list", "C", "Popis dijelova"],
              ["map", "D", "Dubinska mapa"],
            ] as [Tab, string, string][]
          ).map(([k, letter, l]) => (
            <button
              key={k}
              type="button"
              role="tab"
              aria-selected={tab === k}
              className={tab === k ? styles.tabActive : undefined}
              onClick={() => setTab(k)}
            >
              <i>{letter}</i>
              {l}
            </button>
          ))}
          <label className={styles.depthDial} title="Koliko najistaknutija točka izlazi ispred osnove">
            <span>Izlazi iz zida</span>
            <input
              type="range"
              min={20}
              max={Math.max(500, wall.reliefDepth)}
              step={5}
              value={wall.reliefDepth}
              onChange={(e) => setW("reliefDepth", Number(e.target.value))}
            />
            <b>
              {wall.reliefDepth}
              <em>mm</em>
            </b>
            <small>ukupno {wall.baseDepth + wall.reliefDepth} mm</small>
          </label>
        </div>

        <div className={styles.view}>
          {tab === "3d" && (
            <>
              {sliced ? <Preview3D slats={sliced.slats} wall={w} finish={finish} /> : <div className={styles.placeholder}>Učitajte model.</div>}
              {busy && (
                <div className={styles.loading} role="status">
                  <span>{busy}</span>
                </div>
              )}
              <div className={styles.finishes} aria-label="Završna obrada">
                {FINISHES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={finish === f.id ? styles.finishActive : undefined}
                    onClick={() => setFinish(f.id)}
                    aria-pressed={finish === f.id}
                  >
                    <i style={{ background: f.color }} />
                    {f.label}
                  </button>
                ))}
              </div>
              <p className={styles.viewHint}>Povuci za okretanje · kotačić za zum</p>
            </>
          )}

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
                    <b>Ploča {String(s.index).padStart(2, "0")}</b>
                    <span>
                      {s.placements.length} dijelova · {Math.round((s.partArea / (sh.length * sh.width)) * 100)} % · {sh.length} × {sh.width}
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
                    <th className={styles.num}>Položaj na zidu</th>
                    <th className={styles.num}>Duljina</th>
                    <th className={styles.num}>Dubina min</th>
                    <th className={styles.num}>Dubina max</th>
                    <th className={styles.num}>Ploča</th>
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
                          <td className={styles.num}>{(Math.round(s.position * 10) / 10).toLocaleString("hr-HR")}</td>
                          <td className={styles.num}>{Math.round(p.length)}</td>
                          <td className={styles.num}>{Math.round(p.minDepth)}</td>
                          <td className={styles.num}>{Math.round(p.maxDepth)}</td>
                          <td className={styles.num}>{sheetNo ? String(sheetNo).padStart(2, "0") : "–"}</td>
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

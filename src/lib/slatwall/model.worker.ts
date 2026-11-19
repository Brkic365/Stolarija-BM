/// <reference lib="webworker" />
// Heavy model work off the main thread, so a 200 MB scan doesn't freeze the page.
import { parseInWorkerFormat, prepareSoup } from "./prepare";

type Req =
  | { id: number; kind: "file"; ext: string; buf: ArrayBuffer }
  | { id: number; kind: "soup"; positions: Float32Array };

const ctx = self as unknown as DedicatedWorkerGlobalScope;

ctx.onmessage = async (e: MessageEvent<Req>) => {
  const req = e.data;
  const progress = (msg: string) => ctx.postMessage({ id: req.id, progress: msg });
  try {
    let soup: Float32Array;
    if (req.kind === "file") {
      progress("Čitam datoteku…");
      soup = await parseInWorkerFormat(req.ext, req.buf);
    } else {
      soup = req.positions;
    }
    const m = prepareSoup(soup, progress);
    const transfer: Transferable[] = [m.positions.buffer, ...m.previews.map((p) => p.data.buffer)];
    ctx.postMessage({ id: req.id, result: m }, transfer);
  } catch (err: any) {
    ctx.postMessage({ id: req.id, error: err?.message || String(err) });
  }
};

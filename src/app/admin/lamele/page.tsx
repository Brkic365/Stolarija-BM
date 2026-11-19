"use client";

import dynamic from "next/dynamic";

// Three.js and file APIs are browser-only, so the tool renders on the client.
const SlatWallTool = dynamic(() => import("@/components/slatwall/SlatWallTool"), {
  ssr: false,
  loading: () => <p style={{ padding: 24 }}>Učitavam alat…</p>,
});

export default function LamelePage() {
  return <SlatWallTool />;
}

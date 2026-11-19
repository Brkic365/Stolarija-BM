import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Lamelni zid",
  description: "Interni alat Stolarije BM za izradu lamelnih zidova.",
  robots: { index: false, follow: false },
  manifest: "/lamele.webmanifest",
  appleWebApp: { capable: true, title: "Lamelni zid", statusBarStyle: "default" },
  icons: { apple: "/images/lamele/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#1d1b18",
};

export default function LameleLayout({ children }: { children: React.ReactNode }) {
  return children;
}

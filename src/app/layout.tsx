import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

import { Providers } from "./providers";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://stolarijabm.vercel.app"),
  title: {
    default: "Stolarija BM | Kuhinje i namještaj po mjeri",
    template: "%s | Stolarija BM",
  },
  description:
    "Izrađujemo kuhinje i namještaj po mjeri sa stilom i pažnjom. Obiteljska stolarija iz Sesvetskog Kraljevca, od 1992.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hr">
      <body className={font.className}>
        <Providers>
          {children}
          <SpeedInsights />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}

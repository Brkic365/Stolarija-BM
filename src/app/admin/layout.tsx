import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

const sans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

// Owner-only pages share the workshop type: Plex Sans for text, Plex Mono for
// measurements. The variables go on :root (only while an admin page is open)
// so modals rendered in portals outside this tree get them too.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{--font-plex-sans:${sans.style.fontFamily};--font-plex-mono:${mono.style.fontFamily};}`,
        }}
      />
      {children}
    </>
  );
}

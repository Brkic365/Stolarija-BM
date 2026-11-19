"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import styles from "@/styles/pages/admin/Mainpage.module.scss";

import { signOut } from "next-auth/react";
import Orders from "@/components/admin/Orders";
import Messages from "@/components/admin/Messages";
import Products from "@/components/admin/Products";

import { useSearchParams, useRouter } from "next/navigation";

const SECTIONS = [
  { n: "01", label: "Narudžbe" },
  { n: "02", label: "Poruke" },
  { n: "03", label: "Proizvodi" },
];

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageQuery = searchParams.get("page");
  const opened = pageQuery ? parseInt(pageQuery) || 0 : 0;

  const today = new Date().toLocaleDateString("hr-HR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            BM
          </span>
          <div>
            <strong>Stolarija BM</strong>
            <small>Radionica · admin</small>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Admin">
          {SECTIONS.map((s, i) => (
            <button
              key={s.n}
              type="button"
              className={opened === i ? styles.navActive : undefined}
              aria-current={opened === i ? "page" : undefined}
              onClick={() => router.push(`/admin?page=${i}`)}
            >
              <i>{s.n}</i>
              {s.label}
            </button>
          ))}
          <Link href="/admin/lamele" className={styles.navTool}>
            <i>04</i>
            Lamelni zid
            <span aria-hidden="true">↗</span>
          </Link>
        </nav>

        <div className={styles.railFoot}>
          <Link href="/">Javna stranica</Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            Odjava
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.header}>
          <p>{today}</p>
        </header>
        {opened === 0 && <Orders />}
        {opened === 1 && <Messages />}
        {opened === 2 && <Products />}
      </main>
    </div>
  );
}

export default function Mainpage() {
  return (
    <Suspense fallback={<div className={styles.loading}>Učitavanje…</div>}>
      <AdminContent />
    </Suspense>
  );
}

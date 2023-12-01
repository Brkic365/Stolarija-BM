"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/Home.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className={styles.main}>
      {/* Hero section */}
      <section className={styles.hero}>
        <section className={styles.text}>
          <h1>Prilagođavamo Drvo Vašim Snovima.</h1>
          <p>
            Izrađujemo Namještaj i Kuhinje Sa Stilom i Pažnjom, Nasljedujući
            Stolarsku Umjetnost Od 1992.
          </p>
        </section>
        <section className={styles.cta}>
          <button onClick={() => router.push("/web-shop")}>Web shop</button>
          <button
            className={styles.emptyButton}
            onClick={() => router.push("/o-nama")}
          >
            O nama <HiArrowSmRight />
          </button>
        </section>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <section className={styles.text}>
          <h1 className={styles.bgText}>O nama</h1>
          <h2>
            Više od 30 godina kreiramo unikatni namještaj i kuhinje po mjeri.
            Otkrijte našu stolarsku baštinu, Od kuhinja do personaliziranih
            dizajna.
          </h2>
          <p>
            U Stolariji BM d.o.o., neprestano radimo na poboljšanju naših
            procesa i zadovoljenju potreba naših klijenata. <br />
            <br />
            Posvećeni smo pružanju vrhunskih proizvoda, istovremeno nastojeći
            zadovoljiti i najviše standarde korisničkog iskustva.
          </p>
          <button
            className={styles.emptyButton}
            onClick={() => router.push("/o-nama")}
          >
            Više o nama <HiArrowSmRight />
          </button>
        </section>
        <img src="/images/kitchens/kitchen_1.png" alt="O nama" />
      </section>

      {/* Services section */}
      <section className={styles.services}>
        <section
          className={styles.service}
          onClick={() => router.push("/web-shop/proizvodi?filter=1")}
        >
          <h1>Kuhinje</h1>
        </section>
        <section
          className={styles.service}
          onClick={() => router.push("/web-shop/proizvodi?filter=2")}
        >
          <h1>Dječje Sobe</h1>
        </section>
        <section
          className={styles.service}
          onClick={() => router.push("/web-shop/proizvodi?filter=3")}
        >
          <h1>Namještaj</h1>
        </section>
      </section>
    </main>
  );
}

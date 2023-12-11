"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/Home.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/web-shop")}
          >
            Web shop
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.emptyButton}
            onClick={() => router.push("/o-nama")}
          >
            O nama <HiArrowSmRight />
          </motion.button>
        </section>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <section className={styles.top}>
          <h1 className={styles.bgText}>O nama</h1>
          <h2>
            Više od 30 godina kreiramo unikatni namještaj i kuhinje po mjeri.
            Otkrijte našu stolarsku baštinu, Od kuhinja do personaliziranih
            dizajna.
          </h2>
        </section>
        <section className={styles.content}>
          <section className={styles.text}>
            <p>
              U Stolariji BM d.o.o., neprestano radimo na poboljšanju naših
              procesa i zadovoljenju potreba naših klijenata. <br />
              <br />
              Posvećeni smo pružanju vrhunskih proizvoda, istovremeno nastojeći
              zadovoljiti i najviše standarde korisničkog iskustva.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.emptyButton}
              onClick={() => router.push("/o-nama")}
            >
              Više o nama <HiArrowSmRight />
            </motion.button>
          </section>
          <div className={styles.image} />
        </section>
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

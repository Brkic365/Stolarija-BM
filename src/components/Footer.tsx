"use client";

import React from "react";
import styles from "@/styles/components/Footer.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

function Footer() {
  const router = useRouter();

  return (
    <section className={styles.footer}>
      <section className={styles.info}>
        <section className={styles.left}>
          <h2>S nestrpljenjem očekujemo priliku za suradnju s vama!</h2>
          <div className={styles.cta}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/kontakt")}
            >
              Kontaktiraj nas
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.emptyButton}
              onClick={() => router.push("/web-shop")}
            >
              Posjeti web shop <HiArrowSmRight />
            </motion.button>
          </div>
        </section>

        <ul className={styles.details}>
          <li className={styles.title}>Stolarija BM d.o.o.</li>
          <li>Dragutina Domjanića 37, HR-10361</li>
          <li>Sesvetski Kraljevec</li>
          <li>OIB: 78796206166</li>
        </ul>
      </section>

      <ul>
        <li className={styles.copyright}>© 2023 Stolarija BM d.o.o.</li>
        <li>
          import Link from "next/link";
          // ... (keep other imports)

          // ... inside component:
          <Link href="/">Početna</Link>
        </li>
        <li>
          <Link href="/o-nama">O nama</Link>
        </li>
        <li>
          <Link href="/web-shop">Web shop</Link>
        </li>
        <li>
          <Link href="/kontakt">Kontaktiraj nas</Link>
        </li>
      </ul>
    </section>
  );
}

export default Footer;

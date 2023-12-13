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
        <li className={styles.copyright}>© Stolarija BM d.o.o. 2023</li>
        <li>
          <a href="/">Početna</a>
        </li>
        <li>
          <a href="/o-nama">O nama</a>
        </li>
        <li>
          <a href="/web-shop">Web shop</a>
        </li>
        <li>
          <a href="/kontakt">Kontaktiraj nas</a>
        </li>
      </ul>
    </section>
  );
}

export default Footer;

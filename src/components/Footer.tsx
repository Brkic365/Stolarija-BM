"use client";

import React from "react";
import styles from "@/styles/components/Footer.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import Link from "next/link";
import { motion } from "framer-motion";
import { PHONE_DISPLAY, PHONE_HREF, WORKING_HOURS } from "@/lib/contact";

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
              Pogledaj ponudu <HiArrowSmRight />
            </motion.button>
          </div>
        </section>

        <ul className={styles.details}>
          <li className={styles.title}>Stolarija BM d.o.o.</li>
          <li>Dragutina Domjanića 37, HR-10361</li>
          <li>Sesvetski Kraljevec</li>
          <li>OIB: 78796206166</li>
          <li>
            <a href={PHONE_HREF}>Mob: {PHONE_DISPLAY}</a>
          </li>
          <li>{WORKING_HOURS}</li>
        </ul>
      </section>

      <ul>
        <li className={styles.copyright}>© {new Date().getFullYear()} Stolarija BM d.o.o.</li>
        <li>
          <Link href="/">Početna</Link>
        </li>
        <li>
          <Link href="/o-nama">O nama</Link>
        </li>
        <li>
          <Link href="/web-shop">Ponuda</Link>
        </li>
        <li>
          <Link href="/kontakt">Kontaktiraj nas</Link>
        </li>
      </ul>
    </section>
  );
}

export default Footer;

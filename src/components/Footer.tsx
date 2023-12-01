"use client";

import React from "react";
import styles from "@/styles/components/Footer.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

function Footer() {
  const router = useRouter();

  return (
    <section className={styles.footer}>
      <section className={styles.info}>
        <h2>S nestrpljenjem očekujemo priliku za suradnju s vama!</h2>
        <div className={styles.cta}>
          <button onClick={() => router.push("/kontakt")}>
            Kontaktiraj nas
          </button>
          <button
            className={styles.emptyButton}
            onClick={() => router.push("/o-nama")}
          >
            O nama <HiArrowSmRight />
          </button>
        </div>
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

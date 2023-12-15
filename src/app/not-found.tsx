"use client";

import React from "react";
import styles from "@/styles/pages/NotFound.module.scss";

import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

function NotFound() {
  const router = useRouter();

  return (
    <main className={styles.notFound}>
      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Content section */}
      <section className={styles.content}>
        <motion.h1
          className={styles.bigText}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          variants={{
            visible: {
              transform: "scale(1)",
              filter: "blur(0px)",
              opacity: 1,
            },
            hidden: {
              transform: "scale(1.5)",
              filter: "blur(4px)",
              opacity: 0,
            },
          }}
        >
          404
        </motion.h1>
        <section className={styles.text}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.5)",
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          >
            Nešto je pošlo po krivu...
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.5)",
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          >
            Nažalost, ne možemo pronaći stranicu koju tražite. Možda ste
            pogriješili adresu ili stranica više ne postoji.
          </motion.p>
          <motion.button
            onClick={() => router.back()}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            variants={{
              visible: {
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          >
            Vrati me nazad
          </motion.button>
        </section>
      </section>
    </main>
  );
}

export default NotFound;

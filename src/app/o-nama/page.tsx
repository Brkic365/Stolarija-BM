"use client";

import React from "react";
import styles from "@/styles/pages/About.module.scss";
import tools from "../../../public/data/tools.json";

import { motion } from "framer-motion";

import Tool from "@/components/Tool";

const logos = ["scm", "egger", "blum", "biesse"];

function About() {
  return (
    <main className={styles.mainAbout}>
      {/* Hero section */}
      <section className={styles.hero}>
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.85 },
          }}
        >
          Upoznajte Stolariju BM
        </motion.h1>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <section className={styles.top}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            variants={{
              visible: { opacity: 1, scale: 1 },
              hidden: { opacity: 0, scale: 0.5 },
            }}
          >
            Preko 30 godina iskustva
          </motion.h2>

          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
          >
            Stolarija BM D.o.o. je ugledna tvrtka s više od 30 godina iskustva u
            stolarskoj industriji. Osnovana 1992. godine, naša priča počinje kao
            specijalizirana radionica za izradu (masivnih) stepenica, ograda i
            vrata. Tijekom godina, proširili smo svoju ekspertizu na prilagođeni
            namještaj i kuhinje po mjeri, koristeći kvalitetne materijale poput
            iverala i medijapana.
          </motion.p>
        </section>
        <section className={styles.bottom}>
          <motion.img
            src="/images/covers/furniture.webp"
            alt="O nama"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
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
          />
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
          >
            Ono što nas izdvaja je posvećenost tradiciji stolarskog majstorstva
            i neprestanoj želji za usavršavanjem. Naši stručnjaci suočavaju se s
            izazovima suvremene arhitekture s kombinacijom tradicionalnih
            vještina, modernih tehnologija i inovacija. Svaki komad namještaja
            koji izlazi iz naše radionice odražava spoj preciznosti, ljubavi
            prema drvetu i pažljivog pristupa dizajnu. S ponosom gradimo našu
            stolarsku baštinu, nudeći klijentima ne samo funkcionalne i estetski
            privlačne proizvode, već i iskustvo suradnje s stručnjacima koji
            dijele strast prema stolarstvu.
          </motion.p>
        </section>
      </section>

      {/* Details section */}
      <section className={styles.details}>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.5 }}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.5 },
          }}
        >
          Podaci o Firmi
        </motion.h2>

        <ul>
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.7 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(-100%)", opacity: 0 },
            }}
          >
            <h3>Stolarija BM d.o.o.</h3>
          </motion.li>
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.9 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(-100%)", opacity: 0 },
            }}
          >
            Djelatnosti: Interijeri, Proizvodnja namještaja
          </motion.li>
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.1 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(-100%)", opacity: 0 },
            }}
          >
            Matični broj:0590762
          </motion.li>
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.3 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(-100%)", opacity: 0 },
            }}
          >
            OIB: 78796206166
          </motion.li>
          <motion.li
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.5 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(-100%)", opacity: 0 },
            }}
          >
            MBS: 80376307
          </motion.li>
        </ul>
      </section>

      {/* Tools section */}
      <section className={styles.tools}>
        <h2>CNC Strojevi Koje Posjedujemo</h2>
        <section className={styles.toolGrid}>
          {tools.map((tool) => (
            <Tool key={tool.id} tool={tool} />
          ))}
        </section>
      </section>

      {/* Logos section */}
      <section className={styles.logos}>
        {logos.map((logo, i) => (
          <motion.img
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.2 }}
            variants={{
              visible: {
                transform:
                  "rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg)",
                opacity: 1,
              },
              hidden: {
                transform:
                  "rotateY(5deg) rotateX(10deg) translate(50px, -50px) skew(-10deg, 5deg)",
                opacity: 0,
              },
            }}
            src={`/images/logos/${logo}.webp`}
            alt={logo}
            key={logo}
          />
        ))}
      </section>
    </main>
  );
}

export default About;

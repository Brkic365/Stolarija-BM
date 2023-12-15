"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/pages/Home.module.scss";
import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();

  const [kitchensActive, setKitchensActive] = useState<boolean>(false);
  const [roomsActive, setRoomsActive] = useState<boolean>(true);
  const [furnitureActive, setFurnitureActive] = useState<boolean>(false);

  return (
    <main className={styles.main}>
      {/* Hero section */}
      <section className={styles.hero}>
        <section className={styles.text}>
          <motion.h1
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
            Prilagođavamo Drvo Vašim Snovima.
          </motion.h1>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.7 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(100%)", opacity: 0 },
            }}
          >
            Izrađujemo Namještaj i Kuhinje Sa Stilom i Pažnjom, Nasljedujući
            Stolarsku Umjetnost Od 1992.
          </motion.p>
        </section>
        <motion.section
          className={styles.cta}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 1 }}
          variants={{
            visible: { transform: "translateX(0)", opacity: 1 },
            hidden: { transform: "translateX(100%)", opacity: 0 },
          }}
        >
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
        </motion.section>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <section className={styles.top}>
          <motion.h1
            className={styles.bgText}
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
            O nama
          </motion.h1>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.8 }}
            variants={{
              visible: { transform: "translateX(0)", opacity: 1 },
              hidden: { transform: "translateX(100%)", opacity: 0 },
            }}
          >
            Više od 30 godina kreiramo unikatni namještaj i kuhinje po mjeri.
            Otkrijte našu stolarsku baštinu, Od kuhinja do personaliziranih
            dizajna.
          </motion.h2>
        </section>
        <section className={styles.content}>
          <motion.section
            className={styles.text}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.1 }}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
          >
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
          </motion.section>
          <motion.div
            className={styles.image}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 1.2 }}
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
        </section>
      </section>

      {/* Services section */}
      <section className={styles.services}>
        <div className={styles.backgrounds}>
          <motion.div
            className={styles.kitchensBg}
            initial="hidden"
            transition={{ duration: 0.5 }}
            animate={kitchensActive ? "visible" : "hidden"}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.3)",
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          />
          <motion.div
            className={styles.roomsBg}
            initial="hidden"
            transition={{ duration: 0.5 }}
            animate={roomsActive ? "visible" : "hidden"}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.3)",
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          />
          <motion.div
            className={styles.furnitureBg}
            initial="hidden"
            transition={{ duration: 0.5 }}
            animate={furnitureActive ? "visible" : "hidden"}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.3)",
                filter: "blur(4px)",
                opacity: 0,
              },
            }}
          />
        </div>

        <section
          className={styles.serviceKitchens}
          onClick={() => router.push("/web-shop/proizvodi?category=kitchens")}
          onMouseEnter={() => {
            setKitchensActive(true);
            setRoomsActive(false);
            setFurnitureActive(false);
          }}
        >
          <div className={styles.text}>
            <h1>Kuhinje</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.emptyButton}
            >
              Vidi sve <HiArrowSmRight />
            </motion.button>
          </div>
        </section>
        <section
          className={styles.serviceRooms}
          onClick={() => router.push("/web-shop/proizvodi?category=rooms")}
          onMouseEnter={() => {
            setKitchensActive(false);
            setRoomsActive(true);
            setFurnitureActive(false);
          }}
        >
          <div className={styles.text}>
            <h1>Dječje Sobe</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.emptyButton}
            >
              Vidi sve <HiArrowSmRight />
            </motion.button>
          </div>
        </section>
        <section
          className={styles.serviceFurniture}
          onClick={() => router.push("/web-shop/proizvodi?category=furniture")}
          onMouseEnter={() => {
            setKitchensActive(false);
            setRoomsActive(false);
            setFurnitureActive(true);
          }}
        >
          <div className={styles.text}>
            <h1>Namještaj</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.emptyButton}
            >
              Vidi sve <HiArrowSmRight />
            </motion.button>
          </div>
        </section>
      </section>
    </main>
  );
}

"use client";

import React from "react";
import styles from "@/styles/pages/Webshop.module.scss";
import productSections from "../../../public/data/products.json";

import Carousel from "@/components/Carousel";
import { EmblaOptionsType } from "embla-carousel-react";

import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import { motion } from "framer-motion";

const OPTIONS: EmblaOptionsType = {
  slidesToScroll: "auto",
  containScroll: "trimSnaps",
};

function Webshop() {
  const router = useRouter();

  return (
    <main className={styles.mainWebshop}>
      {/* Hero section */}
      <section className={styles.hero}>
        <h1>Web shop</h1>
      </section>

      {/* Products section */}
      <section className={styles.products}>
        {productSections.map((productSection, i) => (
          <section className={styles.productsType} key={i}>
            <section className={styles.top}>
              <div className={styles.left}>
                <h3>{productSection.name}</h3>
                <p>{productSection.description}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={styles.emptyButton}
                onClick={() =>
                  router.push(`/web-shop/proizvodi?filter=${i + 1}`)
                }
              >
                Vidi sve <HiArrowSmRight />
              </motion.button>
            </section>
            <Carousel products={productSection.products} options={OPTIONS} />
          </section>
        ))}
      </section>

      {/* See all section */}
      <section className={styles.seeAll}>
        <h3>Pregledaj cijelu ponudu!</h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={styles.button}
          onClick={() => router.push(`/web-shop/proizvodi`)}
        >
          Pregledaj sve
        </motion.button>
      </section>
    </main>
  );
}

export default Webshop;

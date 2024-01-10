"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/pages/Webshop.module.scss";
import productSections from "../../../public/data/productSections.json";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Carousel from "@/components/Carousel";
import { EmblaOptionsType } from "embla-carousel-react";

import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import { CircularProgress } from "@nextui-org/react";

import { motion } from "framer-motion";

const OPTIONS: EmblaOptionsType = {
  slidesToScroll: "auto",
  containScroll: "trimSnaps",
};

function Webshop() {
  const router = useRouter();

  const supabase = createClientComponentClient();

  const [products, setProducts] = useState<any[] | null>([]);

  const getProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");

    setProducts(data);
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <main className={styles.mainWebshop}>
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
          Web shop
        </motion.h1>
      </section>

      {/* Products section */}
      {!products || products.length === 0 ? (
        <div className={styles.loading}>
          <CircularProgress aria-label="Loading..." size="lg" color="default" />
        </div>
      ) : (
        <section className={styles.products}>
          {productSections.map((productSection) => {
            const sectionProducts = products!.filter(
              (product) => product.category === productSection.id
            );

            if (sectionProducts.length === 0) return null;

            return (
              <section className={styles.productsType} key={productSection.id}>
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
                      router.push(
                        `/web-shop/proizvodi?category=${productSection.id}`
                      )
                    }
                  >
                    Vidi sve <HiArrowSmRight />
                  </motion.button>
                </section>
                <Carousel products={sectionProducts} options={OPTIONS} />
              </section>
            );
          })}
        </section>
      )}

      {/* See all section */}
      <section className={styles.seeAll}>
        <motion.h3
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.85 },
          }}
        >
          Pregledaj cijelu ponudu!
        </motion.h3>
        <motion.button
          className={styles.button}
          onClick={() => router.push(`/web-shop/proizvodi`)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          variants={{
            visible: { opacity: 1 },
            hidden: { opacity: 0 },
          }}
        >
          Pregledaj sve
        </motion.button>
      </section>
    </main>
  );
}

export default Webshop;

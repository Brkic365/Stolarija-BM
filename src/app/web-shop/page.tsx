"use client";

import React, { useEffect, useState } from "react";
import styles from "@/styles/pages/Webshop.module.scss";
import productSections from "../../../public/data/productSections.json";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Carousel from "@/components/Carousel";
import { EmblaOptionsType } from "embla-carousel-react";

import { HiArrowSmRight } from "react-icons/hi";

import { useRouter } from "next/navigation";

import StatusMessage from "@/components/StatusMessage";
import ProductSkeleton from "@/components/ProductSkeleton";

import { motion } from "framer-motion";

const OPTIONS: EmblaOptionsType = {
  slidesToScroll: "auto",
  containScroll: "trimSnaps",
};

function Webshop() {
  const router = useRouter();

  const supabase = createClientComponentClient();

  const [products, setProducts] = useState<any[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const getProducts = async () => {
    setStatus("loading");
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("Failed to load products:", error.message);
      setStatus("error");
      return;
    }

    setProducts(data ?? []);
    setStatus("ready");
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
          Ponuda
        </motion.h1>
      </section>

      {/* Products section */}
      {status === "loading" ? (
        <ProductSkeleton count={4} />
      ) : status === "error" ? (
        <StatusMessage variant="error" onRetry={getProducts} />
      ) : products.length === 0 ? (
        <StatusMessage variant="empty" />
      ) : (
        <section className={styles.products}>
          {productSections.map((productSection) => {
            const sectionProducts = products.filter(
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
          transition={{ duration: 0.5, delay: 0.15 }}
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

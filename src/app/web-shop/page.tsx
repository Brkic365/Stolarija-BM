"use client";

import React from "react";
import styles from "@/styles/pages/Webshop.module.scss";
import productSections from "../../../public/data/products.json";

import { HiArrowSmRight } from "react-icons/hi";
import Product from "@/components/Product";

import { useRouter } from "next/navigation";

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
              <button
                className={styles.emptyButton}
                onClick={() =>
                  router.push(`/web-shop/proizvodi?filter=${i + 1}`)
                }
              >
                Vidi sve <HiArrowSmRight />
              </button>
            </section>

            <section className={styles.productsList}>
              <Product product={productSection.products[0]} />
              <Product product={productSection.products[1]} />
            </section>
          </section>
        ))}
      </section>

      {/* See all section */}
      <section className={styles.seeAll}>
        <h3>Pregledaj cijelu ponudu!</h3>
        <button
          className={styles.button}
          onClick={() => router.push(`/web-shop/proizvodi`)}
        >
          Pregledaj sve
        </button>
      </section>
    </main>
  );
}

export default Webshop;

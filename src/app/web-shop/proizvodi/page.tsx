import React from "react";
import styles from "@/styles/pages/Products.module.scss";
import productSections from "../../../../public/data/products.json";

import Product from "@/components/Product";
import Link from "next/link";

import { HiAdjustmentsHorizontal } from "react-icons/hi2";
import { HiChevronDown } from "react-icons/hi";

function Products() {
  return (
    <main className={styles.mainProducts}>
      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Top section */}
      <section className={styles.top}>
        <div className={styles.text}>
          <h2>Proizvodi</h2>
          <p>
            <Link href="/web-shop">Web shop</Link> / Proizvodi
          </p>
        </div>

        <div className={styles.buttons}>
          <button>
            <HiAdjustmentsHorizontal />
            Filter
          </button>
          <button>
            Najprodavaniji <HiChevronDown />
          </button>
        </div>
      </section>

      {/* Products section */}
      <section className={styles.products}>
        {productSections.map((productSection) => {
          return productSection.products.map((product, i) => {
            return (
              <div className={styles.productContainer}>
                <Product product={product} key={i} />
              </div>
            );
          });
        })}
      </section>
    </main>
  );
}

export default Products;

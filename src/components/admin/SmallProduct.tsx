"use client";

import React from "react";
import styles from "@/styles/components/admin/SmallProduct.module.scss";

import { productType } from "@/types/product";

function Product({ product }: { product: productType }) {
  return (
    <section className={styles.product}>
      <div className={styles.image}>
        <img src={product.image} alt={product.name} />
      </div>
      <h4>{product.name}</h4>
    </section>
  );
}

export default Product;

"use client";

import React from "react";
import styles from "@/styles/components/admin/SmallProduct.module.scss";

import { ProductType } from "@/types/product";

function Product({ product }: { product: ProductType }) {
  return (
    <section className={styles.product}>
      <div className={styles.image}>
        <img src={product.image_url} alt={product.name} />
      </div>
      <h4>{product.name}</h4>
    </section>
  );
}

export default Product;

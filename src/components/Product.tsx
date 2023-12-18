"use client";

import React from "react";
import styles from "@/styles/components/Product.module.scss";

import { ProductType } from "@/types/product";

import { useRouter } from "next/navigation";

function Product({ product }: { product: ProductType }) {
  const router = useRouter();

  return (
    <section
      className={styles.product}
      onClick={() => router.push(`/proizvod?id=${product.id}`)}
    >
      <div className={styles.image}>
        <img src={product.images[0].url} alt={product.name} />
      </div>
      <h4>{product.name}</h4>
      <p>Od €{product.price.toLocaleString("en-US")}</p>
    </section>
  );
}

export default Product;

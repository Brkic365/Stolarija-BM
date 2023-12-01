"use client";

import React from "react";
import styles from "@/styles/components/Product.module.scss";

import { productType } from "@/types/product";

import { useRouter } from "next/navigation";

function Product({ product }: { product: productType }) {
  const router = useRouter();

  return (
    <section
      className={styles.product}
      onClick={() => router.push("/proizvod?id=1")}
    >
      <img src={product.image} alt={product.name} />
      <h4>{product.name}</h4>
      <p>Od €{product.price.toLocaleString("en-US")}</p>
    </section>
  );
}

export default Product;

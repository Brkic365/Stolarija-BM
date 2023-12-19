"use client";

import React, { useState } from "react";
import styles from "@/styles/components/admin/SmallProduct.module.scss";

import { ProductType } from "@/types/product";

import UpdateProductModal from "./modals/UpdateProductModal";

function Product({
  product,
  updateData,
}: {
  product: ProductType;
  updateData: () => void;
}) {
  const [openProduct, setOpenProduct] = useState<ProductType | null>(null);

  return (
    <section className={styles.product} onClick={() => setOpenProduct(product)}>
      <UpdateProductModal
        product={openProduct}
        handleClose={() => setOpenProduct(null)}
        updateData={updateData}
      />
      <div className={styles.image}>
        <img src={product.images[0].url} alt={product.name} />
      </div>
      <h4>{product.name}</h4>
    </section>
  );
}

export default Product;

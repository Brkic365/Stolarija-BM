"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";
import rawProductSections from "../../../public/data/products.json";

import AddProductModal from "./modals/AddProductModal";

import SmallProduct from "./SmallProduct";

import { HiPlus } from "react-icons/hi";

type ProductType = {
  category: string;
  name: string;
  price: number;
  image: string;
  uploadDate: string;
};

function Products() {
  const [products, setProducts] = useState<ProductType[]>([]);

  const [addingProduct, setAddingProduct] = useState(false);

  // Filter by category and price
  useEffect(() => {
    // Flat the products into one array
    const flatProductsArray = rawProductSections.flatMap((val) =>
      val.products.map((product) => ({
        ...product,
        category: val.id,
      }))
    );
    setProducts(flatProductsArray);
  }, []);

  return (
    <section className={styles.products}>
      <AddProductModal
        open={addingProduct}
        handleClose={() => setAddingProduct(false)}
      />
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Proizvodi</h3>
          <p>21 Ukupno</p>
        </section>
        <section className={styles.right}>
          <button onClick={() => setAddingProduct(true)}>
            <HiPlus />
            Dodaj
          </button>
        </section>
      </section>

      <section className={styles.grid}>
        {products.map((product: ProductType, i: number) => {
          return (
            <div className={styles.productContainer} key={i}>
              <SmallProduct product={product} />
            </div>
          );
        })}
      </section>
    </section>
  );
}

export default Products;

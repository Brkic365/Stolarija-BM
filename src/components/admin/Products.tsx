"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { ProductType } from "@/types/product";

import AddProductModal from "./modals/AddProductModal";

import SmallProduct from "./SmallProduct";

import { HiPlus } from "react-icons/hi";

function Products() {
  const supabase = createClientComponentClient();

  const [total, setTotal] = useState<number>(0);

  const [products, setProducts] = useState<ProductType[]>([]);
  const [addingProduct, setAddingProduct] = useState(false);

  const getProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");

    if (data) {
      setProducts(data);
      setTotal(data.length);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <section className={styles.products}>
      <AddProductModal
        open={addingProduct}
        handleClose={() => setAddingProduct(false)}
        updateData={getProducts}
      />
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Proizvodi</h3>
          <p>{total} Ukupno</p>
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
              <SmallProduct product={product} updateData={getProducts} />
            </div>
          );
        })}
      </section>
    </section>
  );
}

export default Products;

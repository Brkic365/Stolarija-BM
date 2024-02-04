"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/ProductPage.module.scss";

import { useRouter, useSearchParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { HiArrowSmRight } from "react-icons/hi";

import PurchaseModal from "@/components/modals/PurchaseModal";
import ProductImagesCarousel from "@/components/ProductImagesCarousel";

import { motion } from "framer-motion";

import { EmblaOptionsType } from "embla-carousel-react";

import { CircularProgress } from "@nextui-org/react";
const OPTIONS: EmblaOptionsType = {};

function ProductPageLoading() {
  return (
    <main className={styles.mainProductLoading}>
      {/* Hero section */}
      <section className={styles.hero} />

      <div className={styles.loading}>
        <CircularProgress aria-label="Loading..." size="lg" color="default" />
      </div>
    </main>
  );
}

function ProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const idQuery = searchParams.get("id");

  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [product, setProduct] = useState<any | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const getProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select()
      .eq("id", idQuery);

    if (data && data.length > 0) {
      setProduct(data[0]);

      let tempUrls = [];

      for await (let image of data[0].images) {
        tempUrls.push(image.url);
      }

      setImageUrls(tempUrls);
    }
  };

  useEffect(() => {
    getProduct();
  }, [idQuery]);

  if (!product) return <ProductPageLoading />;

  return (
    <main className={styles.mainProduct}>
      <PurchaseModal
        open={purchaseModalOpen}
        handleClose={() => setPurchaseModalOpen(false)}
        product={product}
      />

      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Product section */}
      <section className={styles.product}>
        <motion.div
          className={styles.carouselHolder}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.85 },
          }}
        >
          <ProductImagesCarousel images={imageUrls} options={OPTIONS} />
        </motion.div>
        <section className={styles.productInfo}>
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            variants={{
              visible: { opacity: 1, scale: 1 },
              hidden: { opacity: 0, scale: 0.85 },
            }}
          >
            {product.name}
          </motion.h2>
          <motion.p
            className={styles.price}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
          >
            Od €{product.price.toLocaleString("en-US")}
          </motion.p>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            variants={{
              visible: { opacity: 1 },
              hidden: { opacity: 0 },
            }}
          >
            {product.description}
          </motion.p>
          <div className={styles.buttons}>
            <motion.button
              onClick={() => setPurchaseModalOpen(true)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              variants={{
                visible: { opacity: 1 },
                hidden: { opacity: 0 },
              }}
            >
              Naruči
            </motion.button>
            <motion.button
              className={styles.emptyButton}
              onClick={() => router.push("/kontakt")}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 }}
              variants={{
                visible: { opacity: 1 },
                hidden: { opacity: 0 },
              }}
            >
              Kontaktiraj nas <HiArrowSmRight />
            </motion.button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProductPage;

"use client";

import React, { useState } from "react";
import styles from "@/styles/pages/ProductPage.module.scss";

import { useRouter } from "next/navigation";

import { HiArrowSmRight } from "react-icons/hi";

import PurchaseModal from "@/components/Modals/PurchaseModal";

import { motion } from "framer-motion";

import ProductImagesCarousel from "@/components/ProductImagesCarousel";

import { EmblaOptionsType } from "embla-carousel-react";

const OPTIONS: EmblaOptionsType = {};

function ProductPage() {
  const router = useRouter();

  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);

  return (
    <main className={styles.mainProduct}>
      <PurchaseModal
        open={purchaseModalOpen}
        handleClose={() => setPurchaseModalOpen(false)}
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
          <ProductImagesCarousel
            images={[
              "/images/kitchens/essence.png",
              "/images/kitchens/boutique.png",
              "/images/kitchens/huncho.png",
              "/images/kitchens/imperial.png",
              "/images/kitchens/tunechi.png",
            ]}
            options={OPTIONS}
          />
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
            Essence Kuhinja
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
            Od €{(149999).toLocaleString("en-US")}
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
            Kuhinja Imperial predstavlja vrhunski spoj elegancije i
            funkcionalnosti. Sa sofisticiranim dizajnom i pažljivim detaljima,
            ova kuhinja oduševljava svojom luksuznom pojavom. Visokokvalitetni
            materijali kombiniraju se s inovativnim rješenjima kako bi stvorili
            prostor gdje se estetika susreće s praktičnošću.
            <br />
            <br /> Imperial kuhinja pruža obilje prostora za organizaciju, s
            pametno osmišljenim elementima za skladištenje. Osvjetljenje je
            pažljivo integrirano kako bi se stvorila ugodna atmosfera, čineći
            svaku kulinarsku avanturu posebnom. Svaki element ove kuhinje
            odražava vrhunsku izradu i posvećenost detaljima.
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

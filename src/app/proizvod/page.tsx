"use client";

import React, { useState } from "react";
import styles from "@/styles/pages/ProductPage.module.scss";

import { HiArrowSmRight } from "react-icons/hi";

import PurchaseModal from "@/components/Modals/PurchaseModal";

function ProductPage() {
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
        <img src="/images/kitchens/essence.png" alt="Product" />
        <section className={styles.productInfo}>
          <h2>Essence Kuhinja</h2>
          <p className={styles.price}>Od €{(149999).toLocaleString("en-US")}</p>
          <p>
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
          </p>
          <div className={styles.buttons}>
            <button onClick={() => setPurchaseModalOpen(true)}>Naruči</button>
            <button className={styles.emptyButton}>
              Kontaktiraj nas <HiArrowSmRight />
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

export default ProductPage;

import React from "react";
import styles from "@/styles/pages/NotFound.module.scss";

function NotFound() {
  return (
    <main className={styles.notFound}>
      {/* Hero section */}
      <section className={styles.hero}></section>

      {/* Content section */}
      <section className={styles.content}>
        <h1 className={styles.bigText}>404</h1>
        <section className={styles.text}>
          <h2>Nešto je pošlo po krivu...</h2>
          <p>
            Nažalost, ne možemo pronaći stranicu koju tražite. Možda ste
            pogriješili adresu ili stranica više ne postoji.
          </p>
          <button>Povratak na početnu</button>
        </section>
      </section>
    </main>
  );
}

export default NotFound;

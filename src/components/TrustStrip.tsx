import React from "react";
import styles from "@/styles/components/TrustStrip.module.scss";

const stats = [
  { value: "Od 1992.", label: "obiteljska stolarija" },
  { value: "CNC", label: "Biesse i SCM strojevi" },
  { value: "Po mjeri", label: "izmjera, dizajn i montaža" },
];

const partners = ["egger", "blum", "biesse", "scm"];

// Short proof-of-quality band under the hero
function TrustStrip() {
  return (
    <section className={styles.strip} aria-label="Zašto Stolarija BM">
      <ul className={styles.stats}>
        {stats.map((stat) => (
          <li key={stat.value}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </ul>
      <div className={styles.partners}>
        <span>Radimo s materijalima i strojevima</span>
        <ul>
          {partners.map((partner) => (
            <li key={partner}>
              <img
                src={`/images/logos/${partner}.webp`}
                alt={partner.toUpperCase()}
                loading="lazy"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default TrustStrip;

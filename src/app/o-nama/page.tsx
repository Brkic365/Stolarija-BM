import React from "react";
import styles from "@/styles/pages/About.module.scss";

function About() {
  return (
    <main className={styles.mainAbout}>
      {/* Hero section */}
      <section className={styles.hero}>
        <h1>Upoznajte Stolariju BM</h1>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <section className={styles.text}>
          <h2>Preko 30 godina iskustva</h2>
          <p>
            Stolarija BM D.o.o. je ugledna tvrtka s više od 30 godina iskustva u
            stolarskoj industriji. Osnovana 1992. godine, naša priča počinje kao
            specijalizirana radionica za izradu (masivnih) stepenica, ograda i
            vrata. Tijekom godina, proširili smo svoju ekspertizu na prilagođeni
            namještaj i kuhinje po mjeri, koristeći kvalitetne materijale poput
            iverala i medijapana.
          </p>
          <img src="/images/kitchens/kitchen_2.png" alt="O nama" />
          <p>
            Ono što nas izdvaja je posvećenost tradiciji stolarskog majstorstva
            i neprestanoj želji za usavršavanjem. Naši stručnjaci suočavaju se s
            izazovima suvremene arhitekture s kombinacijom tradicionalnih
            vještina, modernih tehnologija i inovacija. Svaki komad namještaja
            koji izlazi iz naše radionice odražava spoj preciznosti, ljubavi
            prema drvetu i pažljivog pristupa dizajnu. S ponosom gradimo našu
            stolarsku baštinu, nudeći klijentima ne samo funkcionalne i estetski
            privlačne proizvode, već i iskustvo suradnje s stručnjacima koji
            dijele strast prema stolarstvu.
          </p>
        </section>
      </section>

      {/* Details section */}
      <section className={styles.details}>
        <h2>Podaci o Firmi</h2>
        <h3>Stolarija BM d.o.o.</h3>
        <ul>
          <li>Djelatnosti: Interijeri, Proizvodnja namještaja</li>
          <li>Matični broj:0590762</li>
          <li>OIB: 78796206166</li>
          <li>MBS: 80376307</li>
          <li>Račun: 2360000-1101318752</li>
        </ul>
      </section>

      {/* Tools section */}
      <section className={styles.tools}>
        <h2>CNC Strojevi Koje Posjedujemo</h2>
        <section className={styles.tool}>
          <img src="/images/tools/biesse_rover_b.png" alt="Biesse Rover B" />
          <div className={styles.text}>
            <h3>Biesse Rover B</h3>
            <p>
              Obradni centar dizajniran kako za vješte zanatlije tako i za
              industriju velikih razmjera. Podesiv i visokih performansi,
              osigurava kvalitetan završetak i pouzdan je pod svim radnim
              uvjetima.
            </p>
          </div>
        </section>
        <section className={styles.tool}>
          <img
            src="/images/tools/scm_olimpic_k_500.png"
            alt="SCM OLIMPIC K 500"
          />
          <div className={styles.text}>
            <h3>SCM OLIMPIC K 500</h3>
            <p>
              Obradni centar dizajniran kako za vješte zanatlije tako i za
              industriju velikih razmjera. Podesiv i visokih performansi,
              osigurava kvalitetan završetak i pouzdan je pod svim radnim
              uvjetima.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}

export default About;

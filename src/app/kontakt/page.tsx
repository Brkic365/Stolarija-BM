import React from "react";
import styles from "@/styles/pages/Contact.module.scss";
import {
  HiMapPin,
  HiClock,
  HiPhone,
  HiEnvelope,
  HiChatBubbleBottomCenter,
} from "react-icons/hi2";

import Map from "@/components/Map";

function Contact() {
  return (
    <main className={styles.mainContact}>
      {/* Hero section */}
      <section className={styles.hero}>
        <h1>Stvorimo nešto zajedno</h1>
      </section>

      {/* Contact section */}
      <section className={styles.contact}>
        <section className={styles.info}>
          <h2>KONTAKT</h2>
          <div className={styles.infoBlock}>
            <HiMapPin />
            <ul>
              <li>Dragutina Domjanića 37</li>
              <li>Sesvetski Kraljevec</li>
              <li>Zagreb, HR-10361</li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiClock />
            <ul>
              <li>Pon - Pet: 8:00 - 17:00</li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiPhone />
            <ul>
              <li>Mobitel: 095 1991 128</li>
              <li>Fax: 01 2046 348</li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiEnvelope />
            <ul>
              <li>kontakt@stolarija-bm.hr</li>
            </ul>
          </div>
          <div className={styles.chatBlock}>
            <HiChatBubbleBottomCenter />
            <div className={styles.content}>
              <p>Pošalji nam poruku</p>
              <form>
                <input placeholder="Ime" />
                <input placeholder="Broj telefona" />
                <input placeholder="E-mail adresa" />
                <textarea placeholder="Poruka" rows={5} />
                <button>Pošalji</button>
              </form>
            </div>
          </div>
        </section>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2780.59842449666!2d16.173364!3d45.8193003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47667a0c62f3beef%3A0x3805866b92e692a2!2sUl.%20D.%20Domjani%C4%87a%2037%2C%2010360%2C%20Sesvete!5e0!3m2!1shr!2shr!4v1701124200543!5m2!1shr!2shr"
          width="600"
          height="450"
          loading="lazy"
          className={styles.map}
        />
      </section>
    </main>
  );
}

export default Contact;

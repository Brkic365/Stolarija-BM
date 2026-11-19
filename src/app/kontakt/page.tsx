"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "@/styles/pages/Contact.module.scss";
import {
  HiMapPin,
  HiClock,
  HiPhone,
  HiEnvelope,
  HiChatBubbleBottomCenter,
} from "react-icons/hi2";

import Modal from "@mui/material/Modal";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { motion } from "framer-motion";

function MessageSuccessMessage({
  open,
  handleClose,
  failed = false,
}: {
  open: boolean;
  handleClose: () => void;
  failed?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <section className={styles.sentMessageModal}>
        <section className={styles.success}>
          <motion.img
            src={failed ? "/images/icons/fail.webp" : "/images/icons/success.webp"}
            alt={failed ? "Greška" : "Uspjeh"}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.06 }}
            variants={{
              visible: {
                transform: "scale(1)",
                filter: "blur(0px)",
                opacity: 1,
              },
              hidden: {
                transform: "scale(1.03)",
                filter: "blur(0px)",
                opacity: 0,
              },
            }}
          />
          <motion.h3
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            variants={{
              visible: {
                opacity: 1,
              },
              hidden: {
                opacity: 0,
              },
            }}
          >
            {failed ? "Poruka nije poslana" : "Poruka uspješno poslana!"}
          </motion.h3>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.24 }}
            variants={{
              visible: {
                opacity: 1,
              },
              hidden: {
                opacity: 0,
              },
            }}
          >
            {failed
              ? "Došlo je do greške. Nazovite nas na 095 198 9479 ili pišite na WhatsApp."
              : "Hvala Vam na poruci. Javit ćemo Vam se u najkraćem mogućem roku."}
          </motion.p>
          <motion.button
            onClick={handleClose}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            variants={{
              visible: {
                opacity: 1,
              },
              hidden: {
                opacity: 0,
              },
            }}
          >
            Zatvori
          </motion.button>
        </section>
      </section>
    </Modal>
  );
}

function Contact() {
  const supabase = createClientComponentClient();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const [messageSuccess, setMessageSuccess] = useState<boolean>(false);
  const [messageFailed, setMessageFailed] = useState<boolean>(false);
  const [canSend, setCanSend] = useState<boolean>(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const reset = () => {
    setName("");
    setEmail("");
    setNumber("");
    setMessage("");

    nameRef.current!.value = "";
    emailRef.current!.value = "";
    numberRef.current!.value = "";
    messageRef.current!.value = "";
  };

  const sendMessage = async (e: any) => {
    e.preventDefault();

    if (name === "" || email === "" || number === "" || message === "") {
      return;
    }

    const insertRes = await supabase.from("messages").insert({
      name,
      email,
      telephone: number,
      message,
    });

    if (insertRes.error) {
      console.error("Failed to send message:", insertRes.error.message);
      setMessageFailed(true);
    } else {
      setMessageSuccess(true);
      reset();
    }
  };

  // Update so user can send once all values of the form are filled
  useEffect(() => {
    if (name !== "" && email !== "" && number !== "" && message !== "") {
      setCanSend(true);
    } else {
      setCanSend(false);
    }
  }, [name, email, number, message]);

  return (
    <main className={styles.mainContact}>
      <MessageSuccessMessage
        open={messageSuccess}
        handleClose={() => setMessageSuccess(false)}
      />
      <MessageSuccessMessage
        open={messageFailed}
        failed
        handleClose={() => setMessageFailed(false)}
      />

      {/* Hero section */}
      <section className={styles.hero}>
        <motion.h1
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          variants={{
            visible: { opacity: 1, scale: 1 },
            hidden: { opacity: 0, scale: 0.85 },
          }}
        >
          Stvorimo nešto zajedno
        </motion.h1>
      </section>

      {/* Contact section */}
      <section className={styles.contact}>
        <section className={styles.info}>
          <h2>KONTAKT</h2>
          <div className={styles.infoBlock}>
            <HiMapPin />
            <ul>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Dragutina Domjanića 37
              </motion.li>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Sesvetski Kraljevec
              </motion.li>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Zagreb, HR-10361
              </motion.li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiClock />
            <ul>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Pon - Pet: 8:00 - 17:00
              </motion.li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiPhone />
            <ul>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                <a href="tel:+385951989479">Mobitel: 095 198 9479</a>
              </motion.li>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.12 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Fax: 01 2046 348
              </motion.li>
            </ul>
          </div>
          <div className={styles.infoBlock}>
            <HiEnvelope />
            <ul>
              <motion.li
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                stolarijabm123@gmail.com
              </motion.li>
            </ul>
          </div>
          <div className={styles.chatBlock}>
            <HiChatBubbleBottomCenter />
            <div className={styles.content}>
              <motion.p
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.06 }}
                variants={{
                  visible: { transform: "translateY(0)", opacity: 1 },
                  hidden: { transform: "translateY(16px)", opacity: 0 },
                }}
              >
                Pošalji nam poruku
              </motion.p>
              <form>
                <motion.input
                  placeholder="Ime"
                  id="name"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  variants={{
                    visible: { transform: "translateY(0)", opacity: 1 },
                    hidden: { transform: "translateY(16px)", opacity: 0 },
                  }}
                  ref={nameRef}
                  onChange={(e) => setName(e.target.value)}
                />
                <motion.input
                  placeholder="Broj telefona"
                  type="telephone"
                  id="telephone"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.18 }}
                  variants={{
                    visible: { transform: "translateY(0)", opacity: 1 },
                    hidden: { transform: "translateY(16px)", opacity: 0 },
                  }}
                  ref={numberRef}
                  onChange={(e) => setNumber(e.target.value)}
                />
                <motion.input
                  placeholder="E-mail adresa"
                  type="email"
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.24 }}
                  variants={{
                    visible: { transform: "translateY(0)", opacity: 1 },
                    hidden: { transform: "translateY(16px)", opacity: 0 },
                  }}
                  ref={emailRef}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <motion.textarea
                  placeholder="Poruka"
                  rows={5}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  variants={{
                    visible: { transform: "translateY(0)", opacity: 1 },
                    hidden: { transform: "translateY(16px)", opacity: 0 },
                  }}
                  ref={messageRef}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <motion.button
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.36 }}
                  variants={{
                    visible: { transform: "translateY(0)", opacity: 1 },
                    hidden: { transform: "translateY(16px)", opacity: 0 },
                  }}
                  onClick={sendMessage}
                  disabled={!canSend}
                  className={canSend ? styles.canSend : styles.disabled}
                >
                  Pošalji
                </motion.button>
              </form>
            </div>
          </div>
        </section>

        <motion.iframe
          src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2780.59842449666!2d16.173364!3d45.8193003!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47667a0c62f3beef%3A0x3805866b92e692a2!2sUl.%20D.%20Domjani%C4%87a%2037%2C%2010360%2C%20Sesvete!5e0!3m2!1shr!2shr!4v1701124200543!5m2!1shr!2shr"
          width="600"
          height="450"
          loading="lazy"
          className={styles.map}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          variants={{
            visible: {
              transform: "scale(1)",
              filter: "blur(0px)",
              opacity: 1,
            },
            hidden: {
              transform: "scale(1.03)",
              filter: "blur(0px)",
              opacity: 0,
            },
          }}
        />
      </section>
    </main>
  );
}

export default Contact;

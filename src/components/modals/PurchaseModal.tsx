"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "@/styles/components/modals/PurchaseModal.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Link from "next/link";

import { HiArrowSmRight, HiOutlineExclamationCircle } from "react-icons/hi";
import { HiXMark } from "react-icons/hi2";

import Modal from "@mui/material/Modal";

import { motion } from "framer-motion";
import { ProductType } from "@/types/product";

function PurchaseModal({
  open,
  handleClose,
  product,
}: {
  open: boolean;
  handleClose: () => void;
  product: ProductType;
}) {
  const supabase = createClientComponentClient();

  const [orderSuccess, setOrderSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const surnameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const numberRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const close = () => {
    setOrderSuccess(null);
    handleClose();
  };

  const order = async (e: any) => {
    e.preventDefault();

    const name = nameRef.current!.value;
    const surname = surnameRef.current!.value;
    const email = emailRef.current!.value;
    const number = numberRef.current!.value;
    const address = addressRef.current!.value;
    const message = messageRef.current!.value;

    if (
      name === "" ||
      surname === "" ||
      email === "" ||
      number === "" ||
      address === ""
    ) {
      setError("Molimo Vas popunite sva polja.");
      return;
    }

    const insertRes = await supabase.from("orders").insert({
      product: product.name,
      price: product.price,
      first_name: name,
      last_name: surname,
      email,
      telephone: number,
      address,
      message,
    });

    const updateProductRes = await supabase.rpc("increment", {
      x: 1,
      row_id: product.id,
    });

    if (insertRes.error || updateProductRes.error) {
      console.log(insertRes.error, updateProductRes.error);
      setError("Greška prilikom narudžbe.");
    } else {
      const emailRes = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: product.name,
          price: product.price,
          first_name: name,
          last_name: surname,
          email,
          telephone: number,
          address,
          message,
        }),
      });

      console.log(emailRes);

      setOrderSuccess(true);
    }
  };

  useEffect(() => {
    if (error) {
      let timeout = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [error]);

  const errorVariants = {
    visible: { opacity: 1, height: "100%" },
    hidden: { opacity: 0, height: "0" },
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <section className={styles.purchaseModal}>
        <section className={styles.top}>
          <h3>Potvrda narudžbe</h3>
          <HiXMark onClick={close} />
        </section>

        {orderSuccess === true && (
          <section className={styles.success}>
            <motion.img
              src="/images/icons/success.webp"
              alt="Success icon"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variants={{
                visible: {
                  transform: "scale(1)",
                  filter: "blur(0px)",
                  opacity: 1,
                },
                hidden: {
                  transform: "scale(1.5)",
                  filter: "blur(4px)",
                  opacity: 0,
                },
              }}
            />
            <motion.h3
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              variants={{
                visible: {
                  opacity: 1,
                },
                hidden: {
                  opacity: 0,
                },
              }}
            >
              Narudžba uspješno poslana!
            </motion.h3>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              variants={{
                visible: {
                  opacity: 1,
                },
                hidden: {
                  opacity: 0,
                },
              }}
            >
              Hvala Vam na povjerenju. Javit ćemo Vam se u najkraćem mogućem
              roku.
            </motion.p>
            <motion.button
              onClick={close}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 1 }}
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
        )}

        {orderSuccess === false && (
          <section className={styles.fail}>
            <motion.img
              src="/images/icons/fail.webp"
              alt="Fail icon"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variants={{
                visible: {
                  transform: "scale(1)",
                  filter: "blur(0px)",
                  opacity: 1,
                },
                hidden: {
                  transform: "scale(1.5)",
                  filter: "blur(4px)",
                  opacity: 0,
                },
              }}
            />
            <motion.h3
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              variants={{
                visible: {
                  opacity: 1,
                },
                hidden: {
                  opacity: 0,
                },
              }}
            >
              Greška prilikom narudžbe!
            </motion.h3>
            <motion.p
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              variants={{
                visible: {
                  opacity: 1,
                },
                hidden: {
                  opacity: 0,
                },
              }}
            >
              Molimo Vas pokušajte ponovno ili nas kontaktirajte{" "}
              <Link href="/kontakt">ovdje</Link>.
            </motion.p>
            <section className={styles.buttons}>
              <motion.button
                onClick={() => setOrderSuccess(null)}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1 }}
                variants={{
                  visible: {
                    opacity: 1,
                  },
                  hidden: {
                    opacity: 0,
                  },
                }}
              >
                Pokušaj ponovno
              </motion.button>
              <motion.button
                className={styles.emptyButton}
                onClick={close}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.2 }}
                variants={{
                  visible: {
                    opacity: 1,
                  },
                  hidden: {
                    opacity: 0,
                  },
                }}
              >
                Odustani <HiArrowSmRight />
              </motion.button>
            </section>
          </section>
        )}

        {orderSuccess === null && (
          <form onSubmit={order}>
            <section className={styles.inputRow}>
              <input placeholder="Ime" ref={nameRef} id="name" />
              <input placeholder="Prezime" ref={surnameRef} id="surname" />
            </section>
            <section className={styles.inputRow}>
              <input placeholder="Email" ref={emailRef} type="email" />
              <input
                placeholder="Telefonski broj"
                ref={numberRef}
                type="telephone"
                id="telephone"
              />
            </section>
            <input
              className={styles.fullInput}
              placeholder="Adresa"
              id="address"
              ref={addressRef}
            />
            <textarea
              placeholder="Dodatne informacije (neobavezno)"
              ref={messageRef}
              rows={10}
            />
            <motion.div
              className={styles.error}
              animate={error ? "visible" : "hidden"}
              variants={errorVariants}
            >
              <HiOutlineExclamationCircle />
              <p>{error}</p>
            </motion.div>

            <section className={styles.buttons}>
              <button type="submit">Naruči</button>
              <button className={styles.emptyButton} onClick={close}>
                Odustani <HiArrowSmRight />
              </button>
            </section>
          </form>
        )}
      </section>
    </Modal>
  );
}

export default PurchaseModal;

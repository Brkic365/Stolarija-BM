"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "@/styles/components/modals/PurchaseModal.module.scss";
import { motion } from "framer-motion";
import { ProductType } from "@/types/product";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Modal from "@mui/material/Modal";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { formatPrice } from "@/lib/format";

function PurchaseModal({
  open,
  handleClose,
  product,
}: {
  open: boolean;
  handleClose: () => void;
  product: ProductType;
}) {
  const [orderSuccess, setOrderSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const configuration = useSelector((state: RootState) => state.configuration.selectedOptions);

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

    const form = new FormData();
    form.append("productId", String(product.id));
    form.append("first_name", name);
    form.append("last_name", surname);
    form.append("email", email);
    form.append("telephone", number);
    form.append("address", address);
    form.append("message", message);
    form.append("configuration", JSON.stringify(configuration ?? {}));
    if (selectedFile) form.append("sketch", selectedFile);

    setIsUploading(true);
    try {
      const res = await fetch("/api/orders", { method: "POST", body: form });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        setError(body?.error ?? "Greška prilikom narudžbe.");
      } else {
        setError(null);
        setOrderSuccess(true);
      }
    } catch (err) {
      setError("Greška prilikom narudžbe. Provjerite internetsku vezu.");
    } finally {
      setIsUploading(false);
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

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className={styles.modalOverlay}
    >
      {/* Main Card Container */}
      <div className={styles.modalContainer}>

        {/* Success State */}
        {orderSuccess === true && (
          <div className={styles.statusContainer}>
            <motion.img
              src="/images/icons/success.webp"
              alt="Success icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <h3>Narudžba uspješno poslana!</h3>
            <p>Hvala Vam na povjerenju. Javit ćemo Vam se u najkraćem mogućem roku.</p>
            <button onClick={close} className={styles.closeStatusBtn}>
              Zatvori
            </button>
          </div>
        )}

        {/* Fail State */}
        {orderSuccess === false && (
          <div className={styles.statusContainer}>
            <motion.img
              src="/images/icons/fail.webp"
              alt="Fail icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
            <h3>Greška prilikom narudžbe!</h3>
            <p>Molimo Vas pokušajte ponovno ili nas kontaktirajte.</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => setOrderSuccess(null)} className={styles.retryBtn}>
                Pokušaj ponovno
              </button>
              <button onClick={close} className={styles.cancelBtn}>
                Odustani
              </button>
            </div>
          </div>
        )}

        {/* Form State (Main Skeleton) */}
        {orderSuccess === null && (
          <>
            {/* Close Button (Absolute Top) */}
            <button onClick={handleClose} className={styles.closeButtonAbsolute}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* LEFT COLUMN: Summary */}
            <div className={styles.summaryColumn}>
              <div className={styles.productHeader}>
                {/* Thumbnail Image */}
                {product.images && product.images[0] && (
                  <div className={styles.thumbnail}>
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                    />
                  </div>
                )}
                <div className={styles.productInfo}>
                  <h3>{product.name}</h3>
                  <p>{formatPrice(product.price)}</p>
                </div>
              </div>

              {/* Configuration List */}
              <div className={styles.configurationList}>
                <h4>Vaša Konfiguracija</h4>
                <div className="space-y-3">
                  {Object.entries(configuration || {}).map(([key, value]) => (
                    <div key={key} className={styles.configItem}>
                      <span className={styles.check}>✓</span>
                      <span className={styles.label}>{key}:</span>
                      <span className={styles.value}>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Form */}
            <div className={styles.formColumn}>
              <div className={styles.formHeader}>
                <h2>Podaci za dostavu</h2>
              </div>

              <form onSubmit={order}>
                {/* Name Row */}
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Ime</label>
                    <input ref={nameRef} placeholder="Ivan" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Prezime</label>
                    <input ref={surnameRef} placeholder="Horvat" />
                  </div>
                </div>

                {/* Contact Row */}
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Email</label>
                    <input ref={emailRef} type="email" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Telefon</label>
                    <input ref={numberRef} type="tel" />
                  </div>
                </div>

                {/* Address */}
                <div className={styles.inputGroup}>
                  <label>Adresa</label>
                  <input ref={addressRef} placeholder="Ulica i broj, Grad" />
                </div>

                {/* Message */}
                <div className={styles.inputGroup}>
                  <label>Napomena</label>
                  <textarea ref={messageRef} rows={3} placeholder="Kat, šifra ulaza..." />
                </div>

                {/* File Upload Placeholder */}
                <label className={styles.fileUpload}>
                  {selectedFile ? (
                    <div className="text-center">
                      <span className={styles.fileName}>{selectedFile.name}</span>
                      <span className={styles.fileHelp}>Kliknite za promjenu</span>
                    </div>
                  ) : (
                    <span className="text-sm">Imate skicu prostora? (Neobavezno)</span>
                  )}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>

                <motion.div
                  initial={false}
                  animate={error ? { height: 'auto', opacity: 1, marginTop: 12 } : { height: 0, opacity: 0, marginTop: 0 }}
                  className="overflow-hidden"
                >
                  <div className={styles.errorMessage}>
                    <HiOutlineExclamationCircle className="text-xl shrink-0" />
                    <p>{error}</p>
                  </div>
                </motion.div>

                {/* Buttons */}
                <div className={styles.actions}>
                  <button type="submit" disabled={isUploading} className={styles.submitBtn}>
                    {isUploading ? "Šaljem..." : "Potvrdi narudžbu"}
                  </button>
                  <button type="button" onClick={handleClose} className={styles.cancelBtn}>
                    Odustani
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default PurchaseModal;

import React, { useState } from "react";
import styles from "@/styles/components/admin/modals/OrderModal.module.scss";

import Modal from "@mui/material/Modal";

import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";

import { motion } from "framer-motion";

import { HiXMark } from "react-icons/hi2";

function DeleteOrder({ close }: { close: () => void }) {
  return (
    <section className={styles.deleteModal}>
      <section className={styles.top}>
        <h3>Brisanje Narudžbe</h3>
        <HiXMark onClick={close} />
      </section>

      <section className={styles.deleteContent}>
        <h1>Jeste li sigurni da želite obrisati narudžbu?</h1>
        <p>
          Nakon brisanja, ova narudžba se ne može vratiti te je zauvijek
          obrisana.
        </p>
      </section>

      <section className={styles.buttons}>
        <button className={styles.delete} onClick={close}>
          Obriši
        </button>
        <button onClick={close}>Odustani</button>
      </section>
    </section>
  );
}

function OrderModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const [statusOption, setStatusOption] = useState(0);

  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setDeleting(false);
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {deleting ? (
        <DeleteOrder close={close} />
      ) : (
        <section className={styles.orderModal}>
          <section className={styles.top}>
            <h3>Narudžba</h3>
            <HiXMark onClick={close} />
          </section>

          <section className={styles.content}>
            <section className={styles.order}>
              <div className={styles.info}>
                <div className={styles.infoBlock}>
                  <ul className={styles.labels}>
                    <li>Proizvod:</li>
                    <li>Ime:</li>
                    <li>Prezime:</li>
                  </ul>
                  <ul className={styles.values}>
                    <li>Imperial Kuhinja</li>
                    <li>Ivan</li>
                    <li>Horvat</li>
                  </ul>
                </div>
                <div className={styles.infoBlock}>
                  <ul className={styles.labels}>
                    <li>Email:</li>
                    <li>Telefon:</li>
                    <li>Adresa:</li>
                  </ul>
                  <ul className={styles.values}>
                    <li>ivanhorvat@gmail.com</li>
                    <li>095 444 5555</li>
                    <li>Ulica kralja Držislava 5, Vrbik, Zagreb, 10 000</li>
                  </ul>
                </div>
              </div>

              <div className={styles.message}>
                <p className={styles.label}>Poruka:</p>
                <p className={styles.value}>
                  Radujem se suradnji s vama na stvaranju moje idealne kuhinje!
                  Želio bih naglasiti nekoliko detalja kako biste mogli bolje
                  razumjeti moje potrebe. Preferiram moderni minimalizam s
                  naglaskom na funkcionalnosti. Boje koje volim su neutralne
                  nijanse poput bijele, sive i drvenih tonova. Također, važno mi
                  je da kuhinja ima dovoljno prostora za pohranu, te bih cijenio
                  inovativna rješenja poput izvučnih polica i organizatora
                  ladica.
                </p>
              </div>

              <div className={styles.status}>
                <p className={styles.label}>Status:</p>
                <div className={styles.statusOptions}>
                  <div
                    className={`${styles.green} ${
                      statusOption === 0 ? styles.selected : undefined
                    }`}
                    onClick={() => setStatusOption(0)}
                  >
                    <HiOutlineCheckCircle />
                    <p>Gotovo</p>
                  </div>
                  <div
                    className={`${styles.blue} ${
                      statusOption === 1 ? styles.selected : undefined
                    }`}
                    onClick={() => setStatusOption(1)}
                  >
                    <HiOutlineClock />
                    <p>U izradi</p>
                  </div>
                  <div
                    className={`${styles.red} ${
                      statusOption === 2 ? styles.selected : undefined
                    }`}
                    onClick={() => setStatusOption(2)}
                  >
                    <HiOutlineClock />
                    <p>Čeka</p>
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.buttons}>
              <button
                className={styles.delete}
                onClick={() => setDeleting(true)}
              >
                Obriši
              </button>
              <button onClick={close}>Zatvori</button>
            </section>
          </section>
        </section>
      )}
    </Modal>
  );
}

export default OrderModal;

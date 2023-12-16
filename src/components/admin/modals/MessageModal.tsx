import React, { useState } from "react";
import styles from "@/styles/components/admin/modals/MessageModal.module.scss";

import Modal from "@mui/material/Modal";

import { HiXMark } from "react-icons/hi2";

function DeleteMessage({ close }: { close: () => void }) {
  return (
    <section className={styles.deleteModal}>
      <section className={styles.top}>
        <h3>Brisanje Poruke</h3>
        <HiXMark onClick={close} />
      </section>

      <section className={styles.deleteContent}>
        <h1>Jeste li sigurni da želite obrisati poruku?</h1>
        <p>
          Nakon brisanja, ova poruku se ne može vratiti te je zauvijek obrisana.
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

function MessageModal({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
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
        <DeleteMessage close={close} />
      ) : (
        <section className={styles.messageModal}>
          <section className={styles.top}>
            <h3>Poruka</h3>
            <HiXMark onClick={close} />
          </section>

          <div className={styles.infoBlock}>
            <ul className={styles.labels}>
              <li>Ime:</li>
              <li>Email:</li>
              <li>Telefon:</li>
              <li>Poruka:</li>
            </ul>
            <ul className={styles.values}>
              <li>Ivan</li>
              <li>ivanhorvat@gmail.com</li>
              <li>095 444 5555</li>
              <li>
                Radujem se suradnji s vama na stvaranju moje idealne kuhinje!
                Želio bih naglasiti nekoliko detalja kako biste mogli bolje
                razumjeti moje potrebe. Preferiram moderni minimalizam s
                naglaskom na funkcionalnosti. Boje koje volim su neutralne
                nijanse poput bijele, sive i drvenih tonova. Također, važno mi
                je da kuhinja ima dovoljno prostora za pohranu, te bih cijenio
                inovativna rješenja poput izvučnih polica i organizatora ladica.
              </li>
            </ul>
          </div>

          <section className={styles.buttons}>
            <button className={styles.delete} onClick={() => setDeleting(true)}>
              Obriši
            </button>
            <button onClick={close}>Zatvori</button>
          </section>
        </section>
      )}
    </Modal>
  );
}

export default MessageModal;

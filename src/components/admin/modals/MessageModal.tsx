import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/modals/MessageModal.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Modal from "@mui/material/Modal";

import { HiXMark } from "react-icons/hi2";
import { MessageType } from "@/types/message";

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
  message,
  handleClose,
}: {
  message: MessageType | null;
  handleClose: () => void;
}) {
  const supabase = createClientComponentClient();

  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setDeleting(false);
    handleClose();
  };

  const changeStatus = async () => {
    if (message && !message.read) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", message.id);
    }
  };

  useEffect(() => {
    changeStatus();
  }, [message]);

  if (!message) return null;

  return (
    <Modal
      open={message !== null}
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
              <li>{message.name}</li>
              <li>{message.email}</li>
              <li>{message.telephone}</li>
              <li>{message.message}</li>
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

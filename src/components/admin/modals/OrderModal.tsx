import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/modals/OrderModal.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import { OrderType } from "@/types/order";

import { Scrollbars } from "react-custom-scrollbars";

import Modal from "@mui/material/Modal";

import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";

import { motion } from "framer-motion";

import { HiXMark } from "react-icons/hi2";

function DeleteOrder({
  close,
  orderId,
}: {
  close: () => void;
  orderId: number;
}) {
  const supabase = createClientComponentClient();

  const deleteOrder = async () => {
    await supabase.from("orders").delete().eq("id", orderId);

    close();
  };

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
        <button className={styles.delete} onClick={deleteOrder}>
          Obriši
        </button>
        <button onClick={close}>Odustani</button>
      </section>
    </section>
  );
}

function OrderModal({
  order,
  handleClose,
}: {
  order: OrderType | null;
  handleClose: () => void;
}) {
  const supabase = createClientComponentClient();

  const [statusOption, setStatusOption] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  const close = () => {
    setDeleting(false);
    handleClose();
  };

  const changeStatus = async (newStatus: string) => {
    setStatusOption(newStatus);

    if (order) {
      const updateRes = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      console.log(updateRes);
    }
  };

  useEffect(() => {
    if (order) setStatusOption(order.status);
  }, [order]);

  if (!order) return null;

  return (
    <Modal
      open={order !== null}
      onClose={close}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      {deleting ? (
        <DeleteOrder close={close} orderId={order.id} />
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
                    <li>{order.product}</li>
                    <li>{order.first_name}</li>
                    <li>{order.last_name}</li>
                  </ul>
                </div>
                <div className={styles.infoBlock}>
                  <ul className={styles.labels}>
                    <li>Email:</li>
                    <li>Telefon:</li>
                    <li>Adresa:</li>
                  </ul>
                  <ul className={styles.values}>
                    <li>{order.email}</li>
                    <li>{order.telephone}</li>
                    <li>{order.address}</li>
                  </ul>
                </div>
              </div>

              <div className={styles.message}>
                <p className={styles.label}>Poruka:</p>
                <Scrollbars style={{ height: 250 }}>
                  <p className={styles.value}>
                    {order.message || "Nema poruke"}
                  </p>
                </Scrollbars>
              </div>

              <div className={styles.status}>
                <p className={styles.label}>Status:</p>
                <div className={styles.statusOptions}>
                  <div
                    className={`${styles.green} ${
                      statusOption === "done" ? styles.selected : undefined
                    }`}
                    onClick={() => changeStatus("done")}
                  >
                    <HiOutlineCheckCircle />
                    <p>Gotovo</p>
                  </div>
                  <div
                    className={`${styles.blue} ${
                      statusOption === "working" ? styles.selected : undefined
                    }`}
                    onClick={() => changeStatus("working")}
                  >
                    <HiOutlineClock />
                    <p>U izradi</p>
                  </div>
                  <div
                    className={`${styles.red} ${
                      statusOption === "waiting" ? styles.selected : undefined
                    }`}
                    onClick={() => changeStatus("waiting")}
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

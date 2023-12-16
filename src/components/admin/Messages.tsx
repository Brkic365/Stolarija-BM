import React from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";
import MessageTable from "./MessagesTable";

function Messages() {
  return (
    <section className={styles.messages}>
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Posljednje Poruke</h3>
          <p>23 Ukupno</p>
        </section>
        <section className={styles.right}>
          <div className={styles.info}>
            <h3>16</h3>
            <p>nepročitano</p>
          </div>
        </section>
      </section>
      <section className={styles.tableContainer}>
        <MessageTable />
      </section>
    </section>
  );
}

export default Messages;

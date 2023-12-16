import React from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";

import OrderTable from "./OrderTable";

function Orders() {
  return (
    <section className={styles.orders}>
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Posljednje Narudžbe</h3>
          <p>1317 Ukupno</p>
        </section>
        <section className={styles.right}>
          <div className={styles.info}>
            <h3>94</h3>
            <p>odrađeno</p>
          </div>
          <div className={styles.line} />
          <div className={styles.info}>
            <h3>3</h3>
            <p>rade se</p>
          </div>
          <div className={styles.line} />
          <div className={styles.info}>
            <h3>21</h3>
            <p>čekaju</p>
          </div>
        </section>
      </section>
      <section className={styles.tableContainer}>
        <OrderTable />
      </section>
    </section>
  );
}

export default Orders;

"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import OrderTable from "./OrderTable";

function Orders() {
  const supabase = createClientComponentClient();

  const [total, setTotal] = useState<number>(0);
  const [done, setDone] = useState<number>(0);
  const [working, setWorking] = useState<number>(0);
  const [waiting, setWaiting] = useState<number>(0);

  const getOrders = async () => {
    const { data, error } = await supabase.from("orders").select("*");

    if (data) {
      setTotal(data.length);

      const doneOrders = data.filter((order) => order.status === "done");
      setDone(doneOrders.length);

      const workingOrders = data.filter((order) => order.status === "working");
      setWorking(workingOrders.length);

      const waitingOrders = data.filter((order) => order.status === "waiting");
      setWaiting(waitingOrders.length);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  return (
    <section className={styles.orders}>
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Posljednje Narudžbe</h3>
          <p>{total} Ukupno</p>
        </section>
        <section className={styles.right}>
          <div className={styles.info}>
            <h3>{done}</h3>
            <p>odrađeno</p>
          </div>
          <div className={styles.line} />
          <div className={styles.info}>
            <h3>{working}</h3>
            <p>rade se</p>
          </div>
          <div className={styles.line} />
          <div className={styles.info}>
            <h3>{waiting}</h3>
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

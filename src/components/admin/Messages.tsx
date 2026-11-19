"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";

import { adminApi } from "@/lib/adminApi";

import MessageTable from "./MessagesTable";

function Messages() {

  const [total, setTotal] = useState<number>(0);
  const [notRead, setNotRead] = useState<number>(0);

  const getMessages = async () => {
    const { data, error } = await adminApi.list("messages");

    if (data) {
      setTotal(data.length);

      const notReadMessages = data.filter((message: any) => !message.read);
      setNotRead(notReadMessages.length);
    }
  };

  useEffect(() => {
    getMessages();
  }, []);

  return (
    <section className={styles.messages}>
      <section className={styles.top}>
        <section className={styles.left}>
          <h3>Poruke</h3>
          <p>{total} ukupno</p>
        </section>
        <section className={styles.right}>
          <div className={styles.info}>
            <h3>{notRead}</h3>
            <p>nepročitano</p>
          </div>
        </section>
      </section>
      <section className={styles.tableContainer}>
        <MessageTable updateData={getMessages} />
      </section>
    </section>
  );
}

export default Messages;

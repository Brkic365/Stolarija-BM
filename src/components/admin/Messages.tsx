"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/MainComponents.module.scss";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import MessageTable from "./MessagesTable";

function Messages() {
  const supabase = createClientComponentClient();

  const [total, setTotal] = useState<number>(0);
  const [notRead, setNotRead] = useState<number>(0);

  const getMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setTotal(data.length);

      const notReadMessages = data.filter((message) => !message.read);
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
          <h3>Posljednje Poruke</h3>
          <p>{total} Ukupno</p>
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

"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/Table.module.scss";

import { adminApi } from "@/lib/adminApi";

import { MessageType } from "@/types/message";

import Status from "./Status";

import MessageModal from "./modals/MessageModal";

function MessageTable({ updateData }: { updateData: () => void }) {

  const [openedMessage, setOpenedMessage] = useState<MessageType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const getMessages = async () => {
    const { data, error } = await adminApi.list("messages");

    if (data) {
      setMessages(data);
    }
  };

  useEffect(() => {
    getMessages();
  }, [openedMessage]);

  useEffect(() => {
    updateData();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <section className={styles.empty}>
        <h3>Nema poruka</h3>
        <p>Još uvijek nema poruka</p>
      </section>
    );
  }

  return (
    <table className={styles.table}>
      <MessageModal
        message={openedMessage}
        handleClose={() => setOpenedMessage(null)}
      />
      <thead>
        <tr>
          <th>Ime</th>
          <th>Telefonski broj</th>
          <th>Datum</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((message) => (
          <tr key={message.id} onClick={() => setOpenedMessage(message)}>
            <td>{message.name}</td>
            <td>{message.telephone}</td>
            <td>{new Date(message.created_at).toLocaleDateString("hr-HR")}</td>
            <td className={styles.status}>
              <Status status={message.read ? "read" : "notRead"} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MessageTable;

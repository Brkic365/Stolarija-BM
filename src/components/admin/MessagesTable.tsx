"use client";

import React, { useState } from "react";
import styles from "@/styles/components/admin/Table.module.scss";

import Status from "./Status";

import MessageModal from "./modals/MessageModal";

type MessagesType = {
  id: number;
  name: string;
  phoneNumber: string;
  date: Date;
  status: string;
}[];

const messages: MessagesType = [
  {
    id: 1,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 2,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
  {
    id: 3,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 4,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
  {
    id: 5,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 6,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
  {
    id: 7,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 8,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
  {
    id: 9,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 10,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
  {
    id: 11,
    name: "Ivan Horvat",
    phoneNumber: "095 444 5555",
    date: new Date(2023, 11, 24),
    status: "read",
  },
  {
    id: 12,
    name: "Luka Ivčić",
    phoneNumber: "095 321 5345",
    date: new Date(2023, 11, 24),
    status: "unread",
  },
];

function MessageTable() {
  const [openMessage, setOpenMessage] = useState<number | null>(null);

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
        open={openMessage !== null}
        handleClose={() => setOpenMessage(null)}
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
          <tr key={message.id} onClick={() => setOpenMessage(message.id)}>
            <td>{message.name}</td>
            <td>{message.phoneNumber}</td>
            <td>{message.date.toLocaleDateString("en-GB")}</td>
            <td className={styles.status}>
              <Status status={message.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MessageTable;

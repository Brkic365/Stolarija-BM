"use client";

import React, { useState } from "react";
import styles from "@/styles/components/admin/Table.module.scss";

import Status from "./Status";
import OrderModal from "./modals/OrderModal";

type OrdersType = {
  id: number;
  name: string;
  price: number;
  date: Date;
  status: string;
}[];

const orders: OrdersType = [
  {
    id: 1,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "done",
  },
  {
    id: 2,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "working",
  },
  {
    id: 3,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "waiting",
  },
  {
    id: 4,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "done",
  },
  {
    id: 5,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "working",
  },
  {
    id: 6,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "waiting",
  },
  {
    id: 7,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "done",
  },
  {
    id: 8,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "working",
  },
  {
    id: 9,
    name: "Imperial Kuhinja",
    price: 21999,
    date: new Date(2023, 11, 24),
    status: "waiting",
  },
];

function OrderTable() {
  const [openedOrder, setOpenedOrder] = useState<number | null>(null);

  if (orders.length === 0) {
    return (
      <section className={styles.empty}>
        <h3>Nema narudžbi</h3>
        <p>Još uvijek nema narudžbi</p>
      </section>
    );
  }

  return (
    <table className={styles.table}>
      <OrderModal
        open={openedOrder !== null}
        handleClose={() => setOpenedOrder(null)}
      />
      <thead>
        <tr>
          <th>Proizvod</th>
          <th>Cijena</th>
          <th>Datum</th>
          <th>Stanje</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} onClick={() => setOpenedOrder(order.id)}>
            <td>{order.name}</td>
            <td>{order.price.toLocaleString("en-US")} €</td>
            <td>{order.date.toLocaleDateString("en-GB")}</td>
            <td className={styles.status}>
              <Status status={order.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OrderTable;

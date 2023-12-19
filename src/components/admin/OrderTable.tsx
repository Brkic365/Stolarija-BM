"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/Table.module.scss";

import { OrderType } from "@/types/order";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

import Status from "./Status";
import OrderModal from "./modals/OrderModal";

function OrderTable({ updateData }: { updateData: () => void }) {
  const supabase = createClientComponentClient();

  const [openedOrder, setOpenedOrder] = useState<OrderType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);

  const getOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      setOrders(data);
    }
  };

  useEffect(() => {
    getOrders();
  }, [openedOrder]);

  useEffect(() => {
    updateData();
  }, [orders]);

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
        order={openedOrder}
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
          <tr key={order.id} onClick={() => setOpenedOrder(order)}>
            <td>{order.product}</td>
            <td>{order.price.toLocaleString("en-US")} €</td>
            <td>{new Date(order.created_at).toLocaleDateString("en-GB")}</td>
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

"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/components/admin/Table.module.scss";

import { OrderType } from "@/types/order";

import { adminApi } from "@/lib/adminApi";

import Status from "./Status";
import OrderModal from "./modals/OrderModal";
import { formatPrice } from "@/lib/format";

function OrderTable({ updateData }: { updateData: () => void }) {

  const [openedOrder, setOpenedOrder] = useState<OrderType | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);

  const getOrders = async () => {
    const { data, error } = await adminApi.list("orders");

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
            <td>{formatPrice(order.price)}</td>
            <td>{new Date(order.created_at).toLocaleDateString("hr-HR")}</td>
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

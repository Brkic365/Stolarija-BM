import React from "react";
import styles from "@/styles/components/admin/Status.module.scss";

import { HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi2";

function Status({ status }: { status: string }) {
  if (status === "done") {
    return (
      <div className={styles.green}>
        <HiOutlineCheckCircle />
        <p>Gotovo</p>
      </div>
    );
  } else if (status === "working") {
    return (
      <div className={styles.blue}>
        <HiOutlineClock />
        <p>U izradi</p>
      </div>
    );
  } else if (status === "waiting") {
    return (
      <div className={styles.red}>
        <HiOutlineClock />
        <p>Čeka</p>
      </div>
    );
  } else if (status === "read") {
    return (
      <div className={styles.green}>
        <HiOutlineCheckCircle />
        <p>Pročitano</p>
      </div>
    );
  } else if (status === "unread") {
    return (
      <div className={styles.red}>
        <HiOutlineClock />
        <p>Nepročitano</p>
      </div>
    );
  }
}

export default Status;

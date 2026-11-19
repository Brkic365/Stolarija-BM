"use client";

import React from "react";
import Link from "next/link";
import styles from "@/styles/components/StatusMessage.module.scss";

type Props = {
  variant: "empty" | "error";
  title?: string;
  text?: string;
  onRetry?: () => void;
};

// Shown instead of an endless spinner when the product list is empty or fails to load
function StatusMessage({ variant, title, text, onRetry }: Props) {
  const defaultTitle =
    variant === "error"
      ? "Ponuda se trenutno ne može učitati"
      : "Trenutno nema proizvoda";
  const defaultText =
    variant === "error"
      ? "Došlo je do greške pri učitavanju. Pokušajte ponovno ili nas kontaktirajte izravno."
      : "Radimo na novoj ponudi. Javite nam se i izradit ćemo namještaj po vašoj mjeri.";

  return (
    <div className={styles.status} role={variant === "error" ? "alert" : "status"}>
      <h3>{title ?? defaultTitle}</h3>
      <p>{text ?? defaultText}</p>
      <div className={styles.actions}>
        {variant === "error" && onRetry && (
          <button type="button" className={styles.secondary} onClick={onRetry}>
            Pokušaj ponovno
          </button>
        )}
        <Link href="/kontakt" className={styles.primary}>
          Kontaktirajte nas
        </Link>
      </div>
    </div>
  );
}

export default StatusMessage;

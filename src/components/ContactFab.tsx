"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { HiPhone } from "react-icons/hi";
import styles from "@/styles/components/ContactFab.module.scss";
import { PHONE_HREF, WHATSAPP_HREF } from "@/lib/contact";

// Always-visible call and WhatsApp buttons (hidden in the admin area)
function ContactFab() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <div className={styles.fab}>
      <a
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.whatsapp}
        aria-label="Pošaljite poruku na WhatsApp"
      >
        <FaWhatsapp />
      </a>
      <a href={PHONE_HREF} className={styles.phone} aria-label="Nazovite nas">
        <HiPhone />
      </a>
    </div>
  );
}

export default ContactFab;

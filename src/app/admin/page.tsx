"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/admin/Mainpage.module.scss";

import {
  HiOutlineClipboardDocumentList,
  HiOutlineChatBubbleLeftRight,
  HiOutlineWallet,
} from "react-icons/hi2";
import Orders from "@/components/admin/Orders";
import Messages from "@/components/admin/Messages";
import Products from "@/components/admin/Products";

import { useSearchParams, useRouter } from "next/navigation";

function Mainpage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const pageQuery = searchParams.get("page");

  // Set opened page state to 0 if query is not set
  const [opened, setOpened] = useState<number>(
    pageQuery ? parseInt(pageQuery) : 0
  );

  // Change opened page on query change
  useEffect(() => {
    setOpened(pageQuery ? parseInt(pageQuery) : 0);
  }, [pageQuery]);

  return (
    <main className={styles.mainPage}>
      {/* Hero section */}
      <section className={styles.hero} />

      {/* Content section */}
      <section className={styles.content}>
        {/* Top nav */}
        <section className={styles.topNav}>
          <button
            className={opened == 0 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=0")}
          >
            <HiOutlineClipboardDocumentList />
            Narudžbe
          </button>
          <button
            className={opened == 1 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=1")}
          >
            <HiOutlineChatBubbleLeftRight />
            Poruke
          </button>
          <button
            className={opened == 2 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=2")}
          >
            <HiOutlineWallet />
            Proizvodi
          </button>
        </section>

        {/* Side nav */}
        <section className={styles.sideNav}>
          <h1>
            Stolarija <span>BM</span>
          </h1>
          <button
            className={opened == 0 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=0")}
          >
            <HiOutlineClipboardDocumentList />
            Narudžbe
          </button>
          <button
            className={opened == 1 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=1")}
          >
            <HiOutlineChatBubbleLeftRight />
            Poruke
          </button>
          <button
            className={opened == 2 ? styles.active : styles.navItem}
            onClick={() => router.push("/admin?page=2")}
          >
            <HiOutlineWallet />
            Proizvodi
          </button>
        </section>

        {opened == 0 && <Orders />}
        {opened == 1 && <Messages />}
        {opened == 2 && <Products />}
      </section>

      {/* Bottom nav */}
      <section className={styles.bottomNav}>
        <button
          className={opened == 0 ? styles.active : styles.navItem}
          onClick={() => router.push("/admin?page=0")}
        >
          <HiOutlineClipboardDocumentList />
        </button>
        <button
          className={opened == 1 ? styles.active : styles.navItem}
          onClick={() => router.push("/admin?page=1")}
        >
          <HiOutlineChatBubbleLeftRight />
        </button>
        <button
          className={opened == 2 ? styles.active : styles.navItem}
          onClick={() => router.push("/admin?page=2")}
        >
          <HiOutlineWallet />
        </button>
      </section>
    </main>
  );
}

export default Mainpage;

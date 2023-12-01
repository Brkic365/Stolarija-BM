"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/components/Navbar.module.scss";

import { AiOutlineTwitter } from "react-icons/ai";

import { motion } from "framer-motion";

import MobileMenu from "./MobileMenu";

import { useRouter } from "next/navigation";

function Navbar() {
  const router = useRouter();

  // State that handles opening and closing of the mobile menu
  const [openMenu, setOpenMenu] = useState(false);

  const [links] = useState([
    {
      title: "Početna",
      href: "/",
    },
    {
      title: "O nama",
      href: "/o-nama",
    },
    {
      title: "Web shop",
      href: "/web-shop",
    },
  ]);

  // Values asigned to the top line of the hamburger menu used for rotation
  const topLineVariants = {
    open: { transform: "translateY(350%) rotateZ(45deg)" },
    closed: { transform: "translateY(0%) rotateZ(0deg)" },
  };

  // Values asigned to the bottom line of the hamburger menu used for rotation
  const bottomLineVariants = {
    open: { transform: "translateY(-350%) rotateZ(-45deg)" },
    closed: { transform: "translateY(0%) rotateZ(0deg)" },
  };

  return (
    <nav className={styles.nav}>
      <MobileMenu
        open={openMenu}
        links={links}
        setOpen={(open) => setOpenMenu(open)}
      />

      <section className={styles.logoHolder} onClick={() => router.push("/")}>
        <h3>
          Stolarija <span>BM</span>
        </h3>
      </section>

      {/* Navbar links */}
      <ul className={styles.links}>
        {links.map((link) => {
          return (
            <li key={link.href}>
              <a href={link.href}>{link.title}</a>
            </li>
          );
        })}
      </ul>

      <button className={styles.cta}>Kontaktiraj nas</button>

      <div
        className={styles.hamburger}
        onClick={() => setOpenMenu(!openMenu)}
        id="hamburger"
      >
        <motion.div
          className={styles.line}
          animate={openMenu ? "open" : "closed"}
          transition={{ duration: 0.3, type: "tween" }}
          variants={topLineVariants}
          id="line1"
        />
        <div
          className={styles.line}
          style={openMenu ? { opacity: 0 } : undefined}
          id="line2"
        />
        <motion.div
          className={styles.line}
          animate={openMenu ? "open" : "closed"}
          transition={{ duration: 0.3, type: "tween" }}
          variants={bottomLineVariants}
          id="line3"
        />
      </div>
    </nav>
  );
}

export default Navbar;

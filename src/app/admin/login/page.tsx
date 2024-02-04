"use client";

import React, { useState, useEffect } from "react";
import styles from "@/styles/pages/admin/Login.module.scss";

import { motion } from "framer-motion";

import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";

import { HiOutlineExclamationCircle } from "react-icons/hi";

function AdminLogin() {
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const router = useRouter();

  const login = async (e: any) => {
    e.preventDefault();

    if (username === "" || password === "") {
      setError("Molim vas da popunite oba polja.");
      return null;
    }

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
      // callbackUrl: "localhost:3000/",
    });

    if (res?.ok) {
      router.push("/admin");
    } else {
      setError("Pogrešno korisničko ime ili zaporka.");
    }
  };

  useEffect(() => {
    if (error) {
      let timeout = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, [error]);

  const errorVariants = {
    visible: { opacity: 1, height: "100%" },
    hidden: { opacity: 0, height: "0" },
  };

  return (
    <main className={styles.mainLogin}>
      <div className={styles.leftTriangles} />
      <div className={styles.rightTriangles} />

      <form>
        <h2>Admin login</h2>

        <input
          placeholder="Korisničko ime"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Zaporka"
          onChange={(e) => setPassword(e.target.value)}
          type="password"
        />
        <motion.div
          className={styles.error}
          animate={error ? "visible" : "hidden"}
          variants={errorVariants}
        >
          <HiOutlineExclamationCircle />
          <p>{error}</p>
        </motion.div>
        <button onClick={login}>Prijavi se</button>
      </form>
    </main>
  );
}

export default AdminLogin;

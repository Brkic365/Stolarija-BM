"use client";

import React from "react";
import styles from "@/styles/components/Tool.module.scss";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type ToolType = {
  id: string;
  name: string;
  description: string;
};

function Tool({ tool }: { tool: ToolType }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(
    mouseYSpring,
    [-0.5, 0.5],
    ["17.5deg", "-17.5deg"]
  );

  const rotateY = useTransform(
    mouseXSpring,
    [-0.5, 0.5],
    ["-17.5deg", "17.5deg"]
  );

  const handleMouseMove = (e: any) => {
    const rect = e.target.getBoundingClientRect();

    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPercent = mouseX / width - 0.5;
    const yPercent = mouseY / height - 0.5;

    x.set(xPercent);
    y.set(yPercent);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.section
      style={{ rotateX, rotateY }}
      className={styles.tool}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <img src={`/images/tools/${tool.id}.png`} alt={tool.name} />
      <div className={styles.text}>
        <h3>{tool.name}</h3>
        <p>{tool.description}</p>
      </div>
    </motion.section>
  );
}

export default Tool;

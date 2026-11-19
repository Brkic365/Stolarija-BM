import React from "react";
import styles from "@/styles/components/StatusMessage.module.scss";

// Placeholder cards while products load
function ProductSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={styles.skeletonGrid} aria-label="Učitavanje..." aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div className={styles.skeletonCard} key={i}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonLineShort} />
        </div>
      ))}
    </div>
  );
}

export default ProductSkeleton;

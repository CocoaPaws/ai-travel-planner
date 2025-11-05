import React from 'react';
// 关键：导入 CSS Module 文件
import styles from './LoadingSkeleton.module.css';

export default function LoadingSkeleton() {
  return (
    // 使用 styles 对象来引用 className
    <div className={styles.skeletonContainer}>
      <div className={`${styles.skeleton} ${styles.skeletonMap}`}></div>
      <div className={styles.skeletonActionBar}>
        <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
        <div className={`${styles.skeleton} ${styles.skeletonButton}`}></div>
      </div>
      <div className={styles.skeletonDayCard}></div>
      <div className={styles.skeletonDayCard}></div>
      <div className={styles.skeletonDayCard}></div>
    </div>
  );
}
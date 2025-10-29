// components/ui/Dialog.tsx
'use client';
import React from 'react';
import styles from './Dialog.module.css';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <>
      <div className={styles.dialogOverlay} onClick={() => onOpenChange(false)} />
      <div className={styles.dialogContent}>
        {children}
      </div>
    </>
  );
}
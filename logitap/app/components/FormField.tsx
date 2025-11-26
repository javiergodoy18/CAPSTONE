'use client';

import { ReactNode } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  hint?: string;
}

export default function FormField({ label, children, error, required, hint }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <label className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
      {error && (
        <p className={styles.error}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}

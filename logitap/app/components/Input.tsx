'use client';

import { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: string;
  error?: boolean;
}

export default function Input({ icon, error, className = '', ...props }: InputProps) {
  return (
    <div className={`${styles.inputWrapper} ${error ? styles.error : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <input className={`${styles.input} ${icon ? styles.withIcon : ''} ${className}`} {...props} />
    </div>
  );
}

'use client';

import { SelectHTMLAttributes } from 'react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  icon?: string;
  error?: boolean;
  options: { value: string; label: string }[];
}

export default function Select({ icon, error, options, className = '', ...props }: SelectProps) {
  return (
    <div className={`${styles.selectWrapper} ${error ? styles.error : ''}`}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <select className={`${styles.select} ${icon ? styles.withIcon : ''} ${className}`} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className={styles.arrow}>▼</span>
    </div>
  );
}

'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  glow?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  loading = false,
  glow = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${styles.button}
        ${styles[variant]}
        ${styles[size]}
        ${fullWidth ? styles.fullWidth : ''}
        ${glow ? styles.glow : ''}
        ${loading ? styles.loading : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <div className={styles.spinner} />}
      {!loading && icon && iconPosition === 'left' && (
        <span className={styles.icon}>{icon}</span>
      )}
      <span className={styles.label}>{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <span className={styles.icon}>{icon}</span>
      )}
      <div className={styles.ripple} />
    </button>
  );
}

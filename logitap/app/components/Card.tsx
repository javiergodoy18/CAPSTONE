'use client';

import { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'highlighted' | 'glass' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
  glow?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  glow = false,
  className = '',
  onClick,
}: CardProps) {
  return (
    <div
      className={`
        ${styles.card}
        ${styles[variant]}
        ${styles[`padding-${padding}`]}
        ${hover ? styles.hover : ''}
        ${glow ? styles.glow : ''}
        ${onClick ? styles.clickable : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {glow && <div className={styles.glowEffect} />}
      {children}
    </div>
  );
}

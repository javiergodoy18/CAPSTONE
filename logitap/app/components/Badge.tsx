import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={`
        ${styles.badge}
        ${styles[variant]}
        ${styles[size]}
        ${pulse ? styles.pulse : ''}
      `}
    >
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}

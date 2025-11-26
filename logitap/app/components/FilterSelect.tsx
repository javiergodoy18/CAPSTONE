'use client';

import styles from './FilterSelect.module.css';

interface FilterSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export default function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className={styles.filterSelect}>
      <label className={styles.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={styles.select}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

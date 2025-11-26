'use client';

import { useState } from 'react';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ placeholder = 'Buscar...', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchBar}>
      <span className={styles.searchIcon}>🔍</span>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder={placeholder}
        className={styles.searchInput}
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery('');
            onSearch('');
          }}
          className={styles.clearButton}
        >
          ✕
        </button>
      )}
    </form>
  );
}

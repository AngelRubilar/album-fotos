'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Buscar...' }: SearchBarProps) {
  const { t } = useTheme();
  const [query, setQuery] = useState('');

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  return (
    <div className="relative">
      <svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-10 py-2.5 rounded-xl ${t.inputBg} ${t.inputBorder} ${t.text} border backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-sm transition-all`}
      />
      {query && (
        <button
          onClick={() => handleChange('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textMuted}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

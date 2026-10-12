import React from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ value, onChange, onClear, placeholder = 'Search all products...' }) {
  return (
    <div className="searchbar-wrapper">
      <Search size={18} className="searchbar-icon" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="searchbar-field"
      />
      {value && (
        <button onClick={onClear} className="searchbar-clear-btn" aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

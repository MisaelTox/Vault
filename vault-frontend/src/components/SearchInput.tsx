import { useRef, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClose?: () => void;
  /** When true renders as inline block (no fixed positioning) */
  inline?: boolean;
}

export function SearchInput({ value, onChange, onClose, inline = false }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  return (
    <div className={inline ? 'search-bar-inline' : 'search-bar-open'}>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        placeholder="Search game"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {onClose && (
        <button className="close-search-btn" onClick={onClose} aria-label="Cerrar búsqueda">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
}

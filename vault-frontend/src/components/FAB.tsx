interface FABProps {
  onClick: () => void;
  label?: string;
}

export function FAB({ onClick, label = 'Agregar juego' }: FABProps) {
  return (
    <button className="fab-button" onClick={onClick} aria-label={label}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

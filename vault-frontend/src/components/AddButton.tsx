import type { ButtonHTMLAttributes } from 'react';

interface AddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

export function AddButton({ label = 'Add', className = '', ...props }: AddButtonProps) {
  return (
    <button className={`add-btn ${className}`.trim()} {...props}>
      {label}
    </button>
  );
}

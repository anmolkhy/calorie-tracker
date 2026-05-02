import { InputHTMLAttributes } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = '', ...props }: Props) {
  return (
    <div className="flex flex-col">
      {label && (
        <label className="input-label">{label}</label>
      )}
      <input
        className={`input-field ${error ? 'error' : ''} ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs mt-1.5" style={{ color: 'var(--red)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
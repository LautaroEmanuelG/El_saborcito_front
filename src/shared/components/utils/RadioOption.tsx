import type React from 'react';

export const RadioOption: React.FC<{
  name: string;
  value: string;
  checked: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}> = ({ name, value, checked, onChange, children, className = 'w-5 h-5' }) => (
  <label className="flex items-center cursor-pointer">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className={`mr-3 ${className}`}
    />
    <span>{children}</span>
  </label>
);

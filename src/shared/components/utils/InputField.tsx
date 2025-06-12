import type React from 'react';

export const InputField: React.FC<{
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}> = ({ label, type, value, onChange, placeholder, required = false }) => (
  <div>
    <label className="block text-sm font-medium mb-2">
      {label} {required && <b className="text-primary font-bold">*</b>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
    />
  </div>
);

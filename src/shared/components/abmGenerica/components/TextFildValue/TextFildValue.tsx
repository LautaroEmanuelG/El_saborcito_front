import React from 'react';

// Interfaz para los props del componente TextFieldValue
interface Props {
  label: string; // Etiqueta del campo
  name: string; // Nombre del campo
  type: string; // Tipo de campo (text, number, etc.)
  placeholder: string; // Placeholder del campo
  value: string | number; // Valor del campo
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Función para manejar el cambio de valor
  error?: string; // Mensaje de error opcional
}

// Componente TextFieldValue
const TextFieldValue = ({ label, name, type, placeholder, value, onChange, error }: Props) => {
  // Componente para crear los input de un formulario
  return (
    <div className="mt-2 flex flex-col">
      <div className="flex justify-start items-center py-1">
        {/* Etiqueta del campo */}
        <label htmlFor={name} className="text-black font-sans text-sm font-bold mb-1">
          {label}
        </label>
      </div>

      {/* Campo de entrada del formulario */}
      <input
        className={`border rounded px-3 py-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400 ${error ? 'border-red-500' : ''}`}
        placeholder={placeholder}
        name={name}
        id={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />

      {/* Mensaje de error para el campo */}
      {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
    </div>
  );
};

export default TextFieldValue; // Exportación del componente TextFieldValue

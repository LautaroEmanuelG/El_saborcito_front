import type React from 'react';
import { InputField } from '../../shared/components/utils/InputField';

export const ContactForm: React.FC<{
  telefono: string;
  email: string;
  onTelefonoChange: (value: string) => void;
  onEmailChange: (value: string) => void;
}> = ({ telefono, email, onTelefonoChange, onEmailChange }) => (
  <div className="space-y-4 mb-6">
    <h3 className="text-lg font-semibold">Datos de contacto</h3>
    <InputField
      label="Teléfono"
      type="tel"
      value={telefono}
      onChange={onTelefonoChange}
      placeholder="Ingresa tu teléfono"
      required
    />
    <InputField
      label="Email"
      type="email"
      value={email}
      onChange={onEmailChange}
      placeholder="Ingresa tu email"
      required
    />
  </div>
);

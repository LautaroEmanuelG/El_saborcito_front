import type React from 'react';
import { Usuario } from '../../../types/Usuario';

interface InformacionUsuarioProps {
  usuario: Usuario;
}

export const InformacionUsuario: React.FC<InformacionUsuarioProps> = ({ usuario }) => {
  return (
    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">📋 Información del cliente</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <span className="font-medium text-gray-600">👤 Nombre:</span>
          <p className="text-gray-800">
            {usuario.nombre} {usuario.apellido}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-600">📧 Email:</span>
          <p className="text-gray-800">{usuario.email}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">📱 Teléfono:</span>
          <p className="text-gray-800">{usuario.telefono || 'No especificado'}</p>
        </div>
      </div>
    </div>
  );
};

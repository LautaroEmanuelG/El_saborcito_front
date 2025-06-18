import type React from 'react';
import { RadioOption } from '../../../shared/components/utils/RadioOption';

interface TipoEnvio {
  id: number;
  nombre: string;
}

interface FormaPago {
  id: number;
  nombre: string;
}

interface FormularioEnvioYPagoProps {
  tiposEnvio: TipoEnvio[];
  formasPago: FormaPago[];
  tipoEnvioSeleccionado: number | null;
  metodoPagoId: number | null;
  onTipoEnvioChange: (tipoId: number) => void;
  onMetodoPagoChange: (metodoPagoId: number) => void;
  loadingTiposEnvio: boolean;
  loadingFormasPago: boolean;
}

export const FormularioEnvioYPago: React.FC<FormularioEnvioYPagoProps> = ({
  tiposEnvio,
  formasPago,
  tipoEnvioSeleccionado,
  metodoPagoId,
  onTipoEnvioChange,
  onMetodoPagoChange,
  loadingTiposEnvio,
  loadingFormasPago,
}) => {
  const getNombreTipoEnvio = (nombre: string): string => {
    switch (nombre) {
      case 'DELIVERY':
        return 'Delivery a domicilio';
      case 'TAKE_AWAY':
        return 'Retiro en local (10% descuento)';
      case 'EN_LOCAL':
        return 'Consumir en el local';
      default:
        return nombre;
    }
  };

  const getNombreFormaPago = (nombre: string): string => {
    switch (nombre) {
      case 'EFECTIVO':
        return 'Efectivo';
      case 'MERCADO_PAGO':
        return 'Mercado Pago';
      case 'TARJETA':
        return 'Tarjeta de débito/crédito';
      case 'TRANSFERENCIA':
        return 'Transferencia bancaria';
      default:
        return nombre;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formas de Pago */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Forma de pago</h3>
        {loadingFormasPago ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Cargando formas de pago...</span>
          </div>
        ) : formasPago?.length > 0 ? (
          <div className="space-y-3">
            {formasPago.map((forma) => (
              <div
                key={forma.id}
                className={`p-3 border rounded-lg transition-colors ${
                  metodoPagoId === forma.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <RadioOption
                  name="formaPago"
                  value={forma.id.toString()}
                  checked={metodoPagoId === forma.id}
                  onChange={(value) => onMetodoPagoChange(parseInt(value))}
                >
                  <span className="text-gray-800 font-medium">
                    {getNombreFormaPago(forma.nombre)}
                  </span>
                </RadioOption>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ No se pudieron cargar las formas de pago. Intenta recargar la página.
            </p>
          </div>
        )}
      </div>
      {/* Tipos de Envío */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tipo de envío</h3>
        {loadingTiposEnvio ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2 text-gray-600">Cargando tipos de envío...</span>
          </div>
        ) : tiposEnvio?.length > 0 ? (
          <div className="space-y-3">
            {tiposEnvio.map((tipo) => (
              <div
                key={tipo.id}
                className={`p-3 border rounded-lg transition-colors ${
                  tipoEnvioSeleccionado === tipo.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <RadioOption
                  name="tipoEnvio"
                  value={tipo.id.toString()}
                  checked={tipoEnvioSeleccionado === tipo.id}
                  onChange={(value) => onTipoEnvioChange(parseInt(value))}
                >
                  <span className="text-gray-800 font-medium">
                    {getNombreTipoEnvio(tipo.nombre)}
                  </span>
                </RadioOption>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ No se pudieron cargar los tipos de envío. Intenta recargar la página.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

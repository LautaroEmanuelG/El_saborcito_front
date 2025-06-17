import type React from 'react';
import { useState } from 'react';
import { RadioOption } from '../../../shared/components/utils/RadioOption';
import { Domicilio } from '../../HU1_2_Registro_Login/models';
import MapaInteractivo from '../MapaInteractivo';

interface SeleccionDomicilioProps {
  domicilios: Domicilio[];
  domicilioSeleccionado: number | null;
  onDomicilioChange: (domicilioId: number | null) => void;
  ubicacionNueva: { lat: number; lng: number; direccion?: string } | null;
  onUbicacionNuevaChange: (lat: number, lng: number, direccion?: string) => void;
  esTipoDelivery: boolean;
}

export const SeleccionDomicilio: React.FC<SeleccionDomicilioProps> = ({
  domicilios,
  domicilioSeleccionado,
  onDomicilioChange,
  ubicacionNueva,
  onUbicacionNuevaChange,
  esTipoDelivery,
}) => {
  const [mostrarMapaNuevo, setMostrarMapaNuevo] = useState(false);

  const formatearDomicilio = (domicilio: Domicilio): string => {
    const partes = [];
    if (domicilio.calle) partes.push(domicilio.calle);
    if (domicilio.numero) partes.push(domicilio.numero.toString());
    if (domicilio.localidad?.nombre) partes.push(domicilio.localidad.nombre);
    return partes.join(', ') || 'Dirección no especificada';
  };

  const handleSeleccionarDomicilio = (value: string) => {
    if (value === 'nuevo') {
      onDomicilioChange(null);
      setMostrarMapaNuevo(true);
    } else {
      const domicilioId = parseInt(value);
      onDomicilioChange(domicilioId);
      setMostrarMapaNuevo(false);
    }
  };

  const domicilioSeleccionadoObj = domicilios.find((d) => d.id === domicilioSeleccionado);
  const esDomicilioExistente = domicilioSeleccionado !== null;
  const esNuevoDomicilio = domicilioSeleccionado === null && mostrarMapaNuevo;

  if (!esTipoDelivery) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">🏠 Seleccionar dirección de entrega</h3>
      {/* Lista de domicilios existentes */}
      <div className="space-y-3 mb-4">
        {domicilios.map((domicilio) => (
          <RadioOption
            key={domicilio.id}
            name="domicilio"
            value={domicilio.id?.toString() || ''}
            checked={domicilioSeleccionado === domicilio.id}
            onChange={handleSeleccionarDomicilio}
          >
            <div className="flex-1">
              <p className="font-medium text-gray-800">📍 {formatearDomicilio(domicilio)}</p>
              {domicilio.latitud && domicilio.longitud && (
                <p className="text-sm text-gray-500">
                  Coordenadas: {domicilio.latitud.toFixed(6)}, {domicilio.longitud.toFixed(6)}
                </p>
              )}
            </div>
          </RadioOption>
        ))}

        {/* Opción para nueva dirección */}
        <RadioOption
          name="domicilio"
          value="nuevo"
          checked={mostrarMapaNuevo}
          onChange={handleSeleccionarDomicilio}
        >
          <span className="font-medium text-gray-800">🆕 Usar nueva dirección</span>
        </RadioOption>
      </div>{' '}
      {/* Mapa para domicilio existente (solo visualización) */}
      {esDomicilioExistente &&
        domicilioSeleccionadoObj?.latitud &&
        domicilioSeleccionadoObj?.longitud && (
          <div className="mb-4">
            <h4 className="text-md font-medium mb-2 text-gray-700">📍 Ubicación seleccionada:</h4>
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Dirección:</strong> {formatearDomicilio(domicilioSeleccionadoObj)}
              </p>
              <MapaInteractivo
                onUbicacionSeleccionada={() => {}} // No hacer nada, es solo visualización
                ubicacionActual={{
                  lat: domicilioSeleccionadoObj.latitud,
                  lng: domicilioSeleccionadoObj.longitud,
                }}
              />
            </div>
          </div>
        )}
      {/* Mapa para nueva dirección (interactivo) */}
      {esNuevoDomicilio && (
        <div className="mb-4">
          <h4 className="text-md font-medium mb-2 text-gray-700">
            🗺️ Seleccionar nueva ubicación:
          </h4>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              📌 Haz clic en el mapa para seleccionar tu dirección de entrega
            </p>
            <MapaInteractivo
              onUbicacionSeleccionada={onUbicacionNuevaChange}
              ubicacionActual={
                ubicacionNueva
                  ? {
                      lat: ubicacionNueva.lat,
                      lng: ubicacionNueva.lng,
                    }
                  : null
              }
            />
            {ubicacionNueva && (
              <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                <p className="text-sm text-green-700">
                  ✅ <strong>Ubicación seleccionada:</strong>
                  <br />
                  {ubicacionNueva.direccion ||
                    `${ubicacionNueva.lat.toFixed(6)}, ${ubicacionNueva.lng.toFixed(6)}`}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapaInteractivoProps {
  onUbicacionSeleccionada: (lat: number, lng: number, direccion?: string) => void;
  ubicacionActual?: { lat: number; lng: number } | null;
}

// Componente para manejar clics en el mapa
const MapClickHandler: React.FC<{ onLocationClick: (lat: number, lng: number) => void }> = ({
  onLocationClick,
}) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationClick(lat, lng);
    },
  });
  return null;
};

const MapaInteractivo: React.FC<MapaInteractivoProps> = ({
  onUbicacionSeleccionada,
  ubicacionActual,
}) => {
  // Coordenadas de UTN Facultad Regional Mendoza como centro por defecto
  const position: [number, number] = [-32.89341341972979, -68.84846922641435];
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    ubicacionActual ? [ubicacionActual.lat, ubicacionActual.lng] : null
  );

  // Manejar clic en el mapa
  const handleMapClick = async (lat: number, lng: number) => {
    const newPosition: [number, number] = [lat, lng];
    setMarkerPosition(newPosition);

    // Intentar obtener dirección usando geocodificación inversa (opcional)
    try {
      // Usando OpenStreetMap Nominatim para geocodificación inversa
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const direccion = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

      onUbicacionSeleccionada(lat, lng, direccion);
    } catch (error) {
      console.error('Error obteniendo dirección:', error);
      onUbicacionSeleccionada(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  return (
    <div className="w-full h-[300px] rounded-lg opacity-90 overflow-hidden border">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Componente para manejar clics */}
        <MapClickHandler onLocationClick={handleMapClick} />

        {/* Mostrar marcador si hay posición seleccionada */}
        {markerPosition && <Marker position={markerPosition} />}
      </MapContainer>

      <div className="mt-2 text-sm text-gray-600 text-center">
        📍 Haz clic en el mapa para seleccionar tu ubicación
      </div>
    </div>
  );
};

export default MapaInteractivo;

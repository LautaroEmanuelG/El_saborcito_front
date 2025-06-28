import React from 'react';
import ModalSiNo from '../components/abmGenerica/components/modals/ModalSiNo';

interface AutoAjusteInfo {
  productos: Array<{
    nombre: string;
    cantidadAnterior: number;
    cantidadNueva: number;
  }>;
  promociones: Array<{
    nombre: string;
    cantidadAnterior: number;
    cantidadNueva: number;
  }>;
}

interface ModalAutoAjusteProps {
  isOpen: boolean;
  onClose: () => void;
  ajusteInfo: AutoAjusteInfo;
}

export const ModalAutoAjuste: React.FC<ModalAutoAjusteProps> = ({
  isOpen,
  onClose,
  ajusteInfo,
}) => {
  // Crear descripción detallada de los ajustes
  const getDescripcion = (): string => {
    const ajustes: string[] = [];

    ajusteInfo.productos.forEach((producto) => {
      ajustes.push(
        `• ${producto.nombre}: ${producto.cantidadAnterior} → ${producto.cantidadNueva} unidades`
      );
    });

    ajusteInfo.promociones.forEach((promocion) => {
      ajustes.push(
        `• ${promocion.nombre}: ${promocion.cantidadAnterior} → ${promocion.cantidadNueva} unidades`
      );
    });

    const descripcionBase =
      'Se detectaron limitaciones de stock y se ajustaron automáticamente las siguientes cantidades:';

    return `${descripcionBase}\n\n${ajustes.join('\n')}\n\nEstas son las cantidades máximas disponibles actualmente.`;
  };

  return (
    <ModalSiNo
      open={isOpen}
      onClose={onClose}
      onConfirm={onClose} // Solo botón OK
      title="⚠️ Cantidades Ajustadas Automáticamente"
      description={getDescripcion()}
      confirmText="Entendido"
      cancelText="" // Sin botón cancelar
    />
  );
};

// 🚚 **TIPOS Y MODELOS PARA DELIVERY DE PEDIDOS**

import { PedidoCompleto, DomicilioCompleto } from '../../types/Pedido';

// Estado específico para delivery
export const ESTADO_DELIVERY = 'EN_DELIVERY';
export const ESTADO_ENTREGADO = 'ENTREGADO';

// Información de entrega
export interface InfoEntrega {
  pedidoId: number;
  cliente: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  direccion: DomicilioCompleto;
  total: number;
  formaPago: string;
  horaEstimada?: string;
  observaciones?: string;
}

// Estadísticas de delivery
export interface EstadisticasDelivery {
  totalPedidos: number;
  totalFacturado: number;
  promedioTiempoEntrega?: number;
  pedidosPendientes: number;
}

// Configuración de mapa
export interface ConfigMapa {
  centroDefault: {
    lat: number;
    lng: number;
  };
  zoomDefault: number;
  maxZoom: number;
  tilesUrl: string;
}

export const CONFIG_MAPA_DEFAULT: ConfigMapa = {
  centroDefault: {
    lat: -32.8895,
    lng: -68.8458,
  },
  zoomDefault: 13,
  maxZoom: 18,
  tilesUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

// Funciones auxiliares para delivery
export const obtenerDireccionPrincipal = (pedido: PedidoCompleto): DomicilioCompleto | null => {
  if (pedido.cliente.domicilios && pedido.cliente.domicilios.length > 0) {
    // Buscar dirección con coordenadas primero
    const conCoordenadas = pedido.cliente.domicilios.find((d) => d.latitud && d.longitud);
    return conCoordenadas || pedido.cliente.domicilios[0];
  }
  return null;
};

export const formatearDireccionCompleta = (domicilio: DomicilioCompleto): string => {
  return `${domicilio.calle} ${domicilio.numero}, ${domicilio.localidad.nombre}, ${domicilio.localidad.provincia.nombre}`;
};

export const calcularEstadisticasDelivery = (pedidos: PedidoCompleto[]): EstadisticasDelivery => {
  return {
    totalPedidos: pedidos.length,
    totalFacturado: pedidos.reduce((sum, p) => sum + p.total, 0),
    pedidosPendientes: pedidos.filter((p) => p.estado.nombre === ESTADO_DELIVERY).length,
  };
};

export const validarCoordenadas = (lat?: number, lng?: number): boolean => {
  return (
    lat !== undefined && lng !== undefined && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  );
};

// Información para el delivery
export const extraerInfoEntrega = (pedido: PedidoCompleto): InfoEntrega | null => {
  const direccion = obtenerDireccionPrincipal(pedido);

  if (!direccion) {
    return null;
  }

  return {
    pedidoId: pedido.id,
    cliente: {
      nombre: pedido.cliente.nombre,
      apellido: pedido.cliente.apellido,
      telefono: pedido.cliente.telefono,
      email: pedido.cliente.email,
    },
    direccion,
    total: pedido.total,
    formaPago: pedido.formaPago.nombre,
    horaEstimada: pedido.horasEstimadaFinalizacion,
  };
};

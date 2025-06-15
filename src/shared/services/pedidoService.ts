import axiosInstance from './axiosConfig'; // Importar la instancia preconfigurada

const API_BASE_URL = '/pedidos';

export interface DetallePedido {
  cantidad: number;
  articuloId: number;
}

export interface PromocionSeleccionada {
  promocionId: number;
  cantidad: number;
}

export interface DomicilioPedido {
  calle: string;
  numero: number;
  cp: string;
  latitud: number;
  longitud: number;
  localidadId: number;
}

export interface CreatePedidoRequest {
  clienteId: number;
  tipoEnvioId: number;
  formaPagoId: number;
  sucursalId: number;
  domicilio?: DomicilioPedido;
  detalles: DetallePedido[];
  promocionesSeleccionadas?: PromocionSeleccionada[];
}

/**
 * Crear un nuevo pedido
 */
export const createPedido = async (data: CreatePedidoRequest) => {
  const response = await axiosInstance.post(`${API_BASE_URL}`, data);
  return response.data;
};

export const getAllPedidos = async () => {
  const response = await axiosInstance.get(`${API_BASE_URL}`);
  return response.data;
};

export const getPedidoById = async (id: number) => {
  const response = await axiosInstance.get(`${API_BASE_URL}/${id}`);
  return response.data;
};

export const savePedido = async (data: any) => {
  const response = await axiosInstance.post(`${API_BASE_URL}/${data.id}`, data);
  return response.data;
};

export const deletePedido = async (id: number) => {
  const response = await axiosInstance.delete(`${API_BASE_URL}/${id}`);
  return response.data;
};

import axiosInstance from './axiosConfig';
import { ClienteDTO, ActualizarClienteAdminDTO } from '../../modules/HU7_8_Modulo_Admin/model';

// Obtener todos los clientes (para admin)
export const obtenerTodosLosClientes = async (): Promise<ClienteDTO[]> => {
  try {
    const response = await axiosInstance.get('/clientes');
    return response.data;
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    throw new Error('Error al cargar la lista de clientes');
  }
};

// Actualizar cliente (para admin)
export const actualizarClienteAdmin = async (
  id: number,
  dto: ActualizarClienteAdminDTO
): Promise<ClienteDTO> => {
  const response = await axiosInstance.put(`/clientes/admin/${id}`, dto);
  return response.data;
};

// Baja lógica del cliente
export const bajaLogicaCliente = async (id: number): Promise<{ mensaje: string }> => {
  const response = await axiosInstance.patch(`/clientes/admin/${id}/baja`);
  return response.data;
};

// Alta lógica del cliente
export const altaCliente = async (id: number): Promise<{ mensaje: string }> => {
  const response = await axiosInstance.patch(`/clientes/admin/${id}/alta`);
  return response.data;
};

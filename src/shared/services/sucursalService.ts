import axiosInstance from './axiosConfig';
import { Sucursal } from '../../types/Sucursal';

// Obtener todas las sucursales
export const getAllSucursales = async (): Promise<Sucursal[]> => {
  try {
    const response = await axiosInstance.get('/sucursales');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener sucursales:', error);
    throw new Error('Error al cargar las sucursales');
  }
};

// Obtener sucursal por ID
export const getSucursalById = async (id: number): Promise<Sucursal> => {
  try {
    const response = await axiosInstance.get(`/sucursales/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener sucursal:', error);
    throw new Error('Error al cargar la sucursal');
  }
};

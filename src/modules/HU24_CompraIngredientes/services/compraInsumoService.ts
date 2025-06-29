// HU24_CompraIngredientes/service/compraInsumoService.ts

import axiosInstance from '../../../shared/services/axiosConfig';
import type { CompraInsumoDTO, NuevaCompraDTO } from '../model';

const BASE = '/compras-insumos';

export const listarCompras = async (): Promise<CompraInsumoDTO[]> => {
  const res = await axiosInstance.get<CompraInsumoDTO[]>(BASE);
  return res.data;
};

export const registrarCompra = async (dto: NuevaCompraDTO): Promise<CompraInsumoDTO> => {
  const res = await axiosInstance.post<CompraInsumoDTO>(BASE, dto);
  return res.data;
};

export const getUltimaCompra = async (): Promise<CompraInsumoDTO | null> => {
  try {
    const res = await axiosInstance.get<CompraInsumoDTO[]>(
      `${BASE}?limit=1&orderBy=fechaCompra&orderDirection=desc`
    );
    return res.data.length > 0 ? res.data[0] : null;
  } catch (error) {
    console.error('Error al obtener la última compra:', error);
    return null;
  }
};

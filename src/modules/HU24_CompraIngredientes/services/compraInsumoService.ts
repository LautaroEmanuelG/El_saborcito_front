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

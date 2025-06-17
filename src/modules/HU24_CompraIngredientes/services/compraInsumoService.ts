// HU24_CompraIngredientes/service/compraInsumoService.ts

import axios from 'axios';
import type { CompraInsumoDTO, NuevaCompraDTO } from '../model';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5252';

const BASE = `${API_BASE_URL}/api/compras-insumos`;

export async function listarCompras(): Promise<CompraInsumoDTO[]> {
  const res = await axios.get<CompraInsumoDTO[]>(BASE);
  return res.data;
}

export async function registrarCompra(dto: NuevaCompraDTO): Promise<CompraInsumoDTO> {
  const res = await axios.post<CompraInsumoDTO>(BASE, dto);
  return res.data;
}

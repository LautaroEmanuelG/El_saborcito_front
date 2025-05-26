// src/modules/HU26_28_informes/informes/services/informesService.ts

import { ProductoRanking } from '../model';
import axios from 'axios';

export const getRankingProductos = async (
  desde: string,
  hasta: string
): Promise<ProductoRanking[]> => {
  const response = await axios.get(`/api/sucursales/ranking-productos`, {
    params: { desde, hasta },
  });
  return response.data;
};

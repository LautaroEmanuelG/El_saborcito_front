// HU24_CompraIngredientes/services/compraInsumoStore.ts

import { create } from 'zustand';
import type { CompraInsumoDTO, NuevaCompraDTO } from '../model';
import * as api from './compraInsumoService';

interface CompraInsumoState {
  compras: CompraInsumoDTO[];
  loading: boolean;
  error: string | null;
  fetchCompras: () => Promise<void>;
  addCompra: (dto: NuevaCompraDTO) => Promise<void>;
}

export const useCompraInsumoStore = create<CompraInsumoState>((set) => ({
  compras: [],
  loading: false,
  error: null,

  fetchCompras: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.listarCompras();
      set({ compras: data, loading: false });
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      set({ error: message, loading: false });
    }
  },

  addCompra: async (dto) => {
    set({ loading: true, error: null });
    try {
      const newC = await api.registrarCompra(dto);
      set((state) => ({
        compras: [newC, ...state.compras],
        loading: false,
      }));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      set({ error: message, loading: false });
    }
  },
}));

import { create } from 'zustand';
import type { CompraInsumoView } from '../model';

interface CompraInsumoState {
  compras: CompraInsumoView[];
  loading: boolean;
  error: string | null;
  fetchCompras: () => Promise<void>;
  addCompra: (compra: Omit<CompraInsumoView, 'id'>) => Promise<void>;
}

export const useCompraInsumoStore = create<CompraInsumoState>((set) => ({
  compras: [],
  loading: false,
  error: null,
  fetchCompras: async () => {
    set({ loading: true, error: null });
    // Aquí iría la llamada real a la API
    setTimeout(() => {
      set({ compras: [], loading: false });
    }, 500);
  },
  addCompra: async (compra) => {
    set({ loading: true, error: null });
    // Aquí iría la llamada real a la API
    setTimeout(() => {
      set((state) => ({
        compras: [...state.compras, { ...compra, id: Date.now() }],
        loading: false,
      }));
    }, 500);
  },
}));

import { create } from 'zustand';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import * as service from '../../../shared/services/articuloManufacturadoService';

interface ArticuloManufacturadoState {
  articulos: ArticuloManufacturado[];
  loading: boolean;
  error: string | null;
  fetchArticulos: () => Promise<void>;
  addArticulo: (data: Partial<ArticuloManufacturado>) => Promise<void>;
  updateArticulo: (data: Partial<ArticuloManufacturado>) => Promise<void>;
  deleteArticulo: (id: number) => Promise<void>;
}

export const useArticuloManufacturadoStore = create<ArticuloManufacturadoState>((set) => ({
  articulos: [],
  loading: false,
  error: null,
  fetchArticulos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllArticuloManufacturados();
      console.log('ArticulosManufacturados', data);
      set({ articulos: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar artículos', loading: false });
    }
  },
  addArticulo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveArticuloManufacturado(data);
      await useArticuloManufacturadoStore.getState().fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar artículo', loading: false });
    }
  },
  updateArticulo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveArticuloManufacturado(data);
      await useArticuloManufacturadoStore.getState().fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al actualizar artículo', loading: false });
    }
  },
  deleteArticulo: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deleteArticuloManufacturado(id);
      await useArticuloManufacturadoStore.getState().fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al eliminar artículo', loading: false });
    }
  },
}));

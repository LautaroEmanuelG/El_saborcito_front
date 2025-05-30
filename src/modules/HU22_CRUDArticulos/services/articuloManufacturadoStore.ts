import { create } from 'zustand';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import * as service from '../../../shared/services/articuloManufacturadoService';

interface ArticuloManufacturadoState {
  articulos: ArticuloManufacturado[];
  deletedArticulos: ArticuloManufacturado[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  // 📖 **MÉTODOS DE CONSULTA**
  fetchArticulos: () => Promise<void>;
  fetchDeletedArticulos: () => Promise<void>;
  toggleShowDeleted: () => void;
  // 🔄 **MÉTODOS DE GESTIÓN**
  addArticulo: (data: Partial<ArticuloManufacturado>) => Promise<void>;
  updateArticulo: (data: Partial<ArticuloManufacturado>) => Promise<void>;
  // 🗑️ **MÉTODOS DE ELIMINACIÓN**
  deleteArticulo: (id: number) => Promise<void>;
  restoreArticulo: (id: number) => Promise<void>;
}

export const useArticuloManufacturadoStore = create<ArticuloManufacturadoState>((set) => ({
  articulos: [],
  deletedArticulos: [],
  loading: false,
  error: null,
  showDeleted: false,

  // 📖 **MÉTODOS DE CONSULTA**
  fetchArticulos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllArticuloManufacturados();
      console.log('ArticulosManufacturados activos:', data);
      set({ articulos: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar artículos', loading: false });
    }
  },

  fetchDeletedArticulos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedArticuloManufacturados();
      console.log('ArticulosManufacturados eliminados:', data);
      set({ deletedArticulos: data ?? [], loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar artículos eliminados',
        loading: false,
      });
    }
  },

  toggleShowDeleted: () => {
    const { showDeleted, fetchArticulos, fetchDeletedArticulos } =
      useArticuloManufacturadoStore.getState();
    set({ showDeleted: !showDeleted });
    if (!showDeleted) {
      fetchDeletedArticulos();
    } else {
      fetchArticulos();
    }
  },

  // 🔄 **MÉTODOS DE GESTIÓN**
  addArticulo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.createArticuloManufacturado(data);
      const { fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar artículo', loading: false });
    }
  },

  updateArticulo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.updateArticuloManufacturado(data);
      const { fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al actualizar artículo', loading: false });
    }
  },

  // 🗑️ **MÉTODOS DE ELIMINACIÓN**
  deleteArticulo: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deleteArticuloManufacturado(id);
      const { fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al eliminar artículo', loading: false });
    }
  },

  restoreArticulo: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.restoreArticuloManufacturado(id);
      const { fetchDeletedArticulos, fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchDeletedArticulos();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al restaurar artículo', loading: false });
    }
  },
}));

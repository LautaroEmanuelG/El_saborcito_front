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
  addArticulo: (data: Partial<ArticuloManufacturado>, imageFile?: File) => Promise<void>;
  updateArticulo: (data: Partial<ArticuloManufacturado>, imageFile?: File) => Promise<void>;
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
      set({ articulos: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar artículos', loading: false });
    }
  },

  fetchDeletedArticulos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedArticuloManufacturados();
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
  addArticulo: async (data, imageFile) => {
    set({ loading: true, error: null });
    try {
      // Usamos save para crear con id:0 y preparar payload correctamente
      await service.saveArticuloManufacturado(data, imageFile);
      const { fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar artículo', loading: false });
    }
  },

  updateArticulo: async (data, imageFile) => {
    set({ loading: true, error: null });
    try {
      // Usamos save para actualizar según el id existente
      await service.saveArticuloManufacturado(data, imageFile);
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
      // Verificar si se puede restaurar el artículo
      const canRestore = await service.canRestoreArticuloManufacturado(id);
      if (!canRestore.canRestore) {
        set({
          error:
            canRestore.message ||
            'No se puede restaurar este artículo porque su categoría está eliminada',
          loading: false,
        });
        return;
      }

      await service.restoreArticuloManufacturado(id);
      const { fetchDeletedArticulos, fetchArticulos } = useArticuloManufacturadoStore.getState();
      await fetchDeletedArticulos();
      await fetchArticulos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al restaurar artículo', loading: false });
    }
  },
}));

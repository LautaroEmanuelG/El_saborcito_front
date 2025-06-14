import { create } from 'zustand';
import type { Categoria } from '../../../types/Categoria';
import * as service from '../../../shared/services/categoriaService';

interface CategoriaArticuloState {
  categorias: Categoria[];
  deletedCategorias: Categoria[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  // Métodos de consulta
  fetchCategorias: () => Promise<void>;
  fetchDeletedCategorias: () => Promise<void>;
  toggleShowDeleted: () => void;
  // Métodos de gestión
  addCategoria: (data: Partial<Categoria>) => Promise<void>;
  updateCategoria: (data: Partial<Categoria>) => Promise<void>;
  // Métodos de eliminación
  deleteCategoria: (id: number) => Promise<void>;
  restoreCategoria: (id: number) => Promise<void>;
}

export const useCategoriaArticuloStore = create<CategoriaArticuloState>((set) => ({
  categorias: [],
  deletedCategorias: [],
  loading: false,
  error: null,
  showDeleted: false,

  // Métodos de consulta
  fetchCategorias: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllCategorias();
      set({ categorias: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar categorías', loading: false });
    }
  },

  fetchDeletedCategorias: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedCategorias();
      set({ deletedCategorias: data ?? [], loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar categorías eliminadas',
        loading: false,
      });
    }
  },

  toggleShowDeleted: () => {
    const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
      useCategoriaArticuloStore.getState();
    set({ showDeleted: !showDeleted });
    if (!showDeleted) {
      fetchDeletedCategorias();
    } else {
      fetchCategorias();
    }
  },

  // Métodos de gestión
  addCategoria: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveCategoria(data);
      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useCategoriaArticuloStore.getState();
      if (showDeleted) {
        await fetchDeletedCategorias();
      } else {
        await fetchCategorias();
      }
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar categoría', loading: false });
    }
  },

  updateCategoria: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveCategoria(data);
      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useCategoriaArticuloStore.getState();
      if (showDeleted) {
        await fetchDeletedCategorias();
      } else {
        await fetchCategorias();
      }
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al actualizar categoría', loading: false });
    }
  },

  // Métodos de eliminación
  deleteCategoria: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deleteCategoria(id);
      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useCategoriaArticuloStore.getState();
      if (showDeleted) {
        await fetchDeletedCategorias();
      } else {
        await fetchCategorias();
      }
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al eliminar categoría', loading: false });
    }
  },

  restoreCategoria: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.restoreCategoria(id);
      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useCategoriaArticuloStore.getState();
      if (showDeleted) {
        await fetchDeletedCategorias();
      } else {
        await fetchCategorias();
      }
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al restaurar categoría', loading: false });
    }
  },
}));

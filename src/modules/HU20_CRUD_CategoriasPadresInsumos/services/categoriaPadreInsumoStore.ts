import { create } from 'zustand';
import type { Categoria } from '../../../types/Categoria';
import * as service from '../../../shared/services/categoriaService';

interface CategoriaPadreInsumoState {
  categoriasPadre: Categoria[];
  deletedCategoriasPadre: Categoria[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  fetchCategoriasPadre: () => Promise<void>;
  fetchDeletedCategoriasPadre: () => Promise<void>;
  toggleShowDeleted: () => void;
  addCategoriaPadre: (data: Partial<Categoria>) => Promise<void>;
  updateCategoriaPadre: (data: Partial<Categoria>) => Promise<void>;
  deleteCategoriaPadre: (id: number) => Promise<void>;
  restoreCategoriaPadre: (id: number) => Promise<void>;
}

export const useCategoriaPadreInsumoStore = create<CategoriaPadreInsumoState>((set) => ({
  categoriasPadre: [],
  deletedCategoriasPadre: [],
  loading: false,
  error: null,
  showDeleted: false,

  fetchCategoriasPadre: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllCategorias();
      set({
        categoriasPadre: (data ?? []).filter(
          (c: Categoria) => !c.tipoCategoria && c.tipo === 'INSUMOS'
        ),
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar categorías padre',
        loading: false,
      });
    }
  },

  fetchDeletedCategoriasPadre: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedCategorias();
      set({
        deletedCategoriasPadre: (data ?? []).filter(
          (c: Categoria) => !c.tipoCategoria && c.tipo === 'INSUMOS'
        ),
        loading: false,
      });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar categorías padre eliminadas',
        loading: false,
      });
    }
  },

  toggleShowDeleted: () => {
    const { showDeleted, fetchCategoriasPadre, fetchDeletedCategoriasPadre } =
      useCategoriaPadreInsumoStore.getState();
    set({ showDeleted: !showDeleted });
    if (!showDeleted) {
      fetchDeletedCategoriasPadre();
    } else {
      fetchCategoriasPadre();
    }
  },

  addCategoriaPadre: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveCategoria({ ...data, tipo: 'INSUMOS' });
      const { showDeleted, fetchCategoriasPadre, fetchDeletedCategoriasPadre } =
        useCategoriaPadreInsumoStore.getState();
      if (showDeleted) {
        await fetchDeletedCategoriasPadre();
      } else {
        await fetchCategoriasPadre();
      }
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al agregar categoría padre',
        loading: false,
      });
    }
  },

  updateCategoriaPadre: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveCategoria({ ...data, tipo: 'INSUMOS' });
      const { showDeleted, fetchCategoriasPadre, fetchDeletedCategoriasPadre } =
        useCategoriaPadreInsumoStore.getState();
      if (showDeleted) {
        await fetchDeletedCategoriasPadre();
      } else {
        await fetchCategoriasPadre();
      }
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al actualizar categoría padre',
        loading: false,
      });
    }
  },

  deleteCategoriaPadre: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deleteCategoria(id);
      const { showDeleted, fetchCategoriasPadre, fetchDeletedCategoriasPadre } =
        useCategoriaPadreInsumoStore.getState();
      if (showDeleted) {
        await fetchDeletedCategoriasPadre();
      } else {
        await fetchCategoriasPadre();
      }
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al eliminar categoría padre',
        loading: false,
      });
    }
  },

  restoreCategoriaPadre: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.restoreCategoria(id);
      const { showDeleted, fetchCategoriasPadre, fetchDeletedCategoriasPadre } =
        useCategoriaPadreInsumoStore.getState();
      if (showDeleted) {
        await fetchDeletedCategoriasPadre();
      } else {
        await fetchCategoriasPadre();
      }
      set({ loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al restaurar categoría padre',
        loading: false,
      });
    }
  },
}));

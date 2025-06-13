import { create } from 'zustand';
import type { Categoria } from '../../../types/Categoria';
import * as service from '../../../shared/services/categoriaService';

interface SubcategoriaInsumosState {
  categorias: Categoria[];
  deletedCategorias: Categoria[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  fetchCategorias: () => Promise<void>;
  fetchDeletedCategorias: () => Promise<void>;
  toggleShowDeleted: () => void;
  addCategoria: (data: Partial<Categoria>) => Promise<void>;
  updateCategoria: (data: Partial<Categoria>) => Promise<void>;
  deleteCategoria: (id: number) => Promise<void>;
  restoreCategoria: (id: number) => Promise<void>;
}

export const useSubcategoriaInsumosStore = create<SubcategoriaInsumosState>((set) => ({
  categorias: [],
  deletedCategorias: [],
  loading: false,
  error: null,
  showDeleted: false,

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
      useSubcategoriaInsumosStore.getState();
    set({ showDeleted: !showDeleted });
    if (!showDeleted) {
      fetchDeletedCategorias();
    } else {
      fetchCategorias();
    }
  },

  addCategoria: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveCategoria(data);
      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useSubcategoriaInsumosStore.getState();
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
        useSubcategoriaInsumosStore.getState();
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

  deleteCategoria: async (id) => {
    set({ loading: true, error: null });
    try {
      // Eliminar la subcategoría (baja lógica)
      await service.deleteCategoria(id);

      // Eliminar lógicamente todos los insumos que tengan esta subcategoría
      const { getAllArticuloInsumoByCategoria, deleteArticuloInsumo } = await import(
        '../../../shared/services/articuloInsumoService'
      );
      const insumosAsociados = await getAllArticuloInsumoByCategoria(id);
      if (Array.isArray(insumosAsociados)) {
        for (const insumo of insumosAsociados) {
          if (insumo.id) {
            await deleteArticuloInsumo(insumo.id);
          }
        }
      }

      const { showDeleted, fetchCategorias, fetchDeletedCategorias } =
        useSubcategoriaInsumosStore.getState();
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
        useSubcategoriaInsumosStore.getState();
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

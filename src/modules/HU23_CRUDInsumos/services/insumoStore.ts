import { create } from 'zustand';
import type { ArticuloInsumo } from '../../../types/Articulo';
import * as service from '../../../shared/services/articuloInsumoService';

interface InsumoState {
  insumos: ArticuloInsumo[];
  deletedInsumos: ArticuloInsumo[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  fetchInsumos: () => Promise<void>;
  fetchDeletedInsumos: () => Promise<void>;
  toggleShowDeleted: () => void;
  addInsumo: (data: Partial<ArticuloInsumo>) => Promise<void>;
  updateInsumo: (data: Partial<ArticuloInsumo>) => Promise<void>;
  deleteInsumo: (id: number) => Promise<void>;
  restoreInsumo: (id: number) => Promise<void>;
}

export const useInsumoStore = create<InsumoState>((set) => ({
  insumos: [],
  deletedInsumos: [],
  loading: false,
  error: null,
  showDeleted: false,

  fetchInsumos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllArticuloInsumos();
      set({ insumos: data ?? [], loading: false });
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar insumos', loading: false });
    }
  },

  fetchDeletedInsumos: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedArticuloInsumos();
      set({ deletedInsumos: data ?? [], loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar insumos eliminados',
        loading: false,
      });
    }
  },

  toggleShowDeleted: () => {
    const { showDeleted, fetchInsumos, fetchDeletedInsumos } = useInsumoStore.getState();
    set({ showDeleted: !showDeleted });
    if (!showDeleted) {
      fetchDeletedInsumos();
    } else {
      fetchInsumos();
    }
  },

  addInsumo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveArticuloInsumo(data);
      await useInsumoStore.getState().fetchInsumos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar insumo', loading: false });
    }
  },

  updateInsumo: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.saveArticuloInsumo(data);
      await useInsumoStore.getState().fetchInsumos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al actualizar insumo', loading: false });
    }
  },

  deleteInsumo: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deleteArticuloInsumo(id);
      await useInsumoStore.getState().fetchInsumos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al eliminar insumo', loading: false });
    }
  },

  restoreInsumo: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.restoreArticuloInsumo(id);
      await useInsumoStore.getState().fetchDeletedInsumos();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al restaurar insumo', loading: false });
    }
  },
}));

// Copia de servicios para Promociones
import { create } from 'zustand';
import type { Promocion } from '../../../types/Promocion';
import * as service from '../../../shared/services/promocionService';

interface PromocionState {
  promociones: Promocion[];
  deletedPromociones: Promocion[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  fetchPromociones: () => Promise<void>;
  fetchDeletedPromociones: () => Promise<void>;
  addPromocion: (data: Partial<Promocion>) => Promise<void>;
  updatePromocion: (data: Partial<Promocion>) => Promise<void>;
  deletePromocion: (id: number) => Promise<void>;
  restorePromocion: (id: number) => Promise<void>;
  toggleShowDeleted: () => void;
}

export const usePromocionStore = create<PromocionState>((set, get) => ({
  promociones: [],
  deletedPromociones: [],
  loading: false,
  error: null,
  showDeleted: false,

  fetchPromociones: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getAllPromociones();
      set({ promociones: data ?? [], loading: false });

      // Si showDeleted está activo, también cargar eliminadas
      if (get().showDeleted) {
        get().fetchDeletedPromociones();
      }
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al cargar promociones', loading: false });
    }
  },

  fetchDeletedPromociones: async () => {
    set({ loading: true, error: null });
    try {
      const data = await service.getDeletedPromociones();
      set({ deletedPromociones: data ?? [], loading: false });
    } catch (error) {
      set({
        error: (error as Error)?.message ?? 'Error al cargar promociones eliminadas',
        loading: false,
      });
    }
  },

  addPromocion: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.savePromocion(data);
      const { fetchPromociones } = get();
      await fetchPromociones();
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al agregar promoción', loading: false });
    }
  },

  updatePromocion: async (data) => {
    set({ loading: true, error: null });
    try {
      await service.savePromocion(data);
      const { fetchPromociones, fetchDeletedPromociones } = get();
      await fetchPromociones();
      if (get().showDeleted) {
        await fetchDeletedPromociones();
      }
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al actualizar promoción', loading: false });
    }
  },

  deletePromocion: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.deletePromocion(id);
      const { fetchPromociones, fetchDeletedPromociones } = get();
      await fetchPromociones();
      if (get().showDeleted) {
        await fetchDeletedPromociones();
      }
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al eliminar promoción', loading: false });
    }
  },

  restorePromocion: async (id) => {
    set({ loading: true, error: null });
    try {
      await service.restorePromocion(id);
      const { fetchPromociones, fetchDeletedPromociones } = get();
      await fetchPromociones();
      if (get().showDeleted) {
        await fetchDeletedPromociones();
      }
    } catch (error) {
      set({ error: (error as Error)?.message ?? 'Error al restaurar promoción', loading: false });
    }
  },

  toggleShowDeleted: () => {
    const newState = !get().showDeleted;
    set({ showDeleted: newState });

    // Si cambiamos a mostrar eliminadas, cargarlas
    if (newState) {
      get().fetchDeletedPromociones();
    }
  },
}));

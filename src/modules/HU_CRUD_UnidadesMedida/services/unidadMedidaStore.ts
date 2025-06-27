import { create } from 'zustand';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import * as unidadMedidaService from '../../../shared/services/unidadMedidaService';
import axiosInstance from '../../../shared/services/axiosConfig';

interface UnidadMedidaState {
  unidades: UnidadMedida[];
  deletedUnidades: UnidadMedida[];
  loading: boolean;
  error: string | null;
  showDeleted: boolean;
  fetchUnidades: () => Promise<void>;
  addUnidad: (unidad: Partial<UnidadMedida>) => Promise<void>;
  updateUnidad: (unidad: Partial<UnidadMedida>) => Promise<void>;
  deleteUnidad: (id: number) => Promise<void>;
  restoreUnidad: (id: number) => Promise<void>;
  toggleShowDeleted: () => void;
  clearError: () => void;
}

export const useUnidadMedidaStore = create<UnidadMedidaState>((set, get) => ({
  unidades: [],
  deletedUnidades: [],
  loading: false,
  error: null,
  showDeleted: false,
  fetchUnidades: async () => {
    set({ loading: true, error: null });
    try {
      // Usar el endpoint que incluye eliminadas para manejar ambos estados en el módulo CRUD
      const data = await unidadMedidaService.getAllUnidadMedidasIncludingDeleted();
      // Separar activos y eliminados
      const activos = data.filter((u: any) => !u.eliminado);
      const eliminados = data.filter((u: any) => u.eliminado);
      set({ unidades: activos, deletedUnidades: eliminados, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar unidades de medida', loading: false });
    }
  },
  addUnidad: async (unidad: Partial<UnidadMedida>) => {
    set({ loading: true, error: null });
    try {
      // Validar duplicados contra TODAS las unidades (activas y eliminadas)
      const { unidades, deletedUnidades } = get();
      const denominacionNormalizada = unidad.denominacion?.toLowerCase().trim();

      // Verificar en unidades activas
      const existeEnActivas = unidades.some(
        (u) => u.denominacion?.toLowerCase().trim() === denominacionNormalizada
      );

      // Verificar en unidades eliminadas
      const existeEnEliminadas = deletedUnidades.some(
        (u) => u.denominacion?.toLowerCase().trim() === denominacionNormalizada
      );

      if (existeEnActivas || existeEnEliminadas) {
        const mensaje = existeEnEliminadas
          ? `Ya existe una unidad de medida eliminada con la denominación "${unidad.denominacion}". Debe restaurarla en lugar de crear una nueva.`
          : `Ya existe una unidad de medida con la denominación "${unidad.denominacion}"`;

        set({
          error: mensaje,
          loading: false,
        });
        return;
      }

      await unidadMedidaService.saveUnidadMedida(unidad);
      await get().fetchUnidades(); // Recargar lista
    } catch (error) {
      set({ error: 'Error al crear unidad de medida', loading: false });
    }
  },
  updateUnidad: async (unidad: Partial<UnidadMedida>) => {
    set({ loading: true, error: null });
    try {
      // Validar duplicados contra TODAS las unidades (activas y eliminadas), excluyendo la unidad actual
      const { unidades, deletedUnidades } = get();
      const denominacionNormalizada = unidad.denominacion?.toLowerCase().trim();

      // Verificar en unidades activas (excluyendo la actual)
      const existeEnActivas = unidades.some(
        (u) =>
          u.id !== unidad.id && u.denominacion?.toLowerCase().trim() === denominacionNormalizada
      );

      // Verificar en unidades eliminadas (excluyendo la actual)
      const existeEnEliminadas = deletedUnidades.some(
        (u) =>
          u.id !== unidad.id && u.denominacion?.toLowerCase().trim() === denominacionNormalizada
      );

      if (existeEnActivas || existeEnEliminadas) {
        const mensaje = existeEnEliminadas
          ? `Ya existe una unidad de medida eliminada con la denominación "${unidad.denominacion}". No se puede usar este nombre.`
          : `Ya existe una unidad de medida con la denominación "${unidad.denominacion}"`;

        set({
          error: mensaje,
          loading: false,
        });
        return;
      }

      await unidadMedidaService.saveUnidadMedida(unidad);
      await get().fetchUnidades(); // Recargar lista
    } catch (error) {
      set({ error: 'Error al actualizar unidad de medida', loading: false });
    }
  },
  deleteUnidad: async (id: number) => {
    set({ loading: true, error: null });
    try {
      // Usar el método del servicio para la baja lógica
      await unidadMedidaService.deleteUnidadMedidaLogico(id);
      await get().fetchUnidades(); // Recargar lista
    } catch (error) {
      set({ error: 'Error al eliminar unidad de medida', loading: false });
    }
  },

  restoreUnidad: async (id: number) => {
    set({ loading: true, error: null });
    try {
      // Usar el método del servicio para restaurar
      await unidadMedidaService.restaurarUnidadMedida(id);
      await get().fetchUnidades(); // Recargar lista
    } catch (error) {
      set({ error: 'Error al restaurar unidad de medida', loading: false });
    }
  },
  toggleShowDeleted: () => {
    set((state) => ({ showDeleted: !state.showDeleted }));
  },

  clearError: () => {
    set({ error: null });
  },
}));

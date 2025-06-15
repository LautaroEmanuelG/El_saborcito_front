import type { Promocion, PromocionNormalizada } from '../../../types/Promocion';
import type { PedidoRequest, PedidoResponse } from '../../../types/Pedido';
import axiosInstance from '../../../shared/services/axiosConfig';

const API_BASE_URL_PROMOCIONES = '/promociones';
const API_BASE_URL_PEDIDOS = '/pedidos';

// 🎁 **SERVICIOS DE PROMOCIONES**

export const getAllPromocionesVigentes = async (sucursalId: number): Promise<Promocion[]> => {
  const response = await axiosInstance.get<Promocion[]>(
    `${API_BASE_URL_PROMOCIONES}/vigentes/${sucursalId}`
  );
  return response.data ?? [];
};

export const getPromocionById = async (id: number): Promise<Promocion> => {
  const response = await axiosInstance.get<Promocion>(`${API_BASE_URL_PROMOCIONES}/${id}`);
  return response.data;
};

// 🔄 **FUNCIÓN MIDDLEWARE PARA NORMALIZAR PROMOCIONES**

export const normalizePromocionToProduct = (promocion: Promocion): PromocionNormalizada => {
  return {
    id: promocion.id,
    denominacion: promocion.denominacion,
    precioVenta: promocion.precioPromocional,
    imagen: promocion.imagen,
    tipo: 'promocion',
    promocionOriginal: promocion,
    articulosIncluidos: promocion.promocionDetalles.map((detalle) => ({
      id: detalle.articulo.id,
      denominacion: detalle.articulo.denominacion,
      cantidad: detalle.cantidadRequerida,
    })),
  };
};

export const normalizePromociones = (promociones: Promocion[]): PromocionNormalizada[] => {
  return promociones.map(normalizePromocionToProduct);
};

// 📦 **SERVICIOS DE PEDIDOS**

export const createPedidoWithPromociones = async (
  pedidoData: PedidoRequest
): Promise<PedidoResponse> => {
  const response = await axiosInstance.post<PedidoResponse>(API_BASE_URL_PEDIDOS, pedidoData);
  return response.data;
};

// 🔍 **ANÁLISIS DE PROMOCIONES**

export const analizarPromocionAvailability = async (
  promocion: Promocion,
  cantidad: number = 1
): Promise<boolean> => {
  try {
    // Convertir los artículos de la promoción al formato que espera analizarProduccion
    const articulosParaAnalizar = promocion.promocionDetalles.map((detalle) => ({
      articuloId: detalle.articulo.id,
      cantidad: detalle.cantidadRequerida * cantidad, // Multiplicar por la cantidad de promociones solicitadas
    }));

    // Usar el servicio existente de análisis de producción
    const { analizarProduccion } = await import('../../../shared/services/articuloService');
    const analisisResult = await analizarProduccion(articulosParaAnalizar);

    return analisisResult?.sePuedeProducirCompleto ?? false;
  } catch (error) {
    console.error('Error al analizar disponibilidad de promoción:', error);
    return false;
  }
};

// 🔧 **UTILIDADES PARA PROMOCIONES**

export const getArticulosFromPromocion = (promocion: Promocion, cantidadPromocion: number = 1) => {
  return promocion.promocionDetalles.map((detalle) => ({
    articuloId: detalle.articulo.id,
    cantidad: detalle.cantidadRequerida * cantidadPromocion,
  }));
};

export const isPromocionVigente = (promocion: Promocion): boolean => {
  const now = new Date();
  const fechaDesde = new Date(promocion.fechaDesde);
  const fechaHasta = new Date(promocion.fechaHasta);

  // Verificar rango de fechas
  if (now < fechaDesde || now > fechaHasta) {
    return false;
  }

  // Si no tiene restricciones de hora, está vigente
  if (!promocion.horaDesde || !promocion.horaHasta) {
    return true;
  }

  // Verificar rango de horas
  const horaActual = now.getHours() * 60 + now.getMinutes();
  const [horaDesdeHours, horaDesdeMinutes] = promocion.horaDesde.split(':').map(Number);
  const [horaHastaHours, horaHastaMinutes] = promocion.horaHasta.split(':').map(Number);

  const horaDesde = horaDesdeHours * 60 + horaDesdeMinutes;
  const horaHasta = horaHastaHours * 60 + horaHastaMinutes;

  return horaActual >= horaDesde && horaActual <= horaHasta;
};

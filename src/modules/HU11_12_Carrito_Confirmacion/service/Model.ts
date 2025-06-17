import type { PedidoRequest } from '../../../types/Pedido';
import { HARDCODED_CONFIG } from '../../../types/Pedido';
import type { Articulo } from '../../../types/Articulo';
import type { PromocionEnCarrito } from '../../../types/Promocion';

// 📦 **MODELO PARA CREACIÓN DE PEDIDOS**

export const createPedidoModel = (
  carrito: Array<Articulo & { cantidad: number }>,
  promocionesEnCarrito: PromocionEnCarrito[]
): PedidoRequest => {
  // Crear detalles de productos individuales
  const detalles = carrito.map((producto) => ({
    cantidad: producto.cantidad,
    articuloId: producto.id,
  }));

  // Crear promociones seleccionadas
  const promocionesSeleccionadas = promocionesEnCarrito.map((item) => ({
    promocionId: item.promocion.id,
    cantidad: item.cantidad,
  }));

  // Retornar estructura que espera el backend
  return {
    clienteId: HARDCODED_CONFIG.clienteId,
    tipoEnvioId: HARDCODED_CONFIG.tipoEnvioId,
    formaPagoId: HARDCODED_CONFIG.formaPagoId,
    sucursalId: HARDCODED_CONFIG.sucursalId,
    domicilio: HARDCODED_CONFIG.domicilio,
    detalles,
    promocionesSeleccionadas,
  };
};

// 🧮 **UTILIDADES DE CÁLCULO**

export const calcularTotalCarrito = (
  carrito: Array<Articulo & { cantidad: number }>,
  promocionesEnCarrito: PromocionEnCarrito[]
): number => {
  // Total de productos individuales
  const totalProductos = carrito.reduce((total, producto) => {
    return total + producto.precioVenta * producto.cantidad;
  }, 0);
  // Total de promociones
  const totalPromociones = promocionesEnCarrito.reduce((total, item) => {
    return total + (item.promocion.precioPromocional ?? 0) * item.cantidad;
  }, 0);

  return totalProductos + totalPromociones;
};

export const calcularAhorroPromociones = (promocionesEnCarrito: PromocionEnCarrito[]): number => {
  return promocionesEnCarrito.reduce((totalAhorro, item) => {
    // Calcular precio normal de todos los productos de la promoción
    const precioNormal = item.promocion.promocionDetalles.reduce((suma, detalle) => {
      return suma + detalle.articulo.precioVenta * detalle.cantidadRequerida;
    }, 0);

    const ahorroUnidad = precioNormal - (item.promocion.precioPromocional ?? 0);
    return totalAhorro + ahorroUnidad * item.cantidad;
  }, 0);
};

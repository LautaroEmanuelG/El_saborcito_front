import type { Imagen } from './Imagen';

// 🎁 **TIPOS PARA PROMOCIONES**

export interface PromocionDetalle {
  id: number;
  promocionId: number;
  articulo: {
    id: number;
    denominacion: string;
    precioVenta: number;
    categoriaId: number;
    imagen: Imagen;
    eliminado: boolean;
    fechaEliminacion: string | null;
  };
  cantidadRequerida: number;
}

export interface Sucursal {
  id: number;
  nombre: string;
  domicilio: {
    id: number;
    calle: string;
    numero: number;
    cp: string;
    localidad: {
      id: number;
      nombre: string;
      provincia: {
        id: number;
        nombre: string;
        pais: {
          id: number;
          nombre: string;
        };
      };
    };
    latitud: number | null;
    longitud: number | null;
  };
  empresa: {
    id: number;
    nombre: string;
    razonSocial: string;
    cuil: string;
  };
  horarios: Array<{
    id: number;
    diaSemana: string;
    apertura: string;
    cierre: string;
  }>;
}

export interface Promocion {
  id: number;
  denominacion: string;
  fechaDesde: string;
  fechaHasta: string;
  horaDesde: string | null;
  horaHasta: string | null;
  descuento: number | null;
  precioPromocional: number | null | undefined;
  sucursal: Sucursal;
  imagen: Imagen;
  promocionDetalles: PromocionDetalle[];
  eliminado: boolean;
  articulo: any | null; // El backend siempre devuelve null para promociones
}

// 🛒 **TIPOS PARA CARRITO CON PROMOCIONES**

export interface PromocionEnCarrito {
  promocion: Promocion;
  cantidad: number;
  disponible: boolean;
  denominacion?: string;
  precioPromocional?: number;
}

// 📊 **TIPOS PARA ANÁLISIS DE PROMOCIONES**

export interface AnalisisPromocionRequest {
  promocionId: number;
  cantidad: number;
}

// 🔄 **TIPOS PARA NORMALIZACIÓN**

export interface PromocionNormalizada {
  id: number;
  denominacion: string;
  precioVenta: number; // Precio promocional
  imagen: Imagen;
  tipo: 'promocion'; // Identificador para distinguir de productos
  promocionOriginal: Promocion; // Referencia a la promoción completa
  articulosIncluidos: Array<{
    id: number;
    denominacion: string;
    cantidad: number;
  }>;
}

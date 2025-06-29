// src/modules/HU24_CompraIngredientes/components/ScreenCompraIngredientes.tsx

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { useCompraInsumoStore } from '../services/compraInsumoStore';
import { COMPRA_INSUMO_COLUMNS, CompraInsumoDTO } from '../model';
import CompraIngredientesModal from './CompraIngredientesModal';
import ModalDetalleCompra from './ModalDetalleCompra';
import ModalActualizarPreciosManufacturados from './ModalActualizarPreciosManufacturados';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import { useInsumoStore } from '../../HU23_CRUDInsumos/services/insumoStore';
import { getArticuloManufacturadosByInsumo } from '../../../shared/services/articuloInsumoService';
import * as compraInsumoService from '../services/compraInsumoService';
import ModalSiNo from '../../../shared/components/abmGenerica/components/modals/ModalSiNo';
import type { ArticuloManufacturado } from '../../../types/Articulo';

interface InsumoCambioPrecio {
  insumoId: number;
  denominacion: string;
  precioAnterior: number;
  precioNuevo: number;
  porcentajeAumento: number;
}

const ScreenCompraIngredientes = () => {
  const { compras, loading, error, fetchCompras } = useCompraInsumoStore();
  const { insumos } = useInsumoStore();
  const [openModal, setOpenModal] = useState(false);
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [filteredCompras, setFilteredCompras] = useState<CompraInsumoDTO[]>([]);
  const [detalleCompra, setDetalleCompra] = useState<CompraInsumoDTO | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

  // Estados para modal de actualización de precios
  const [openModalActualizarPrecios, setOpenModalActualizarPrecios] = useState(false);
  const [insumosConCambiosPrecio, setInsumosConCambiosPrecio] = useState<InsumoCambioPrecio[]>([]);
  const [articulosManufacturadosAfectados, setArticulosManufacturadosAfectados] = useState<
    ArticuloManufacturado[]
  >([]);
  const [loadingActualizarPrecios, setLoadingActualizarPrecios] = useState(false);

  // Estados para modal de notificación
  const [modalNotificacion, setModalNotificacion] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Función para mostrar notificaciones
  const mostrarNotificacion = (title: string, description: string, onConfirm = () => {}) => {
    setModalNotificacion({
      open: true,
      title,
      description,
      onConfirm: () => {
        setModalNotificacion((prev) => ({ ...prev, open: false }));
        onConfirm();
      },
    });
  };

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  useEffect(() => {
    // Filtrar por fechas si hay datos
    if (compras.length > 0) {
      setFilteredCompras(
        compras.filter((c) => {
          return c.fechaCompra >= desde && c.fechaCompra <= hasta;
        })
      );
    } else {
      setFilteredCompras([]);
    }
  }, [compras, desde, hasta]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  /**
   * Cuando el modal devuelve la compra creada,
   * simplemente recargo el listado desde el store y cierro el modal
   */
  const handleCompraRegistrada = () => {
    fetchCompras();
    setOpenModal(false);
  };

  // Handler para ver detalle
  const handleView = (compra: CompraInsumoDTO) => {
    setDetalleCompra(compra);
    setOpenDetalle(true);
  };

  // Handler para manejar la actualización de precios desde CompraIngredientesModal
  const handleActualizarPreciosDesdeCompra = (
    insumosConCambios: InsumoCambioPrecio[],
    articulosAfectados: ArticuloManufacturado[]
  ) => {
    setInsumosConCambiosPrecio(insumosConCambios);
    setArticulosManufacturadosAfectados(articulosAfectados);

    if (articulosAfectados.length > 0) {
      setOpenModalActualizarPrecios(true);
    } else {
      alert('No se encontraron artículos manufacturados que usen estos insumos.');
      setOpenModal(false); // Cerrar el modal de compra si no hay artículos afectados
    }
  };

  // Handler cuando se complete la actualización de precios
  const handleActualizacionCompleta = () => {
    setOpenModalActualizarPrecios(false);
    setOpenModal(false); // Cerrar también el modal de compra
    setInsumosConCambiosPrecio([]);
    setArticulosManufacturadosAfectados([]);
  };

  // Función para manejar la actualización de precios basada en la última compra
  const handleActualizarPreciosUltimaCompra = async () => {
    setLoadingActualizarPrecios(true);

    try {
      // Obtener la última compra
      const ultimaCompra = await compraInsumoService.getUltimaCompra();

      if (!ultimaCompra || !ultimaCompra.detalles || ultimaCompra.detalles.length === 0) {
        mostrarNotificacion(
          'Sin compras recientes',
          'No se encontró ninguna compra reciente para actualizar precios.'
        );
        return;
      }

      // Detectar cambios de precio de la última compra
      const cambiosPrecios = ultimaCompra.detalles
        .filter((detalle: any) => {
          const insumo = insumos.find((i) => i.id === detalle.insumoId);
          if (!insumo) return false;

          const precioActual = insumo.precioCompra ?? 0;
          const precioCompra = detalle.precioUnitario ?? 0;

          if (precioCompra <= 0 || precioActual <= 0) return false;

          const porcentajeDiferencia = Math.abs(
            ((precioCompra - precioActual) / precioActual) * 100
          );
          return porcentajeDiferencia > 1;
        })
        .map((detalle: any) => {
          const insumo = insumos.find((i) => i.id === detalle.insumoId);
          const precioActual = insumo?.precioCompra ?? 0;
          const precioCompra = detalle.precioUnitario ?? 0;
          const porcentajeAumento = ((precioCompra - precioActual) / precioActual) * 100;

          return {
            insumoId: detalle.insumoId,
            denominacion: insumo?.denominacion ?? 'Desconocido',
            precioAnterior: precioActual,
            precioNuevo: precioCompra,
            porcentajeAumento,
          };
        });

      if (cambiosPrecios.length === 0) {
        mostrarNotificacion(
          'Sin cambios de precio',
          'No se detectaron cambios de precio significativos en la última compra.'
        );
        return;
      }

      setInsumosConCambiosPrecio(cambiosPrecios);

      // Obtener artículos manufacturados afectados
      const todosLosArticulosAfectados: ArticuloManufacturado[] = [];
      const idsArticulosYaAgregados = new Set<number>();

      for (const cambio of cambiosPrecios) {
        try {
          const articulosDeEsteInsumo = await getArticuloManufacturadosByInsumo(cambio.insumoId);

          articulosDeEsteInsumo.forEach((articulo: ArticuloManufacturado) => {
            if (!idsArticulosYaAgregados.has(articulo.id)) {
              todosLosArticulosAfectados.push(articulo);
              idsArticulosYaAgregados.add(articulo.id);
            }
          });
        } catch (error) {
          console.error(
            `Error al obtener artículos manufacturados para insumo ${cambio.insumoId}:`,
            error
          );
        }
      }

      setArticulosManufacturadosAfectados(todosLosArticulosAfectados);

      if (todosLosArticulosAfectados.length > 0) {
        setOpenModalActualizarPrecios(true);
      } else {
        mostrarNotificacion(
          'Sin artículos afectados',
          'No se encontraron artículos manufacturados que usen estos insumos.'
        );
      }
    } catch (error) {
      console.error('Error al obtener la última compra:', error);
      mostrarNotificacion('Error', 'Error al obtener información de la última compra.');
    } finally {
      setLoadingActualizarPrecios(false);
    }
  };

  // Columnas con acciones
  const columns = [
    ...COMPRA_INSUMO_COLUMNS,
    {
      label: 'Acciones',
      key: 'acciones',
      render: (row: CompraInsumoDTO) => (
        <ButtonsTable
          el={row}
          handleDelete={() => {}}
          setOpenModal={() => {}}
          setSelectedItem={() => {}}
          soloVer={true}
          onView={() => handleView(row)}
        />
      ),
    },
  ];

  // Calcular el gasto total filtrado
  const totalGastos = filteredCompras.reduce((acc, c) => acc + c.totalCompra, 0);

  // Validación de rango de fechas
  const isInvalidRange = new Date(desde) > new Date(hasta);
  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Compra de Insumos</h1>
        <div className="flex gap-3">
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={handleActualizarPreciosUltimaCompra}
            disabled={loadingActualizarPrecios}
            title="Actualizar precios basado en la última compra"
          >
            {loadingActualizarPrecios ? 'Cargando...' : 'Actualizar Precios'}
          </button>
          <button
            className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
            onClick={handleOpenModal}
          >
            Realizar Compra
          </button>
        </div>
      </div>
      <div className="flex w-full justify-between items-center mb-6">
        <div className="bg-primary border border-primarydark text-white px-3 py-2 rounded-lg shadow text-base font-semibold text-right min-w-[140px]">
          Gastos realizados:
          <br />
          <span className="text-lg">
            $
            {totalGastos.toLocaleString('es-AR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
        <div className="flex gap-4 bg-gray-200 p-2 rounded-lg items-center">
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Desde:</label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 font-medium mb-1">Hasta:</label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="border border-gray-300 px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      {isInvalidRange && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          La fecha "Desde" no puede ser posterior a "Hasta".
        </div>
      )}

      <TableGeneric
        columns={columns}
        rows={isInvalidRange ? [] : filteredCompras}
        showSearchBar={false}
        handleDelete={() => {}}
        setOpenModal={() => {}}
        setSelectedItem={() => {}}
      />

      <CompraIngredientesModal
        open={openModal}
        onClose={handleCloseModal}
        onCompraRegistrada={handleCompraRegistrada}
        onActualizarPrecios={handleActualizarPreciosDesdeCompra}
      />

      <ModalDetalleCompra
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
        compra={detalleCompra}
      />

      {/* Modal de actualización de precios */}
      <ModalActualizarPreciosManufacturados
        open={openModalActualizarPrecios}
        onClose={() => setOpenModalActualizarPrecios(false)}
        insumosConCambios={insumosConCambiosPrecio}
        articulosManufacturados={articulosManufacturadosAfectados}
        onActualizacionCompleta={handleActualizacionCompleta}
      />

      {loading && <div className="mt-4">Cargando compras...</div>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
          ❌ {error}
        </div>
      )}

      {/* Modal de notificación */}
      <ModalSiNo
        open={modalNotificacion.open}
        onClose={() => setModalNotificacion((prev) => ({ ...prev, open: false }))}
        onConfirm={modalNotificacion.onConfirm}
        title={modalNotificacion.title}
        description={modalNotificacion.description}
        confirmText="Aceptar"
        cancelText=""
      />
    </div>
  );
};

export default ScreenCompraIngredientes;

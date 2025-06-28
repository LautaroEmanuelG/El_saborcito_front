import { useState } from 'react';
import { useStockInsumoStore } from '../service/stockInsumoStore';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import type { ArticuloInsumo } from '../../../types/Articulo';
import CompraIngredientesModal from '../../HU24_CompraIngredientes/components/CompraIngredientesModal';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';

const PORCENTAJE_CRITICO = 0.5; // 50% del mínimo - stock crítico
const PORCENTAJE_BAJO = 1.0; // 100% del mínimo - stock bajo
const PORCENTAJE_AVISO = 1.2; // 120% del mínimo - cerca del mínimo

const getDiferencia = (insumo: ArticuloInsumo) =>
  (insumo.stockActual ?? 0) - (insumo.stockMinimo ?? 0);

const getEstadoStock = (insumo: ArticuloInsumo) => {
  const stockActual = insumo.stockActual ?? 0;
  const stockMinimo = insumo.stockMinimo ?? 0;

  if (stockActual <= stockMinimo * PORCENTAJE_CRITICO) {
    return 'critico';
  } else if (stockActual <= stockMinimo * PORCENTAJE_BAJO) {
    return 'bajo';
  } else if (stockActual <= stockMinimo * PORCENTAJE_AVISO) {
    return 'cerca';
  }
  return 'normal';
};

const getColorPorEstado = (estado: string) => {
  switch (estado) {
    case 'critico':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'bajo':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    case 'cerca':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-green-100 text-green-800 border-green-300';
  }
};

export const ScreenStockInsumos = () => {
  const { insumos, loading, error, fetchInsumos } = useStockInsumoStore();
  const [openCompraModal, setOpenCompraModal] = useState(false);

  // Filtrar insumos bajos o cerca del mínimo
  const insumosFiltrados = insumos.filter((i) => i.stockActual < i.stockMinimo * PORCENTAJE_AVISO);

  // Contar insumos por estado
  const insumosCriticos = insumosFiltrados.filter((i) => getEstadoStock(i) === 'critico').length;
  const insumosLow = insumosFiltrados.filter((i) => getEstadoStock(i) === 'bajo').length;
  const insumosCerca = insumosFiltrados.filter((i) => getEstadoStock(i) === 'cerca').length;

  const handleRegistrarCompra = () => {
    setOpenCompraModal(true);
  };

  const COLUMNS = [
    {
      label: 'Denominación',
      key: 'denominacion',
      render: (i: ArticuloInsumo) => (
        <div
          className={`font-medium ${getEstadoStock(i) === 'critico' ? 'text-red-600' : getEstadoStock(i) === 'bajo' ? 'text-orange-600' : ''}`}
        >
          {i.denominacion}
        </div>
      ),
    },
    {
      label: 'Unidad de Medida',
      key: 'unidadMedida',
      render: (i: ArticuloInsumo) => i.unidadMedida?.denominacion,
    },
    {
      label: 'Stock Mínimo',
      key: 'stockMinimo',
      render: (i: ArticuloInsumo) => (
        <span className="font-medium">
          {i.esParaElaborar ? (i.stockMinimo ?? 0).toFixed(2) : Math.floor(i.stockMinimo ?? 0)}
        </span>
      ),
    },
    {
      label: 'Stock Actual',
      key: 'stockActual',
      render: (i: ArticuloInsumo) => {
        const estado = getEstadoStock(i);
        const colorClases = getColorPorEstado(estado);
        return (
          <span className={`px-2 py-1 rounded-full text-sm font-medium border ${colorClases}`}>
            {i.esParaElaborar ? (i.stockActual ?? 0).toFixed(2) : Math.floor(i.stockActual ?? 0)}
          </span>
        );
      },
    },
    {
      label: 'Estado',
      key: 'estado',
      render: (i: ArticuloInsumo) => {
        const estado = getEstadoStock(i);
        const estadoTexto = {
          critico: '🔴 Crítico',
          bajo: '🟠 Bajo',
          cerca: '🟡 Cerca del mínimo',
          normal: '🟢 Normal',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getColorPorEstado(estado)}`}>
            {estadoTexto[estado as keyof typeof estadoTexto]}
          </span>
        );
      },
    },
    {
      label: 'Diferencia',
      key: 'diferencia',
      render: (i: ArticuloInsumo) => {
        const diferencia = getDiferencia(i);
        const esNegativo = diferencia < 0;
        return (
          <span className={`font-medium ${esNegativo ? 'text-red-600' : 'text-green-600'}`}>
            {esNegativo ? '' : '+'}
            {diferencia > 0 ? diferencia.toFixed(2) : diferencia}
          </span>
        );
      },
    },
  ];

  // Funciones dummy requeridas por TableGeneric
  const handleDelete = () => {};
  const setOpenModal = () => {};
  const setSelectedItem = () => {};
  return (
    <div className="container mx-auto p-4">
      {/* Header con título y botón principal */}
      <div className="flex w-full justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Control de Stock de Insumos</h1>
        <button
          className={`flex gap-2 px-6 py-3 rounded-lg font-bold text-white transition-colors ${
            insumosFiltrados.length > 0
              ? 'bg-primary hover:bg-primarydark shadow-lg'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
          onClick={handleRegistrarCompra}
          disabled={insumosFiltrados.length === 0}
          title={
            insumosFiltrados.length === 0
              ? 'No hay insumos que requieran reposición'
              : 'Realizar compra de insumos con stock bajo'
          }
        >
          <IconoAgregar /> Realizar Compra ({insumosFiltrados.length})
        </button>
      </div>

      {/* Dashboard de resumen */}
      {insumosFiltrados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔴</span>
              <div>
                <p className="text-red-800 font-bold text-lg">{insumosCriticos}</p>
                <p className="text-red-600 text-sm">Stock Crítico</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🟠</span>
              <div>
                <p className="text-orange-800 font-bold text-lg">{insumosLow}</p>
                <p className="text-orange-600 text-sm">Stock Bajo</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🟡</span>
              <div>
                <p className="text-yellow-800 font-bold text-lg">{insumosCerca}</p>
                <p className="text-yellow-600 text-sm">Cerca del Mínimo</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje cuando no hay insumos que requieran atención */}
      {insumosFiltrados.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center mb-6">
          <span className="text-4xl mb-4 block">✅</span>
          <h3 className="text-green-800 font-bold text-xl mb-2">¡Excelente!</h3>
          <p className="text-green-700">Todos los insumos tienen stock suficiente.</p>
        </div>
      )}

      {/* Tabla de insumos */}
      <TableGeneric
        columns={COLUMNS}
        rows={insumosFiltrados}
        showSearchBar={true}
        searchPlaceholder="Buscar insumos con stock bajo..."
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedItem}
      />

      {/* Modal de compra con insumos preseleccionados */}
      <CompraIngredientesModal
        open={openCompraModal}
        onClose={() => setOpenCompraModal(false)}
        onCompraRegistrada={() => {
          setOpenCompraModal(false);
          fetchInsumos();
        }}
        insumosPreseleccionados={insumosFiltrados}
      />

      {loading && <div className="mt-4">Cargando insumos...</div>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default ScreenStockInsumos;

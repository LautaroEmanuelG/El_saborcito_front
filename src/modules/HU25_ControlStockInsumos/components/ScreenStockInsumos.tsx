import { useState } from 'react';
import { useStockInsumoStore } from '../service/stockInsumoStore';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import type { ArticuloInsumo } from '../../../types/Articulo';
import CompraIngredientesModal from '../../HU24_CompraIngredientes/components/CompraIngredientesModal';

const PORCENTAJE_AVISO = 1.2; // 20% por encima del mínimo

const getDiferencia = (insumo: ArticuloInsumo) =>
  (insumo.stockActual ?? 0) - (insumo.stockMinimo ?? 0);

export const ScreenStockInsumos = () => {
  const { insumos, loading, error, fetchInsumos } = useStockInsumoStore();
  const [openCompraModal, setOpenCompraModal] = useState(false);

  // Filtrar insumos bajos o cerca del mínimo
  const insumosFiltrados = insumos.filter((i) => i.stockActual < i.stockMinimo * PORCENTAJE_AVISO);
  const handleRegistrarCompra = () => {
    setOpenCompraModal(true);
  };

  const COLUMNS = [
    { label: 'Denominación', key: 'denominacion' },
    {
      label: 'Unidad de Medida',
      key: 'unidadMedida',
      render: (i: ArticuloInsumo) => i.unidadMedida?.denominacion,
    },
    { label: 'Stock Mínimo', key: 'stockMinimo' },
    { label: 'Stock Actual', key: 'stockActual' },
    {
      label: 'Diferencia',
      key: 'diferencia',
      render: (i: ArticuloInsumo) => getDiferencia(i),
    },
    {
      label: 'Acciones',
      key: 'acciones',
      render: () => (
        <button
          className="bg-primary hover:bg-primarydark text-white px-3 py-1 rounded shadow"
          onClick={() => handleRegistrarCompra()}
        >
          Registrar Compra
        </button>
      ),
    },
  ];

  // Funciones dummy requeridas por TableGeneric
  const handleDelete = () => {};
  const setOpenModal = () => {};
  const setSelectedItem = () => {};

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Control de Stock de Insumos</h2>
      <TableGeneric
        columns={COLUMNS}
        rows={insumosFiltrados}
        showSearchBar={true}
        searchPlaceholder="Buscar insumos..."
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedItem}
      />
      <CompraIngredientesModal
        open={openCompraModal}
        onClose={() => setOpenCompraModal(false)}
        onCompraRegistrada={() => {
          setOpenCompraModal(false);
          fetchInsumos();
        }}
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

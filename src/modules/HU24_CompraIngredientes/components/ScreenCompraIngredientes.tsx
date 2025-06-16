// src/modules/HU24_CompraIngredientes/components/ScreenCompraIngredientes.tsx

import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { useCompraInsumoStore } from '../services/compraInsumoStore';
import { COMPRA_INSUMO_COLUMNS, CompraInsumoDTO } from '../model';
import CompraIngredientesModal from './CompraIngredientesModal';

const ScreenCompraIngredientes = () => {
  const { compras, loading, error, fetchCompras } = useCompraInsumoStore();
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchCompras();
  }, [fetchCompras]);

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  /**
   * Cuando el modal devuelve la compra creada,
   * simplemente recargo el listado desde el store y cierro el modal
   */
  const handleCompraRegistrada = (compra: CompraInsumoDTO) => {
    fetchCompras();
    setOpenModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full justify-end items-center mb-6">
        <button
          className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleOpenModal}
        >
          Realizar Compra
        </button>
      </div>

      <TableGeneric
        columns={COMPRA_INSUMO_COLUMNS}
        rows={compras}
        showSearchBar={true}
        searchPlaceholder="Buscar compras por insumo o fecha..."
      />

      <CompraIngredientesModal
        open={openModal}
        onClose={handleCloseModal}
        onCompraRegistrada={handleCompraRegistrada}
      />

      {loading && <div className="mt-4">Cargando compras...</div>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default ScreenCompraIngredientes;

// src/modules/HU24_CompraIngredientes/components/ScreenCompraIngredientes.tsx

import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { useCompraInsumoStore } from '../services/compraInsumoStore';
import { COMPRA_INSUMO_COLUMNS, CompraInsumoDTO } from '../model';
import CompraIngredientesModal from './CompraIngredientesModal';
import ModalDetalleCompra from './ModalDetalleCompra';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';

const ScreenCompraIngredientes = () => {
  const { compras, loading, error, fetchCompras } = useCompraInsumoStore();
  const [openModal, setOpenModal] = useState(false);
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-01-01'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [filteredCompras, setFilteredCompras] = useState<CompraInsumoDTO[]>([]);
  const [detalleCompra, setDetalleCompra] = useState<CompraInsumoDTO | null>(null);
  const [openDetalle, setOpenDetalle] = useState(false);

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
  const handleCompraRegistrada = (compra: CompraInsumoDTO) => {
    fetchCompras();
    setOpenModal(false);
  };

  // Handler para ver detalle
  const handleView = (compra: CompraInsumoDTO) => {
    setDetalleCompra(compra);
    setOpenDetalle(true);
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
      <div className="flex w-full justify-between items-center mb-6 flex-wrap gap-4">
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
        <button
          className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleOpenModal}
        >
          Realizar Compra
        </button>
      </div>
      <div className="flex justify-start mb-4">
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
      />

      <ModalDetalleCompra
        open={openDetalle}
        onClose={() => setOpenDetalle(false)}
        compra={detalleCompra}
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

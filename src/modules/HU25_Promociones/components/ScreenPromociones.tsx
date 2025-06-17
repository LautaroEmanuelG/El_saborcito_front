import { useEffect, useState } from 'react';
import { usePromocionStore } from '../services/promocionesStore';
import { PROMOCION_COLUMNS } from '../model';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import ModalPromocionesForm from './ModalPromocionesForm';
import type { Promocion } from '../../../types/Promocion';

// Calcula el descuento real basado en los artículos y el precio promocional
function calcularDescuento(promocion: Promocion): string {
  if (!promocion.promocionDetalles || promocion.promocionDetalles.length === 0) return '-';
  const sumaArticulos = promocion.promocionDetalles.reduce((acc, d) => {
    const precio = d.articulo?.precioVenta ?? 0;
    return acc + precio * (d.cantidadRequerida || 1);
  }, 0);
  if (!sumaArticulos || !promocion.precioPromocional) return '-';
  const descuento = 100 - (promocion.precioPromocional / sumaArticulos) * 100;
  return descuento > 0 ? descuento.toFixed(0) + '%' : '0%';
}

const getInitialValues = (): Partial<Promocion> => ({
  denominacion: '',
  precioPromocional: undefined,
  descuento: undefined,
  fechaDesde: '',
  fechaHasta: '',
  horaDesde: '',
  horaHasta: '',
});

const ScreenPromociones = () => {
  const {
    promociones,
    deletedPromociones,
    loading,
    error,
    showDeleted,
    fetchPromociones,
    fetchDeletedPromociones,
    addPromocion,
    updatePromocion,
    deletePromocion,
    restorePromocion,
    toggleShowDeleted,
  } = usePromocionStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedPromocion, setSelectedPromocion] = useState<Partial<Promocion> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    fetchPromociones();
  }, [fetchPromociones]);

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedPromociones();
    }
  }, [showDeleted, fetchDeletedPromociones]);

  // Transformar los datos para mostrar en la tabla
  let currentPromociones: Promocion[] = [];
  if (showDeleted) {
    // Mostrar activos primero y luego eliminados (sin duplicados)
    const activos = promociones.filter((a) => !deletedPromociones.some((d) => d.id === a.id));
    currentPromociones = [...activos, ...deletedPromociones];
  } else {
    currentPromociones = promociones;
  }

  const handleAdd = () => {
    setSelectedPromocion(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (promocion: Promocion) => {
    setSelectedPromocion(promocion);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (promocion: Promocion) => {
    setSelectedPromocion(promocion);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deletePromocion(id);
  };

  const handleRestore = (id: number) => {
    restorePromocion(id);
  };
  const handleSubmit = (values: Partial<Promocion>, imageFile?: File) => {
    if (modalMode === 'add') {
      addPromocion(values, imageFile);
    } else if (modalMode === 'edit') {
      // Lógica de soft delete/restaurar
      if (
        typeof values.id === 'number' &&
        selectedPromocion &&
        selectedPromocion.eliminado !== values.eliminado
      ) {
        if (values.eliminado) {
          // Se deshabilitó → eliminar lógicamente
          deletePromocion(values.id);
        } else {
          // Se habilitó → restaurar
          restorePromocion(values.id);
        }
      } else {
        updatePromocion(values, imageFile);
      }
    }
    setOpenModal(false);
  };

  const columns = [
    ...PROMOCION_COLUMNS.map((col) =>
      col.field === 'descuento'
        ? {
            label: col.headerName,
            key: col.field,
            render: (row: Promocion) => calcularDescuento(row),
          }
        : {
            label: col.headerName,
            key: col.field,
          }
    ),
    {
      label: 'Acciones',
      key: 'acciones',
      render: (row: Promocion & { eliminado?: boolean }) => {
        // Si estamos mostrando eliminados y la promoción NO está eliminada, solo mostrar el botón de ver
        // (Misma lógica que en ScreenArticulosManufacturados)
        const soloVer = showDeleted && !row.eliminado;
        return (
          <ButtonsTable
            el={row}
            handleDelete={handleDelete}
            setOpenModal={setOpenModal}
            setSelectedItem={setSelectedPromocion}
            handleRestore={handleRestore}
            onView={handleView}
            onEdit={handleEdit}
            soloVer={soloVer}
          />
        );
      },
    },
  ];
  return (
    <div className="container w-full mx-auto p-4">
      <div className="flex w-full justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Promociones</h1>
        <button
          className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar promociones en vista con eliminadas'
              : 'Agregar nueva promoción'
          }
        >
          Agregar Promoción
        </button>
      </div>

      <TableGeneric
        columns={columns}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedPromocion}
        rows={currentPromociones}
        showSearchBar={true}
        searchPlaceholder="Buscar promociones por denominación..."
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
      />

      <ModalPromocionesForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedPromocion ?? getInitialValues()}
        onSubmit={handleSubmit}
        mode={modalMode}
      />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">🔄 Cargando...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default ScreenPromociones;

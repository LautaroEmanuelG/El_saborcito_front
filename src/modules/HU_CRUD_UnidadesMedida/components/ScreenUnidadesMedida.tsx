import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import ModalUnidadMedidaForm from './ModalUnidadMedidaForm';
import { useUnidadMedidaStore } from '../services/unidadMedidaStore';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';

const getInitialValues = (): Partial<UnidadMedida> => ({
  denominacion: '',
});

export const ScreenUnidadesMedida = () => {
  const {
    unidades,
    deletedUnidades,
    loading,
    error,
    showDeleted,
    fetchUnidades,
    addUnidad,
    updateUnidad,
    deleteUnidad,
    restoreUnidad,
    toggleShowDeleted,
    clearError,
  } = useUnidadMedidaStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<Partial<UnidadMedida> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  let currentUnidades: UnidadMedida[] = [];
  if (showDeleted) {
    const activos = unidades.filter((u) => !deletedUnidades.some((d) => d.id === u.id));
    currentUnidades = [...activos, ...deletedUnidades];
  } else {
    currentUnidades = unidades;
  }
  const handleAdd = () => {
    clearError(); // Limpiar errores previos
    setSelectedUnidad(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (unidad: any) => {
    clearError(); // Limpiar errores previos
    setSelectedUnidad(unidad);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (unidad: any) => {
    clearError(); // Limpiar errores previos
    setSelectedUnidad(unidad);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deleteUnidad(id);
  };

  const handleRestore = (id: number) => {
    restoreUnidad(id);
  };
  const UNIDAD_COLUMNS = [
    { label: 'ID', key: 'id' },
    { label: 'Denominación', key: 'denominacion' },
    {
      label: 'Acciones',
      key: 'acciones',
      render: (row: any) => {
        const soloVer = showDeleted && !row.eliminado;
        return (
          <ButtonsTable
            el={row as any}
            handleDelete={handleDelete}
            setOpenModal={setOpenModal}
            setSelectedItem={setSelectedUnidad}
            handleRestore={handleRestore}
            onView={handleView}
            onEdit={handleEdit}
            soloVer={soloVer}
          />
        );
      },
    },
  ];
  const handleSubmit = async (values: Partial<UnidadMedida>) => {
    if (modalMode === 'add') {
      await addUnidad(values);
    } else if (modalMode === 'edit') {
      await updateUnidad(values);
    }

    // Solo cerrar el modal si no hay error
    const { error: currentError } = useUnidadMedidaStore.getState();
    if (!currentError) {
      setOpenModal(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Unidades de Medida</h1>
        <button
          className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar unidades en vista con eliminados'
              : 'Agregar nueva unidad de medida'
          }
        >
          Agregar Unidad de Medida
        </button>
      </div>{' '}
      <TableGeneric
        columns={UNIDAD_COLUMNS}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedUnidad}
        rows={currentUnidades as any}
        showSearchBar={true}
        showCategoryFilter={false}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="Buscar unidades de medida..."
      />
      <ModalUnidadMedidaForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedUnidad ?? getInitialValues()}
        onSubmit={handleSubmit}
        mode={modalMode}
      />
      {loading && <div className="mt-4">Cargando unidades de medida...</div>}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mt-4">
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export default ScreenUnidadesMedida;

import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import { useCategoriaPadreInsumoStore } from '../services/categoriaPadreInsumoStore';
import type { Categoria } from '../../../types/Categoria';
import ModalCategoriaPadreInsumoForm from './ModalCategoriaPadreInsumoForm';
import { CATEGORIA_PADRE_COLUMNS, CategoriaPadreTable } from '../model';

const getInitialValues = (): Partial<Categoria> => ({
  denominacion: '',
  tipoCategoria: null,
});

const ScreenCategoriaPadreInsumo = () => {
  const {
    categoriasPadre,
    deletedCategoriasPadre,
    loading,
    error,
    showDeleted,
    fetchCategoriasPadre,
    fetchDeletedCategoriasPadre,
    toggleShowDeleted,
    addCategoriaPadre,
    updateCategoriaPadre,
    deleteCategoriaPadre,
    restoreCategoriaPadre,
  } = useCategoriaPadreInsumoStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Partial<Categoria> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedCategoriasPadre();
    } else {
      fetchCategoriasPadre();
    }
  }, [showDeleted]);

  // Filtrar: solo categorías padre de tipo INSUMOS
  const categoriasPadreFiltradas = categoriasPadre.filter(
    (cat: Categoria) => !cat.tipoCategoria && cat.tipo === 'INSUMOS'
  );
  const deletedCategoriasPadreFiltradas = deletedCategoriasPadre.filter(
    (cat: Categoria) => !cat.tipoCategoria && cat.tipo === 'INSUMOS'
  );

  let currentCategorias: Categoria[] = showDeleted
    ? [
        ...categoriasPadreFiltradas.filter(
          (a: Categoria) => !deletedCategoriasPadreFiltradas.some((d: Categoria) => d.id === a.id)
        ),
        ...deletedCategoriasPadreFiltradas,
      ]
    : categoriasPadreFiltradas;

  // Solo transformar categorías con id definido
  const transformedCategorias: CategoriaPadreTable[] = currentCategorias
    .filter((cat: Categoria) => typeof cat.id === 'number')
    .map((cat: Categoria) => ({
      id: cat.id as number,
      denominacion: cat.denominacion,
      eliminado: deletedCategoriasPadre.some((d: Categoria) => d.id === cat.id),
      categoriaId: cat.id as number,
    }));

  const handleAdd = () => {
    setSelectedCategoria(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria({
      denominacion: categoria.denominacion,
      id: categoria.id,
      tipoCategoria: categoria.tipoCategoria ?? null,
    });
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCategoriaPadre(id);
  };

  const handleRestore = async (id: number) => {
    await restoreCategoriaPadre(id);
  };

  const handleSubmit = async (values: Partial<Categoria>) => {
    if (modalMode === 'add') {
      await addCategoriaPadre({
        ...values,
        tipoCategoria: null,
        tipo: 'INSUMOS',
      });
    } else if (modalMode === 'edit' && selectedCategoria?.id) {
      await updateCategoriaPadre({
        ...values,
        id: selectedCategoria.id,
        tipoCategoria: null,
        tipo: 'INSUMOS',
      });
    }
    setOpenModal(false);
  };
  return (
    <div className="container w-full mx-auto p-4">
      <div className="flex w-full justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Categorías de Insumos</h1>
        <button
          className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar categorías en vista con eliminados'
              : 'Agregar nueva categoría padre'
          }
        >
          Agregar Categoría
        </button>
      </div>
      <TableGeneric
        columns={[
          ...CATEGORIA_PADRE_COLUMNS,
          {
            label: 'Acciones',
            key: 'acciones',
            render: (row: CategoriaPadreTable) => {
              const el = {
                id: row.id,
                denominacion: row.denominacion,
                eliminado: row.eliminado,
              };
              const soloVer = showDeleted && !row.eliminado;
              return (
                <ButtonsTable
                  el={el}
                  handleDelete={handleDelete}
                  handleRestore={handleRestore}
                  setOpenModal={setOpenModal}
                  setSelectedItem={setSelectedCategoria}
                  onView={(item) => handleView(item as Categoria)}
                  onEdit={(item) => handleEdit(item as Categoria)}
                  soloVer={soloVer}
                />
              );
            },
          },
        ]}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedCategoria}
        rows={transformedCategorias}
        showSearchBar={true}
        showCategoryFilter={false}
        categories={[]}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="Buscar categorías padre por nombre..."
      />
      <ModalCategoriaPadreInsumoForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedCategoria ?? getInitialValues()}
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

export default ScreenCategoriaPadreInsumo;

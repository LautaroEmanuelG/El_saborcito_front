import { useState, useEffect } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import { useSubcategoriaInsumosStore } from '../../HU20_CRUD_SubcategoriasInsumos/services/subcategoriaInsumosStore';
import type { Categoria } from '../../../types/Categoria';
import ModalSubcategoriasInsumosForm from '../../HU20_CRUD_SubcategoriasInsumos/components/ModalSubcategoriasInsumosForm';
import { CATEGORIA_COLUMNS, CategoriaTable } from '../../HU20_CRUD_SubcategoriasInsumos/model';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';

const getInitialValues = (): Partial<Categoria> => ({
  denominacion: '',
  tipoCategoria: null,
});

const SeccionSubcategorias = () => {
  const {
    categorias,
    deletedCategorias,
    loading,
    error,
    showDeleted,
    fetchCategorias,
    fetchDeletedCategorias,
    toggleShowDeleted,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    restoreCategoria,
  } = useSubcategoriaInsumosStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Partial<Categoria> | null>(null);
  const [selectedPadreId, setSelectedPadreId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');

  useEffect(() => {
    if (showDeleted) {
      fetchDeletedCategorias();
    } else {
      fetchCategorias();
    }
  }, [showDeleted]);

  // Preparación de datos
  const categoriasFiltradas = categorias;
  const deletedCategoriasFiltradas = deletedCategorias;

  let currentCategorias: Categoria[] = showDeleted
    ? [
        ...categoriasFiltradas.filter(
          (a) => !deletedCategoriasFiltradas.some((d) => d.id === a.id)
        ),
        ...deletedCategoriasFiltradas,
      ]
    : categoriasFiltradas;

  const categoriasPadre = currentCategorias.filter(
    (cat) => !cat.tipoCategoria && cat.tipo === 'INSUMOS'
  );
  const categoriasHijas = currentCategorias.filter((cat) => cat.tipoCategoria);

  const transformedCategorias: CategoriaTable[] = [];
  categoriasPadre.forEach((padre) => {
    const hijas = categoriasHijas.filter((hija) => hija.tipoCategoria?.id === padre.id);
    const padreEliminado = deletedCategorias.some((d) => d.id === padre.id);

    // Solo mostrar las subcategorías que realmente existen
    hijas.forEach((hija) => {
      const hijaEliminada = deletedCategorias.some((d) => d.id === hija.id);
      transformedCategorias.push({
        id: hija.id!,
        denominacion: padre.denominacion,
        subcategoria: hija.denominacion,
        eliminado: hijaEliminada || padreEliminado,
        categoriaId: padre.id,
      });
    });
  });

  // Handlers
  const handleAdd = () => {
    setSelectedCategoria(getInitialValues());
    setSelectedPadreId(null);
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setSelectedPadreId(categoria.tipoCategoria?.id ?? null);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria({
      denominacion: categoria.denominacion,
      id: categoria.id,
      tipoCategoria: categoria.tipoCategoria ?? null,
    });
    setSelectedPadreId(categoria.tipoCategoria?.id ?? null);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = async (id: number) => {
    await deleteCategoria(id);
  };

  const handleRestore = async (id: number) => {
    await restoreCategoria(id);
  };

  const handleSubmit = async (values: Partial<Categoria>) => {
    if (modalMode === 'add') {
      if (selectedPadreId) {
        await addCategoria({
          ...values,
          tipoCategoria: categorias.find((c) => c.id === selectedPadreId) ?? null,
        });
      }
    } else if (modalMode === 'edit' && selectedCategoria?.id) {
      await updateCategoria({
        ...values,
        id: selectedCategoria.id,
        tipoCategoria: categorias.find((c) => c.id === selectedPadreId) ?? null,
      });
    }
    setOpenModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex w-full justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Subcategorías de Insumos
        </h2>
        <button
          className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 flex gap-2"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar subcategorías en vista con eliminados'
              : 'Agregar nueva subcategoría'
          }
        >
          <IconoAgregar /> Agregar Subcategoría
        </button>
      </div>

      <TableGeneric
        columns={[
          ...CATEGORIA_COLUMNS,
          {
            label: 'Acciones',
            key: 'acciones',
            render: (row: CategoriaTable) => {
              const subcategoriaReal = categoriasFiltradas.find((c) => c.id === row.id);
              const subcategoriaEliminada = deletedCategoriasFiltradas.find((c) => c.id === row.id);
              const categoria = subcategoriaReal || subcategoriaEliminada;

              if (categoria) {
                const el = {
                  id: categoria.id!,
                  denominacion: categoria.denominacion,
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
              }
              return null;
            },
          },
        ]}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedCategoria}
        rows={transformedCategorias}
        showSearchBar={true}
        showCategoryFilter={true}
        categories={categoriasPadre.map((c) => ({ id: c.id!, denominacion: c.denominacion }))}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="🔍 Buscar subcategorías por nombre..."
      />

      <ModalSubcategoriasInsumosForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedCategoria ?? getInitialValues()}
        onSubmit={handleSubmit}
        categorias={categorias}
        selectedPadreId={selectedPadreId}
        setSelectedPadreId={setSelectedPadreId}
        mode={modalMode}
      />

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">🔄 Cargando subcategorías...</span>
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

export default SeccionSubcategorias;

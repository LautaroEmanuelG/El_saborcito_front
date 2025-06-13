import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import { useSubcategoriaInsumosStore } from '../services/subcategoriaInsumosStore';
import type { Categoria } from '../../../types/Categoria';
import ModalSubcategoriasInsumosForm from './ModalSubcategoriasInsumosForm';
import { CATEGORIA_COLUMNS, CategoriaTable } from '../model';

const getInitialValues = (): Partial<Categoria> => ({
  denominacion: '',
  tipoCategoria: null,
});

const ScreenSubcategoriasInsumos = () => {
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

  const categoriasFiltradas = categorias.filter(
    (cat) => !['insumo', 'insumos'].includes(cat.denominacion.trim().toLowerCase())
  );
  const deletedCategoriasFiltradas = deletedCategorias.filter(
    (cat) => !['insumo', 'insumos'].includes(cat.denominacion.trim().toLowerCase())
  );

  let currentCategorias: Categoria[] = showDeleted
    ? [
        ...categoriasFiltradas.filter(
          (a) => !deletedCategoriasFiltradas.some((d) => d.id === a.id)
        ),
        ...deletedCategoriasFiltradas,
      ]
    : categoriasFiltradas;

  // Agrupar: por cada categoría padre Insumos y Bebidas, mostrar una fila por cada hija (subcategoría), tanto activas como eliminadas
  const categoriasPadre = categorias.filter(
    (cat) =>
      !cat.tipoCategoria && ['insumos', 'bebidas'].includes(cat.denominacion.trim().toLowerCase())
  );
  // Hijas activas y eliminadas
  const hijasTodas = [
    ...categorias.filter((cat) => cat.tipoCategoria),
    ...deletedCategorias.filter((cat) => cat.tipoCategoria),
  ];

  const transformedCategorias: CategoriaTable[] = [];
  categoriasPadre.forEach((padre) => {
    const hijas = hijasTodas.filter((hija) => hija.tipoCategoria?.id === padre.id);
    if (hijas.length === 0) {
      // Si no tiene hijas, mostrar solo la fila del padre
      transformedCategorias.push({
        id: padre.id!,
        denominacion: padre.denominacion,
        subcategoria: '-',
        eliminado: deletedCategorias.some((d) => d.id === padre.id),
        categoriaId: padre.id,
      });
    } else {
      // Por cada hija, mostrar una fila con el padre y la hija
      hijas.forEach((hija) => {
        transformedCategorias.push({
          id: hija.id!,
          denominacion: padre.denominacion,
          subcategoria: hija.denominacion,
          eliminado: deletedCategorias.some((d) => d.id === hija.id),
          categoriaId: padre.id,
        });
      });
    }
  });

  const handleAddSub = () => {
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
    <div className="container w-full mx-auto p-4">
      <div className="flex w-full justify-end items-center mb-6">
        <button
          className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAddSub}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar subcategorías en vista con eliminados'
              : 'Agregar nueva subcategoría'
          }
        >
          Agregar Subcategoría
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
              const el =
                subcategoriaReal && typeof subcategoriaReal.id === 'number'
                  ? {
                      ...subcategoriaReal,
                      id: subcategoriaReal.id!,
                      denominacion: subcategoriaReal.denominacion || '',
                    }
                  : {
                      id: row.id,
                      denominacion:
                        row.subcategoria !== '-' ? row.subcategoria || '' : row.denominacion || '',
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
        showCategoryFilter={true}
        // Solo categorías padre Insumos y Bebidas en el filtro
        categories={categoriasPadre.map((c) => ({ id: c.id!, denominacion: c.denominacion }))}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="Buscar categorías por nombre..."
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

export default ScreenSubcategoriasInsumos;

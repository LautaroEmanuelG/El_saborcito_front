import { useEffect, useState } from 'react';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import ModalInsumoForm from './ModalInsumoForm';
import { useInsumoStore } from '../services/insumoStore';
import * as categoriaService from '../../../shared/services/categoriaService';
import * as unidadMedidaService from '../../../shared/services/unidadMedidaService';
import type { ArticuloInsumo } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';

const getInitialValues = (): Partial<ArticuloInsumo> => ({
  denominacion: '',
  precioCompra: 0,
  stockActual: 0,
  stockMinimo: 0,
  categoria: undefined,
  unidadMedida: undefined,
  esParaElaborar: false,
});

export const ScreenInsumos = () => {
  const {
    insumos,
    deletedInsumos,
    loading,
    error,
    showDeleted,
    fetchInsumos,
    fetchDeletedInsumos,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    restoreInsumo,
    toggleShowDeleted,
  } = useInsumoStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedInsumo, setSelectedInsumo] = useState<Partial<ArticuloInsumo> | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [unidades, setUnidades] = useState<UnidadMedida[]>([]);

  useEffect(() => {
    fetchInsumos();
    categoriaService.getAllCategorias().then(setCategorias);
    unidadMedidaService.getAllUnidadMedidas().then(setUnidades);
  }, [fetchInsumos]);

  let currentInsumos: ArticuloInsumo[] = [];
  if (showDeleted) {
    const activos = insumos.filter((a) => !deletedInsumos.some((d) => d.id === a.id));
    currentInsumos = [...activos, ...deletedInsumos];
  } else {
    currentInsumos = insumos;
  }

  const handleAdd = () => {
    setSelectedInsumo(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (insumo: ArticuloInsumo) => {
    setSelectedInsumo(insumo);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (insumo: ArticuloInsumo) => {
    setSelectedInsumo(insumo);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deleteInsumo(id);
  };

  const handleRestore = (id: number) => {
    restoreInsumo(id);
  };

  // Filtrar solo las categorías padre de tipo INSUMOS
  const categoriasPadre = categorias.filter((cat) => !cat.tipoCategoria && cat.tipo === 'INSUMOS');

  // Para el filtro de la tabla y el modal, solo usar categoriasPadre

  // En la tabla, mostrar solo la categoría padre
  const getCategoriaPadre = (cat?: Categoria): Categoria | undefined => {
    if (!cat) return undefined;
    return cat.tipoCategoria ? getCategoriaPadre(cat.tipoCategoria) : cat;
  };

  // --- Filtro personalizado para incluir subcategorías al filtrar por categoría padre ---
  // Recibe el id de la categoría padre seleccionada y retorna true si el insumo pertenece a esa categoría o a una subcategoría
  const perteneceACategoriaPadre = (insumo: ArticuloInsumo, categoriaPadreId: number): boolean => {
    let cat: Categoria | null | undefined = insumo.categoria;
    while (cat) {
      if (cat.id === categoriaPadreId) return true;
      cat = cat.tipoCategoria;
    }
    return false;
  };

  const INSUMO_COLUMNS = [
    { label: 'Denominación', key: 'denominacion' },
    { label: 'Precio Compra', key: 'precioCompra' },
    { label: 'Precio Venta', key: 'precioVenta' },
    { label: 'Stock Actual', key: 'stockActual' },
    { label: 'Stock Mínimo', key: 'stockMinimo' },
    {
      label: 'Unidad de Medida',
      key: 'unidadMedida',
      render: (i: ArticuloInsumo) => i.unidadMedida?.denominacion,
    },
    {
      label: 'Categoría',
      key: 'categoria',
      render: (i: ArticuloInsumo) => getCategoriaPadre(i.categoria)?.denominacion,
    },
    {
      label: 'Subcategoría',
      key: 'subcategoria',
      render: (i: ArticuloInsumo) => {
        // Si la categoría tiene tipoCategoria, es subcategoría
        if (i.categoria && i.categoria.tipoCategoria) {
          return i.categoria.denominacion;
        }
        return '-';
      },
    },
    {
      label: 'Acciones',
      key: 'acciones',
      render: (row: ArticuloInsumo & { eliminado?: boolean }) => {
        const soloVer = showDeleted && !row.eliminado;
        return (
          <ButtonsTable
            el={row}
            handleDelete={handleDelete}
            setOpenModal={setOpenModal}
            setSelectedItem={setSelectedInsumo}
            handleRestore={handleRestore}
            onView={handleView}
            onEdit={handleEdit}
            soloVer={soloVer}
          />
        );
      },
    },
  ];

  const handleSubmit = (values: Partial<ArticuloInsumo>) => {
    if (modalMode === 'add') {
      addInsumo(values);
    } else if (modalMode === 'edit') {
      updateInsumo(values);
    }
    setOpenModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex w-full justify-end items-center mb-6">
        <button
          className="bg-primary hover:bg-primarydark text-blanco font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar insumos en vista con eliminados'
              : 'Agregar nuevo insumo'
          }
        >
          Agregar Insumo
        </button>
      </div>
      <TableGeneric
        columns={INSUMO_COLUMNS}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedInsumo}
        rows={currentInsumos}
        showSearchBar={true}
        showCategoryFilter={true}
        categories={categoriasPadre}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="Buscar insumos por nombre..."
        customCategoryFilter={perteneceACategoriaPadre}
      />
      <ModalInsumoForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedInsumo ?? getInitialValues()}
        onSubmit={handleSubmit}
        mode={modalMode}
        categorias={categorias}
        unidades={unidades}
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

export default ScreenInsumos;

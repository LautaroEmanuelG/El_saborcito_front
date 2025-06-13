import { useEffect, useState } from 'react';
import { useArticuloManufacturadoStore } from '../services/articuloManufacturadoStore';
import { ARTICULO_COLUMNS } from '../model';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import { ButtonsTable } from '../../../shared/components/abmGenerica/components/ButtonsTable/ButtonsTable';
import ModalArticuloManufacturadoForm from './ModalArticuloManufacturadoForm';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import * as categoriaService from '../../../shared/services/categoriaService';

const getInitialValues = (): Partial<ArticuloManufacturado> => ({
  denominacion: '',
  precioVenta: 0,
  descripcion: '',
  tiempoEstimadoMinutos: 0,
  categoriaId: 0,
  articuloManufacturadoDetalles: [],
});

const ScreenArticulosManufacturados = () => {
  const {
    articulos,
    deletedArticulos,
    loading,
    error,
    showDeleted,
    fetchArticulos,
    addArticulo,
    updateArticulo,
    deleteArticulo,
    restoreArticulo,
    toggleShowDeleted,
  } = useArticuloManufacturadoStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState<Partial<ArticuloManufacturado> | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetchArticulos();
    if (showDeleted) {
      // Cargar categorías activas y eliminadas
      Promise.all([
        categoriaService.getAllCategorias(),
        categoriaService.getDeletedCategorias(),
      ]).then(([activas, eliminadas]) => {
        // Unir ambas listas, evitando duplicados por id
        const todas = [
          ...activas,
          ...eliminadas.filter((e: Categoria) => !activas.some((a: Categoria) => a.id === e.id)),
        ];
        setCategorias(todas);
      });
    } else {
      categoriaService.getAllCategorias().then(setCategorias);
    }
  }, [fetchArticulos, showDeleted]);

  // Función para obtener información de categoría y subcategoría
  const getCategoryInfo = (categoriaId: number): { categoria: string; subcategoria: string } => {
    const categoria = categorias.find((cat) => cat.id === categoriaId);

    if (!categoria) {
      return { categoria: 'Sin categoría', subcategoria: '-' };
    }

    // Si tipoCategoria es null, es una categoría padre
    if (categoria.tipoCategoria === null) {
      return { categoria: categoria.denominacion, subcategoria: '-' };
    }

    // Si tipoCategoria tiene valor, es una subcategoría
    const categoriaPadre = categorias.find((cat) => cat.id === categoria.tipoCategoria?.id);
    return {
      categoria: categoriaPadre?.denominacion ?? 'Sin categoría padre',
      subcategoria: categoria.denominacion,
    };
  };

  // Transformar los datos para mostrar en la tabla
  let currentArticulos: ArticuloManufacturado[] = [];
  if (showDeleted) {
    // Mostrar activos primero y luego eliminados (sin duplicados)
    const activos = articulos.filter((a) => !deletedArticulos.some((d) => d.id === a.id));
    currentArticulos = [...activos, ...deletedArticulos];
  } else {
    currentArticulos = articulos;
  }
  const transformedArticulos = currentArticulos.map((articulo) => {
    const { categoria, subcategoria } = getCategoryInfo(articulo.categoriaId);
    return {
      ...articulo,
      categoria,
      subcategoria,
    };
  }) as Array<ArticuloManufacturado & { categoria: string; subcategoria: string }>;

  const handleAdd = () => {
    setSelectedArticulo(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleView = (articulo: ArticuloManufacturado) => {
    setSelectedArticulo(articulo);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleEdit = (articulo: ArticuloManufacturado) => {
    setSelectedArticulo(articulo);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deleteArticulo(id);
  };

  const handleRestore = (id: number) => {
    restoreArticulo(id);
  };

  const handleSubmit = (values: Partial<ArticuloManufacturado>) => {
    if (modalMode === 'add') {
      addArticulo(values);
    } else if (modalMode === 'edit') {
      // Lógica de soft delete/restaurar
      if (
        typeof values.id === 'number' &&
        selectedArticulo &&
        selectedArticulo.eliminado !== values.eliminado
      ) {
        if (values.eliminado) {
          // Se deshabilitó → eliminar lógicamente
          deleteArticulo(values.id);
        } else {
          // Se habilitó → restaurar
          restoreArticulo(values.id);
        }
      } else {
        updateArticulo(values);
      }
    }
    setOpenModal(false);
  };

  // Adaptar columnas para incluir acciones y cumplir con la interfaz de TableGeneric
  const columns = [
    ...ARTICULO_COLUMNS.map((col) => ({
      label: col.headerName,
      key: col.field,
    })),
    {
      label: 'Acciones',
      key: 'acciones',
      render: (row: ArticuloManufacturado & { eliminado?: boolean }) => {
        // Si estamos mostrando eliminados y el producto no está eliminado, solo mostrar el botón de ver
        const soloVer = showDeleted && !row.eliminado;
        return (
          <ButtonsTable
            el={row}
            handleDelete={handleDelete}
            setOpenModal={setOpenModal}
            setSelectedItem={setSelectedArticulo}
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
      <div className="flex w-full justify-end items-center mb-6">
        <button
          className="bg-primary hover:bg-primarydark text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          onClick={handleAdd}
          disabled={showDeleted}
          title={
            showDeleted
              ? 'No se pueden agregar artículos en vista con eliminados'
              : 'Agregar nuevo artículo'
          }
        >
          Agregar Artículo
        </button>
      </div>

      <TableGeneric
        columns={columns}
        handleDelete={handleDelete}
        setOpenModal={setOpenModal}
        setSelectedItem={setSelectedArticulo}
        rows={transformedArticulos}
        showSearchBar={true}
        showCategoryFilter={true}
        categories={categorias.filter((c) => !c.tipoCategoria)}
        onToggleDeleted={toggleShowDeleted}
        showDeleted={showDeleted}
        searchPlaceholder="Buscar artículos por nombre..."
      />

      <ModalArticuloManufacturadoForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedArticulo ?? getInitialValues()}
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

export default ScreenArticulosManufacturados;

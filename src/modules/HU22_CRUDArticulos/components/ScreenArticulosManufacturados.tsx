import { useEffect, useState } from 'react';
import { useArticuloManufacturadoStore } from '../services/articuloManufacturadoStore';
import { ARTICULO_COLUMNS } from '../model';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
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
  const { articulos, loading, error, fetchArticulos, addArticulo, updateArticulo, deleteArticulo } =
    useArticuloManufacturadoStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState<Partial<ArticuloManufacturado> | null>(
    null
  );
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add');
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    fetchArticulos();
    categoriaService.getAllCategorias().then(setCategorias);
  }, [fetchArticulos]);

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
  const transformedArticulos = articulos.map((articulo) => {
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

  const handleEdit = (item: ArticuloManufacturado) => {
    setSelectedArticulo(item);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleView = (item: ArticuloManufacturado) => {
    setSelectedArticulo(item);
    setModalMode('view');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deleteArticulo(id);
  };

  const handleSubmit = (values: Partial<ArticuloManufacturado>) => {
    if (modalMode === 'add') {
      addArticulo(values);
    } else if (modalMode === 'edit') {
      updateArticulo(values);
    }
    // En modo 'view' no se hace nada, solo se cierra el modal
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
      render: (row: ArticuloManufacturado) => (
        <div className="flex gap-2 justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleView(row)}
            title="Ver artículo"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleEdit(row)}
            title="Editar artículo"
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleDelete(row.id)}
            title="Eliminar artículo"
          >
            <span className="material-symbols-outlined">delete_forever</span>
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🛠️ Artículos Manufacturados
      </h2>
      <div className="flex justify-end mb-2">
        <button
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleAdd}
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
      />
      <ModalArticuloManufacturadoForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        initialValues={selectedArticulo ?? getInitialValues()}
        onSubmit={handleSubmit}
        mode={modalMode}
      />
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ScreenArticulosManufacturados;

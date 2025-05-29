import React, { useEffect, useState } from 'react';
import { useArticuloManufacturadoStore } from '../services/articuloManufacturadoStore';
import { ARTICULO_COLUMNS, ARTICULO_FIELDS } from '../model';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';
import ModalForm from '../../../shared/components/abmGenerica/components/modals/ModalForm';

const getInitialValues = () => {
  const values: Record<string, any> = {};
  ARTICULO_FIELDS.forEach((f) => {
    values[f.name] = f.type === 'number' ? 0 : '';
  });
  return values;
};

const ScreenArticulosManufacturados = () => {
  const { articulos, loading, error, fetchArticulos, addArticulo, updateArticulo, deleteArticulo } =
    useArticuloManufacturadoStore();

  const [openModal, setOpenModal] = useState(false);
  const [selectedArticulo, setSelectedArticulo] = useState<any | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  useEffect(() => {
    fetchArticulos();
  }, [fetchArticulos]);

  const handleAdd = () => {
    setSelectedArticulo(getInitialValues());
    setModalMode('add');
    setOpenModal(true);
  };

  const handleEdit = (item: any) => {
    setSelectedArticulo(item);
    setModalMode('edit');
    setOpenModal(true);
  };

  const handleDelete = (id: number) => {
    deleteArticulo(id);
  };

  const handleSubmit = (values: any) => {
    if (modalMode === 'add') {
      addArticulo(values);
    } else {
      updateArticulo(values);
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
      render: (row: any) => (
        <div className="flex gap-2 justify-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleEdit(row)}
          >
            <span className="material-symbols-outlined">edit</span>
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
            onClick={() => handleDelete(row.id)}
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
        rows={articulos}
      />
      <ModalForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalMode === 'add' ? 'Agregar Artículo Manufacturado' : 'Editar Artículo Manufacturado'
        }
        fields={ARTICULO_FIELDS}
        initialValues={selectedArticulo ?? getInitialValues()}
        onSubmit={handleSubmit}
      />
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ScreenArticulosManufacturados;

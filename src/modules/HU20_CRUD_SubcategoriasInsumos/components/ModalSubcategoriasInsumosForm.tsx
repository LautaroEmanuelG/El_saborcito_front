import { useState, useEffect } from 'react';
import type { Categoria } from '../../../types/Categoria';

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<Categoria>;
  onSubmit: (values: Partial<Categoria>) => void;
  categorias: Categoria[];
  selectedPadreId?: number | null;
  setSelectedPadreId?: (id: number) => void;
  mode?: 'add' | 'edit' | 'view';
}

const ModalSubcategoriasInsumosForm = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  categorias,
  selectedPadreId,
  setSelectedPadreId,
  mode = 'add',
}: Props) => {
  const [form, setForm] = useState<Partial<Categoria>>(initialValues);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setForm(initialValues);
    setErrorMsg(null);
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (setSelectedPadreId) setSelectedPadreId(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await onSubmit(form);
    } catch (error: any) {
      setErrorMsg(
        error?.response?.data?.message || error?.message || 'Error al guardar la subcategoría'
      );
    }
  };

  const categoriasPadreInsumos = categorias.filter(
    (cat) => !cat.tipoCategoria && cat.tipo === 'INSUMOS'
  );

  return open ? (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-blanco p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === 'add' && 'Agregar Subcategoría de Insumos'}
          {mode === 'edit' && 'Editar Subcategoría de Insumos'}
          {mode === 'view' && 'Detalle de Subcategoría de Insumos'}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Nombre de la subcategoría</label>
          <input
            type="text"
            name="denominacion"
            className="w-full mb-4 p-2 border border-secondary rounded focus:outline-none focus:border-secondary hover:border-secondary"
            value={form.denominacion || ''}
            onChange={handleChange}
            required
            disabled={mode === 'view'}
          />
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {errorMsg}
            </div>
          )}
          <div className="mb-6">
            <label className="block mb-2">Categoría Padre</label>
            <select
              className="w-full p-2 border border-secondary rounded focus:outline-none focus:border-secondary hover:border-secondary"
              value={selectedPadreId ?? ''}
              onChange={handlePadreChange}
              required
              disabled={mode === 'view'}
            >
              <option value="">Seleccionar categoría padre</option>
              {categoriasPadreInsumos.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.denominacion}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center mt-6 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-negro border border-secondary px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="bg-primary text-blanco px-4 py-2 rounded transition-colors"
              >
                {mode === 'add' ? 'Crear Subcategoría' : 'Guardar Cambios'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default ModalSubcategoriasInsumosForm;

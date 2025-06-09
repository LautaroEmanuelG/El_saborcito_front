import { useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import type { UnidadMedida } from '../../../types/UnidadMedida';

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloInsumo>;
  onSubmit: (values: Partial<ArticuloInsumo>) => void;
  mode: 'add' | 'edit' | 'view';
  categorias: Categoria[];
  unidades: UnidadMedida[];
}

// Extendemos el tipo para permitir 'eliminado' en el form local
interface ArticuloInsumoWithEliminado extends ArticuloInsumo {
  eliminado?: boolean;
}

const getInitialForm = (
  initialValues: Partial<ArticuloInsumoWithEliminado>
): Partial<ArticuloInsumoWithEliminado> => ({
  denominacion: '',
  precioCompra: 0,
  stockActual: 0,
  stockMaximo: 0,
  categoria: undefined,
  unidadMedida: undefined,
  eliminado: false,
  ...initialValues,
});

export const ModalInsumoForm = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode,
  categorias,
  unidades,
}: Props) => {
  const [form, setForm] = useState<Partial<ArticuloInsumoWithEliminado>>(
    getInitialForm(initialValues)
  );
  const [isHabilitado, setIsHabilitado] = useState(true);

  useEffect(() => {
    setForm(getInitialForm(initialValues));
    // Corrige el tipado para acceder a 'eliminado' aunque no esté en el tipo base
    setIsHabilitado(
      (initialValues as any).eliminado === undefined ? true : !(initialValues as any).eliminado
    );
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') return; // El checkbox se maneja aparte
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = categorias.find((c) => c.id === Number(e.target.value));
    setForm((prev) => ({ ...prev, categoria: cat }));
  };

  const handleUnidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unidad = unidades.find((u) => u.id === Number(e.target.value));
    setForm((prev) => ({ ...prev, unidadMedida: unidad }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.unidadMedida || !form.unidadMedida.id) {
      alert('Debes seleccionar una unidad de medida válida.');
      return;
    }
    if (!form.categoria || !form.categoria.id) {
      alert('Debes seleccionar una categoría válida.');
      return;
    }
    const { eliminado, categoria, ...rest } = form;
    // Si está en modo edición y se desmarca habilitado, forzar eliminado true
    const isEditAndDeshabilitado = mode === 'edit' && !isHabilitado;
    const payload = {
      ...rest,
      eliminado: !isHabilitado || isEditAndDeshabilitado,
      categoriaId: form.categoria.id,
      unidadMedida: form.unidadMedida,
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          {mode === 'add' ? 'Agregar Insumo' : mode === 'edit' ? 'Editar Insumo' : 'Ver Insumo'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="denominacion">
              Denominación<span className="text-red-500">*</span>
            </label>
            <input
              id="denominacion"
              name="denominacion"
              value={form.denominacion ?? ''}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="precioCompra">
              Precio Compra<span className="text-red-500">*</span>
            </label>
            <input
              id="precioCompra"
              name="precioCompra"
              type="number"
              value={form.precioCompra ?? 0}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="stockActual">
              Stock Actual<span className="text-red-500">*</span>
            </label>
            <input
              id="stockActual"
              name="stockActual"
              type="number"
              value={form.stockActual ?? 0}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="stockMaximo">
              Stock Máximo<span className="text-red-500">*</span>
            </label>
            <input
              id="stockMaximo"
              name="stockMaximo"
              type="number"
              value={form.stockMaximo ?? 0}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="categoria">
              Categoría<span className="text-red-500">*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria?.id ?? ''}
              onChange={handleCategoriaChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar Categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.denominacion}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="unidadMedida">
              Unidad de Medida<span className="text-red-500">*</span>
            </label>
            <select
              id="unidadMedida"
              name="unidadMedida"
              value={form.unidadMedida?.id ?? ''}
              onChange={handleUnidadChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar Unidad de Medida</option>
              {unidades.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.denominacion}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-center items-center gap-2 mt-2">
            <input
              id="habilitado"
              type="checkbox"
              checked={isHabilitado}
              onChange={() => setIsHabilitado((prev) => !prev)}
              disabled={mode === 'view'}
            />
            <label htmlFor="habilitado" className="text-base select-none cursor-pointer">
              Habilitado
            </label>
          </div>
          <div className="flex justify-center items-center gap-2 mt-2">
            <input
              id="esParaElaborar"
              type="checkbox"
              checked={!!form.esParaElaborar}
              onChange={() =>
                setForm((prev) => ({ ...prev, esParaElaborar: !prev.esParaElaborar }))
              }
              disabled={mode === 'view'}
            />
            <label htmlFor="esParaElaborar" className="text-base select-none cursor-pointer">
              Es para elaborar
            </label>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
              Cancelar
            </button>
            {mode !== 'view' && (
              <button type="submit" className="bg-primary text-white px-4 py-2 rounded">
                {mode === 'add' ? 'Crear' : 'Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalInsumoForm;

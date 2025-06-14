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
  stockMinimo: 0,
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

  // Filtrar solo las categorías padre de tipo INSUMOS para el select del modal
  const categoriasPadre = categorias.filter((cat) => !cat.tipoCategoria && cat.tipo === 'INSUMOS');
  const [selectedCategoriaPadreId, setSelectedCategoriaPadreId] = useState<number | undefined>(
    undefined
  );
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    setForm(getInitialForm(initialValues));
    // Corrige el tipado para acceder a 'eliminado' aunque no esté en el tipo base
    setIsHabilitado(
      (initialValues as any).eliminado === undefined ? true : !(initialValues as any).eliminado
    );
  }, [initialValues, open]);

  useEffect(() => {
    // Si hay una categoría seleccionada en el form, setear el padre y subcategoría
    if (form.categoria) {
      if (!form.categoria.tipoCategoria) {
        setSelectedCategoriaPadreId(form.categoria.id);
        setSubcategorias(categorias.filter((cat) => cat.tipoCategoria?.id === form.categoria?.id));
        setSelectedSubcategoriaId(undefined);
      } else if (form.categoria.tipoCategoria && form.categoria.tipoCategoria.id) {
        setSelectedCategoriaPadreId(form.categoria.tipoCategoria.id);
        const tipoCatId = form.categoria.tipoCategoria?.id;
        setSubcategorias(categorias.filter((cat) => cat.tipoCategoria?.id === tipoCatId));
        setSelectedSubcategoriaId(form.categoria.id);
      } else {
        setSelectedCategoriaPadreId(undefined);
        setSubcategorias([]);
        setSelectedSubcategoriaId(undefined);
      }
    } else {
      setSelectedCategoriaPadreId(undefined);
      setSubcategorias([]);
      setSelectedSubcategoriaId(undefined);
    }
  }, [form.categoria, categorias]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') return; // El checkbox se maneja aparte
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unidad = unidades.find((u) => u.id === Number(e.target.value));
    setForm((prev) => ({ ...prev, unidadMedida: unidad }));
  };

  const handleCategoriaPadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const padreId = Number(e.target.value);
    setSelectedCategoriaPadreId(padreId);
    const subs = categorias.filter((cat) => cat.tipoCategoria?.id === padreId);
    setSubcategorias(subs);
    setSelectedSubcategoriaId(undefined);
    // Si no hay subcategorías, setear la categoría padre en el form
    if (subs.length === 0) {
      const catPadre = categoriasPadre.find((c) => c.id === padreId);
      setForm((prev) => ({ ...prev, categoria: catPadre }));
    } else {
      setForm((prev) => ({ ...prev, categoria: undefined }));
    }
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = Number(e.target.value);
    setSelectedSubcategoriaId(subId);
    const subcat = subcategorias.find((c) => c.id === subId);
    setForm((prev) => ({ ...prev, categoria: subcat }));
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
    // Asegurar que el id esté presente en el payload si existe
    const payload = {
      ...rest,
      id: form.id, // importante para update
      eliminado: !isHabilitado,
      categoriaId: form.categoria.id,
      unidadMedida: form.unidadMedida,
    };
    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blanco p-6 rounded-lg shadow-lg w-full max-w-md">
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
            <label className="block text-sm font-medium mb-1" htmlFor="precioVenta">
              Precio Venta<span className="text-red-500">*</span>
            </label>
            <input
              id="precioVenta"
              name="precioVenta"
              type="number"
              value={form.precioVenta ?? 0}
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
            <label className="block text-sm font-medium mb-1" htmlFor="stockMinimo">
              Stock Mínimo<span className="text-red-500">*</span>
            </label>
            <input
              id="stockMinimo"
              name="stockMinimo"
              type="number"
              value={form.stockMinimo ?? 0}
              onChange={handleChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="categoriaPadre">
              Categoría<span className="text-red-500">*</span>
            </label>
            <select
              id="categoriaPadre"
              name="categoriaPadre"
              value={selectedCategoriaPadreId ?? ''}
              onChange={handleCategoriaPadreChange}
              disabled={mode === 'view'}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Seleccionar Categoría</option>
              {categoriasPadre.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.denominacion}
                </option>
              ))}
            </select>
          </div>
          {subcategorias.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="subcategoria">
                Subcategoría
              </label>
              <select
                id="subcategoria"
                name="subcategoria"
                value={selectedSubcategoriaId ?? ''}
                onChange={handleSubcategoriaChange}
                disabled={mode === 'view'}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar Subcategoría</option>
                {subcategorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.denominacion}
                  </option>
                ))}
              </select>
            </div>
          )}
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
              <button type="submit" className="bg-primary text-blanco px-4 py-2 rounded">
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

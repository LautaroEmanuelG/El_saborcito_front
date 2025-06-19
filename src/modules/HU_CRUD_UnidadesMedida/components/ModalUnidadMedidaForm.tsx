import { useEffect, useState } from 'react';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import { useUnidadMedidaStore } from '../services/unidadMedidaStore';

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<UnidadMedida>;
  onSubmit: (values: Partial<UnidadMedida>) => void;
  mode: 'add' | 'edit' | 'view';
}

const getInitialForm = (initialValues: Partial<UnidadMedida>): Partial<UnidadMedida> => ({
  denominacion: '',
  ...initialValues,
});

export const ModalUnidadMedidaForm = ({ open, onClose, initialValues, onSubmit, mode }: Props) => {
  const [form, setForm] = useState<Partial<UnidadMedida>>(getInitialForm(initialValues));
  const [isHabilitado, setIsHabilitado] = useState(true);
  const { error } = useUnidadMedidaStore();

  useEffect(() => {
    setForm(getInitialForm(initialValues));
    // Si tiene la propiedad eliminado, setear el estado habilitado
    setIsHabilitado(
      (initialValues as any).eliminado === undefined ? true : !(initialValues as any).eliminado
    );
  }, [initialValues, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.denominacion?.trim()) {
      alert('La denominación es requerida.');
      return;
    }

    const payload = {
      ...form,
      id: form.id, // importante para update
      eliminado: !isHabilitado,
    };

    onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blanco p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">
          {mode === 'add'
            ? 'Agregar Unidad de Medida'
            : mode === 'edit'
              ? 'Editar Unidad de Medida'
              : 'Ver Unidad de Medida'}{' '}
        </h2>

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            ❌ {error}
          </div>
        )}

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
              placeholder="Ej: kilogramos, litros, unidades, etc."
            />
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

          <div className="flex justify-center gap-2 mt-4">
            <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
              Cancelar
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="bg-primary text-blanco px-4 py-2 rounded hover:bg-primarydark"
              >
                {mode === 'add' ? 'Crear' : 'Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalUnidadMedidaForm;

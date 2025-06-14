import React, { useState } from 'react';
import type { Categoria } from '../../../types/Categoria';

interface ModalCategoriaPadreFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<Categoria>;
  onSubmit: (values: Partial<Categoria>) => void;
  mode: 'add' | 'edit' | 'view';
}

const ModalCategoriaPadreForm: React.FC<ModalCategoriaPadreFormProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode,
}) => {
  const [denominacion, setDenominacion] = React.useState(initialValues.denominacion || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    setDenominacion(initialValues.denominacion || '');
    setErrorMsg(null);
  }, [initialValues, open]);

  const isView = mode === 'view';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isView) {
      setErrorMsg(null);
      try {
        await onSubmit({ denominacion: denominacion.trim(), tipoCategoria: null });
      } catch (error: any) {
        setErrorMsg(
          error?.response?.data?.message || error?.message || 'Error al guardar la categoría'
        );
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-blanco p-8 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === 'add' && 'Agregar Categoría'}
          {mode === 'edit' && 'Editar Categoría'}
          {mode === 'view' && 'Ver Categoría'}
        </h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Nombre de la categoría padre</label>
          <input
            type="text"
            className="w-full mb-4 p-2 border border-secondary rounded focus:outline-none focus:border-secondary hover:border-secondary bg-blanco text-negro placeholder:gris"
            value={denominacion}
            onChange={(e) => setDenominacion(e.target.value)}
            disabled={isView}
            required
            maxLength={50}
          />
          {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {errorMsg}
            </div>
          )}
          <div className="flex justify-center mt-6 gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-secondary text-negro border border-secondary px-4 py-2 rounded transition-colors"
            >
              Cancelar
            </button>
            {!isView && (
              <button
                type="submit"
                className="bg-primary text-blanco px-4 py-2 rounded transition-colors"
              >
                {mode === 'add' ? 'Agregar' : 'Guardar'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCategoriaPadreForm;

import { useState } from 'react';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';
import IconoPassword from '../../../assets/svgs/icons/IconoPassword';
import { cambiarContraseñaEmpleado } from '../logic';
import { CambiarContraseñaForm } from '../model';

export const CambiarContraseñaEmpleado = () => {
  const { empleadoAutenticado } = useEmpleado();
  const { mostrarNotificacion } = useNotificacion();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CambiarContraseñaForm>({
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarNuevaContraseña: '',
  });

  if (!empleadoAutenticado) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gris">Cargando...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof CambiarContraseñaForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!empleadoAutenticado.id) {
      mostrarNotificacion('Error: ID de empleado no válido', 'error');
      return;
    }

    setLoading(true);
    try {
      await cambiarContraseñaEmpleado(empleadoAutenticado.id, formData);

      setFormData({
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarNuevaContraseña: '',
      });

      mostrarNotificacion('¡Contraseña cambiada correctamente!', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    formData.contraseñaActual &&
    formData.nuevaContraseña &&
    formData.confirmarNuevaContraseña &&
    formData.nuevaContraseña === formData.confirmarNuevaContraseña;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-negro flex items-center gap-3">
          <IconoPassword />
          Cambiar Contraseña
        </h2>
        <p className="text-gris mt-2">Actualiza tu contraseña para mantener tu cuenta segura</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-negro mb-2">Contraseña Actual *</label>
          <input
            type="password"
            value={formData.contraseñaActual}
            onChange={(e) => handleInputChange('contraseñaActual', e.target.value)}
            className="w-full px-4 py-3 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ingresa tu contraseña actual"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-2">Nueva Contraseña *</label>
          <input
            type="password"
            value={formData.nuevaContraseña}
            onChange={(e) => handleInputChange('nuevaContraseña', e.target.value)}
            className="w-full px-4 py-3 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 símbolo"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-negro mb-2">
            Confirmar Nueva Contraseña *
          </label>
          <input
            type="password"
            value={formData.confirmarNuevaContraseña}
            onChange={(e) => handleInputChange('confirmarNuevaContraseña', e.target.value)}
            className="w-full px-4 py-3 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Confirma tu nueva contraseña"
            required
          />
          {formData.nuevaContraseña &&
            formData.confirmarNuevaContraseña &&
            formData.nuevaContraseña !== formData.confirmarNuevaContraseña && (
              <p className="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
            )}
        </div>

        <div className="bg-blanco p-4 rounded-lg">
          <h4 className="font-medium text-negro mb-2">Requisitos de la contraseña:</h4>
          <ul className="text-sm text-gris space-y-1">
            <li>• Al menos 8 caracteres</li>
            <li>• Al menos una letra mayúscula</li>
            <li>• Al menos una letra minúscula</li>
            <li>• Al menos un símbolo especial</li>
            <li>• Diferente a la contraseña actual</li>
          </ul>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primarydark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cambiando Contraseña...' : 'Cambiar Contraseña'}
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({
                contraseñaActual: '',
                nuevaContraseña: '',
                confirmarNuevaContraseña: '',
              })
            }
            disabled={loading}
            className="px-6 py-3 border border-gris text-gris rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
};

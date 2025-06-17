import { useState } from 'react';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoUsuario from '../../../assets/svgs/icons/IconoUsuario';
import IconoUbicacion from '../../../assets/svgs/icons/IconoUbicacion';
import { actualizarDatosEmpleado, obtenerNombreRol, formatearFecha } from '../logic';
import { EditarDatosEmpleadoForm } from '../model';

export const MisDatosEmpleado = () => {
  const { empleadoAutenticado, setEmpleado } = useEmpleado();
  const { mostrarNotificacion } = useNotificacion();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EditarDatosEmpleadoForm>({
    nombre: empleadoAutenticado?.nombre || '',
    apellido: empleadoAutenticado?.apellido || '',
    telefono: empleadoAutenticado?.telefono || '',
    email: empleadoAutenticado?.email || '',
  });

  if (!empleadoAutenticado) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gris">Cargando datos del empleado...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field: keyof EditarDatosEmpleadoForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!empleadoAutenticado.id) {
      mostrarNotificacion('Error: ID de empleado no válido', 'error');
      return;
    }

    setLoading(true);
    try {
      const empleadoActualizado = await actualizarDatosEmpleado(empleadoAutenticado.id, formData);

      setEmpleado({
        ...empleadoAutenticado,
        nombre: empleadoActualizado.nombre,
        apellido: empleadoActualizado.apellido,
        telefono: empleadoActualizado.telefono,
        email: empleadoActualizado.email,
      });

      setIsEditing(false);
      mostrarNotificacion('Datos actualizados correctamente', 'success');
    } catch (error: any) {
      mostrarNotificacion(error.message || 'Error al actualizar los datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: empleadoAutenticado.nombre || '',
      apellido: empleadoAutenticado.apellido || '',
      telefono: empleadoAutenticado.telefono || '',
      email: empleadoAutenticado.email,
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-negro">Mis Datos Personales</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primarydark transition-colors"
          >
            <IconoEditar className="w-4 h-4" />
            Editar Datos
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Información Personal */}
        <div className="bg-blanco p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-negro mb-4 flex items-center gap-2">
            <IconoUsuario className="w-5 h-5 text-primary" />
            Información Personal
          </h3>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gris mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  className="w-full px-3 py-2 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gris mb-1">Apellido</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => handleInputChange('apellido', e.target.value)}
                  className="w-full px-3 py-2 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gris mb-1">Teléfono</label>
                <input
                  type="text"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full px-3 py-2 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gris mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gris rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primarydark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="bg-secondary text-negro px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium text-gris">Nombre:</span>
                <span className="text-negro">
                  {empleadoAutenticado.nombre || 'No especificado'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium text-gris">Apellido:</span>
                <span className="text-negro">
                  {empleadoAutenticado.apellido || 'No especificado'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium text-gris">Teléfono:</span>
                <span className="text-negro">
                  {empleadoAutenticado.telefono || 'No especificado'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-medium text-gris">Email:</span>
                <span className="text-negro">{empleadoAutenticado.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Información Laboral */}
        <div className="bg-blanco p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-negro mb-4 flex items-center gap-2">
            <IconoUbicacion />
            Información Laboral
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gris">Rol:</span>
              <span className="text-negro">{obtenerNombreRol(empleadoAutenticado.rol)}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gris">Estado:</span>
              <span
                className={`font-medium ${empleadoAutenticado.estado ? 'text-green-600' : 'text-red-600'}`}
              >
                {empleadoAutenticado.estado ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gris">Fecha de Registro:</span>
              <span className="text-negro">
                {formatearFecha(empleadoAutenticado.fechaRegistro)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium text-gris">Última Modificación:</span>
              <span className="text-negro">
                {formatearFecha(empleadoAutenticado.fechaUltimaModificacion)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

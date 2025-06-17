import { useState } from 'react';
import { EmpleadoFormData, ROLES_EMPLEADO } from '../model';
import { validarFormularioEmpleado, formDataToRegistroEmpleado, cleanFormData } from '../logic';
import { registrarEmpleado } from '../../../shared/services/empleadoService';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { useNotificacionContext } from '../../../shared/providers/NotificacionProvider';

interface ModalRegistroEmpleadoProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoRegistrado: () => void;
}

export const ModalRegistroEmpleado = ({
  isOpen,
  onClose,
  onEmpleadoRegistrado,
}: ModalRegistroEmpleadoProps) => {
  const [formData, setFormData] = useState<EmpleadoFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rol: '',
  });

  const [loading, setLoading] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const { mostrarNotificacion } = useNotificacionContext();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar errores cuando el usuario empiece a escribir
    if (errores.length > 0) {
      setErrores([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setLoading(true);

    try {
      // Limpiar y validar datos del formulario
      const datosLimpios = cleanFormData(formData);
      const erroresValidacion = validarFormularioEmpleado(datosLimpios);

      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        setLoading(false);
        return;
      }

      // Convertir a DTO y enviar al backend
      const registroDto = formDataToRegistroEmpleado(datosLimpios);
      const response = await registrarEmpleado(registroDto);

      mostrarNotificacion('Empleado registrado exitosamente', 'success');

      // Resetear formulario
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        password: '',
        confirmarPassword: '',
        rol: '',
      });

      // Notificar al componente padre y cerrar modal
      onEmpleadoRegistrado();
      onClose();
    } catch (error: any) {
      const mensaje = error.message || 'Error al registrar el empleado';
      setErrores([mensaje]);
      mostrarNotificacion(mensaje, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        nombre: '',
        apellido: '',
        telefono: '',
        email: '',
        password: '',
        confirmarPassword: '',
        rol: '',
      });
      setErrores([]);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Empleado</h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
            >
              <IconoCerrar />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Mostrar errores */}
          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <ul className="text-sm text-red-600 space-y-1">
                {errores.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Ingrese el nombre"
              />
            </div>

            {/* Apellido */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Ingrese el apellido"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Ingrese el teléfono"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Ingrese el email"
              />
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                Rol *
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Seleccione un rol</option>
                {ROLES_EMPLEADO.map((rol) => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña Provisoria *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Mínimo 8 caracteres con mayúscula, minúscula y símbolo"
              />
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label
                htmlFor="confirmarPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Contraseña *
              </label>
              <input
                type="password"
                id="confirmarPassword"
                name="confirmarPassword"
                value={formData.confirmarPassword}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                placeholder="Confirme la contraseña"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primarydark rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ClienteDTO, ClienteFormData } from '../model';
import { validarFormularioCliente, formDataToActualizarClienteDTO, cleanFormData } from '../logic';
import { actualizarClienteAdmin } from '../../../shared/services/clienteAdminService';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';

interface ModalEditarClienteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cliente: ClienteDTO | null;
  onClienteActualizado: (cliente: ClienteDTO) => void;
}

export const ModalEditarCliente: React.FC<ModalEditarClienteProps> = ({
  isOpen,
  setIsOpen,
  cliente,
  onClienteActualizado,
}) => {
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    fechaNacimiento: '',
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const { mostrarNotificacion } = useNotificacion();

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen && cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        apellido: cliente.apellido || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        fechaNacimiento: cliente.fechaNacimiento || '',
      });
      setErrores([]);
    }
  }, [isOpen, cliente]);

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errores.length > 0) {
      setErrores([]);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliente?.id) return;

    setErrores([]);
    setLoading(true);

    try {
      const datosLimpios = cleanFormData(formData);
      const erroresValidacion = validarFormularioCliente(datosLimpios);

      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        setLoading(false);
        return;
      }

      const actualizacionDto = formDataToActualizarClienteDTO(datosLimpios);
      const clienteActualizado = await actualizarClienteAdmin(cliente.id, actualizacionDto);

      onClienteActualizado(clienteActualizado);
      mostrarNotificacion('Cliente actualizado exitosamente', 'success');
      setIsOpen(false);
    } catch (error: any) {
      const mensaje = error.message || 'Error al actualizar el cliente';
      setErrores([mensaje]);
      mostrarNotificacion(mensaje, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Cerrar modal
  const handleClose = () => {
    setIsOpen(false);
    setErrores([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Editar Cliente</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <IconoCerrar />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {errores.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
              <ul className="list-disc list-inside space-y-1">
                {errores.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>

              {/* Apellido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
                required
              />
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primarydark focus:outline-none focus:ring-2 focus:ring-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

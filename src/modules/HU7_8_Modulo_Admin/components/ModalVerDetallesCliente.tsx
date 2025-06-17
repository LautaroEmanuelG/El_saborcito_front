import { ClienteDTO } from '../model';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { formatearFecha } from '../logic';

interface ModalVerDetallesClienteProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClienteDTO | null;
}

export const ModalVerDetallesCliente = ({
  isOpen,
  onClose,
  cliente,
}: ModalVerDetallesClienteProps) => {
  if (!isOpen || !cliente) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Detalles del Cliente</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <IconoCerrar color="currentColor" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <div className="mt-1 text-sm text-gray-900">{cliente.nombre}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Apellido</label>
                  <div className="mt-1 text-sm text-gray-900">{cliente.apellido}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <div className="mt-1 text-sm text-gray-900">{cliente.email}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {cliente.telefono || 'No especificado'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Nacimiento
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {cliente.fechaNacimiento
                      ? formatearFecha(cliente.fechaNacimiento)
                      : 'No especificada'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <div className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cliente.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cliente.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Información del Sistema */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Sistema</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID del Cliente</label>
                  <div className="mt-1 text-sm text-gray-900">{cliente.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Registro
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    {cliente.fechaRegistro
                      ? formatearFecha(cliente.fechaRegistro)
                      : 'No disponible'}
                  </div>
                </div>
              </div>
            </div>{' '}
            {/* Información Adicional */}
            {/* ClienteDTO no incluye imagen por el momento */}
            {/* {cliente.imagen && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagen de Perfil</h3>
                <div className="flex justify-center">
                  <img
                    src={cliente.imagen.url}
                    alt={`Perfil de ${cliente.nombre} ${cliente.apellido}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>
              </div>
            )} */}
          </div>

          {/* Botones */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

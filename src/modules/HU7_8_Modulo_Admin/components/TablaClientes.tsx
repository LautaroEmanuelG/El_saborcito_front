import { useState } from 'react';
import { ClienteDTO } from '../model';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import { formatearFecha } from '../logic';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

interface TablaClientesProps {
  clientes: ClienteDTO[];
  loading: boolean;
  onEditarCliente: (cliente: ClienteDTO) => void;
  onEliminarCliente: (cliente: ClienteDTO) => void;
  onVerDetalles: (cliente: ClienteDTO) => void;
}

export const TablaClientes = ({
  clientes,
  loading,
  onEditarCliente,
  onEliminarCliente,
  onVerDetalles,
}: TablaClientesProps) => {
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((cliente) => {
    const coincideBusqueda =
      !busqueda ||
      cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      cliente.email.toLowerCase().includes(busqueda.toLowerCase());

    const coincideEstado =
      !filtroEstado ||
      (filtroEstado === 'activo' && cliente.estado) ||
      (filtroEstado === 'inactivo' && !cliente.estado);

    return coincideBusqueda && coincideEstado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando clientes...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Filtros */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Buscar por nombre, apellido o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Nacimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Registro
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clientesFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  {clientes.length === 0
                    ? 'No hay clientes registrados'
                    : 'No se encontraron clientes que coincidan con los filtros'}
                </td>
              </tr>
            ) : (
              clientesFiltrados.map((cliente) => (
                <tr key={cliente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {cliente.nombre} {cliente.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{cliente.telefono}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.fechaNacimiento ? formatearFecha(cliente.fechaNacimiento) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        cliente.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cliente.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cliente.fechaRegistro ? formatearFecha(cliente.fechaRegistro) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onVerDetalles(cliente)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <IconoVer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditarCliente(cliente)}
                        className="text-primary hover:text-primarydark"
                        title="Editar cliente"
                      >
                        <IconoEditar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarCliente(cliente)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar cliente"
                      >
                        <IconoEliminar className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Resumen */}
      {clientes.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {clientesFiltrados.length} de {clientes.length} clientes
          </div>
        </div>
      )}
    </div>
  );
};

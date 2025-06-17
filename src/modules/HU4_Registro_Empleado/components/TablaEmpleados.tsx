import { useState } from 'react';
import { EmpleadoDTO } from '../model';
import { Rol } from '../../HU1_2_Registro_Login/models';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import IconoVer from '../../../assets/svgs/icons/IconoVer';

interface TablaEmpleadosProps {
  empleados: EmpleadoDTO[];
  loading: boolean;
  onEditarEmpleado: (empleado: EmpleadoDTO) => void;
  onEliminarEmpleado: (empleado: EmpleadoDTO) => void;
  onVerDetalles: (empleado: EmpleadoDTO) => void;
}

export const TablaEmpleados = ({
  empleados,
  loading,
  onEditarEmpleado,
  onEliminarEmpleado,
  onVerDetalles,
}: TablaEmpleadosProps) => {
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Obtener rol en español
  const getRolLabel = (rol: Rol) => {
    switch (rol) {
      case Rol.CAJERO:
        return 'Cajero';
      case Rol.COCINERO:
        return 'Cocinero';
      case Rol.DELIVERY:
        return 'Delivery';
      default:
        return rol;
    }
  };

  // Filtrar empleados
  const empleadosFiltrados = empleados.filter((empleado) => {
    const coincideBusqueda =
      !busqueda ||
      empleado.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.email.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.legajo?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideRol = !filtroRol || empleado.rol === filtroRol;
    const coincideEstado =
      !filtroEstado ||
      (filtroEstado === 'activo' && empleado.estado) ||
      (filtroEstado === 'inactivo' && !empleado.estado);

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando empleados...</span>
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
              placeholder="Buscar por nombre, apellido, email o legajo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Todos los roles</option>
              <option value={Rol.CAJERO}>Cajero</option>
              <option value={Rol.COCINERO}>Cocinero</option>
              <option value={Rol.DELIVERY}>Delivery</option>
            </select>
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
                Empleado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Legajo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Ingreso
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {empleadosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  {empleados.length === 0
                    ? 'No hay empleados registrados'
                    : 'No se encontraron empleados que coincidan con los filtros'}
                </td>
              </tr>
            ) : (
              empleadosFiltrados.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {empleado.nombre} {empleado.apellido}
                      </div>
                      <div className="text-sm text-gray-500">{empleado.telefono}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {empleado.legajo || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        empleado.rol === Rol.CAJERO
                          ? 'bg-blue-100 text-blue-800'
                          : empleado.rol === Rol.COCINERO
                            ? 'bg-green-100 text-green-800'
                            : empleado.rol === Rol.DELIVERY
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getRolLabel(empleado.rol)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {empleado.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        empleado.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {empleado.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {empleado.fechaIngreso
                      ? new Date(empleado.fechaIngreso).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onVerDetalles(empleado)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver detalles"
                      >
                        <IconoVer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditarEmpleado(empleado)}
                        className="text-primary hover:text-primarydark"
                        title="Editar empleado"
                      >
                        <IconoEditar className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEliminarEmpleado(empleado)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar empleado"
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
      {empleados.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Mostrando {empleadosFiltrados.length} de {empleados.length} empleados
          </div>
        </div>
      )}
    </div>
  );
};

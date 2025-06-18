import { useMemo } from 'react';
import { ClienteDTO } from '../model';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';
import { formatearFecha } from '../logic';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';

interface TablaClientesProps {
  clientes: ClienteDTO[];
  loading: boolean;
  onEditarCliente: (cliente: ClienteDTO) => void;
  onEliminarCliente: (cliente: ClienteDTO) => void;
  onVerDetalles: (cliente: ClienteDTO) => void;
}

// Extender ClienteDTO para que sea compatible con TableGeneric
interface ClienteExtended {
  id: number;
  denominacion: string;
  eliminado?: boolean;
  categoriaId?: number;
  // Propiedades originales del cliente
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaNacimiento?: string;
  fechaRegistro?: string;
  fechaUltimaModificacion?: string;
  estado?: boolean;
}

export const TablaClientes = ({
  clientes,
  loading,
  onEditarCliente,
  onEliminarCliente,
  onVerDetalles,
}: TablaClientesProps) => {
  // Convertir clientes para TableGeneric
  const clientesExtended: ClienteExtended[] = useMemo(() => {
    return clientes.map((cliente) => ({
      id: cliente.id || 0,
      denominacion:
        `${cliente.nombre} ${cliente.apellido} ${cliente.email} ${cliente.telefono || ''}`.toLowerCase(),
      eliminado: false, // No marcar como eliminado para evitar filtrado automático
      categoriaId: cliente.estado ? 1 : 2, // 1 para activos, 2 para inactivos
      // Propiedades originales
      nombre: cliente.nombre,
      apellido: cliente.apellido,
      telefono: cliente.telefono,
      email: cliente.email,
      fechaNacimiento: cliente.fechaNacimiento,
      fechaRegistro: cliente.fechaRegistro,
      fechaUltimaModificacion: cliente.fechaUltimaModificacion,
      estado: cliente.estado,
    }));
  }, [clientes]);

  // Definir las columnas para TableGeneric
  const columns = useMemo(
    () => [
      {
        label: 'Cliente',
        key: 'cliente',
        render: (cliente: ClienteExtended) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {cliente.nombre} {cliente.apellido}
            </div>
            <div className="text-sm text-gray-500">{cliente.telefono}</div>
          </div>
        ),
      },
      {
        label: 'Email',
        key: 'email',
        render: (cliente: ClienteExtended) => (
          <span className="text-sm text-gray-500">{cliente.email}</span>
        ),
      },
      {
        label: 'Fecha Nacimiento',
        key: 'fechaNacimiento',
        render: (cliente: ClienteExtended) => (
          <span className="text-sm text-gray-500">
            {cliente.fechaNacimiento ? formatearFecha(cliente.fechaNacimiento) : '-'}
          </span>
        ),
      },
      {
        label: 'Estado',
        key: 'estado',
        render: (cliente: ClienteExtended) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              cliente.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {cliente.estado ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        label: 'Fecha Registro',
        key: 'fechaRegistro',
        render: (cliente: ClienteExtended) => (
          <span className="text-sm text-gray-500">
            {cliente.fechaRegistro ? formatearFecha(cliente.fechaRegistro) : '-'}
          </span>
        ),
      },
      {
        label: 'Acciones',
        key: 'acciones',
        render: (cliente: ClienteExtended) => (
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
            {cliente.estado ? (
              <button
                onClick={() => onEliminarCliente(cliente)}
                className="text-red-600 hover:text-red-900"
                title="Dar de baja cliente"
              >
                <IconoEliminar className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onEliminarCliente(cliente)}
                className="text-green-600 hover:text-green-900"
                title="Dar de alta cliente"
              >
                <IconoAgregar className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [onVerDetalles, onEditarCliente, onEliminarCliente]
  );

  // Categorías para filtrar por estado
  const categorias = useMemo(
    () => [
      { id: 1, denominacion: 'Activos' },
      { id: 2, denominacion: 'Inactivos' },
    ],
    []
  );

  // Filtro personalizado por estado
  const customCategoryFilter = (cliente: ClienteExtended, estadoId: number) => {
    switch (estadoId) {
      case 1:
        return cliente.estado === true;
      case 2:
        return cliente.estado === false;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando clientes...</span>
      </div>
    );
  }

  return (
    <TableGeneric
      columns={columns}
      rows={clientesExtended}
      handleDelete={() => {}} // No se usa ya que tenemos botones personalizados
      setOpenModal={() => {}} // No se usa ya que tenemos botones personalizados
      setSelectedItem={() => {}} // No se usa ya que tenemos botones personalizados
      showSearchBar={true}
      showCategoryFilter={true}
      categories={categorias}
      searchPlaceholder="Buscar por nombre, apellido o email..."
      customCategoryFilter={customCategoryFilter}
      onToggleDeleted={undefined} // Sin toggle para mostrar/ocultar
      showDeleted={false}
    />
  );
};

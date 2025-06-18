import { useMemo, useState } from 'react';
import { EmpleadoDTO } from '../model';
import { Rol } from '../../HU1_2_Registro_Login/models';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import { TableGeneric } from '../../../shared/components/abmGenerica/components/TableGeneric/TableGeneric';

interface TablaEmpleadosProps {
  empleados: EmpleadoDTO[];
  loading: boolean;
  onEditarEmpleado: (empleado: EmpleadoDTO) => void;
  onEliminarEmpleado: (empleado: EmpleadoDTO) => void;
  onVerDetalles: (empleado: EmpleadoDTO) => void;
}

// Extender EmpleadoDTO para que sea compatible con TableGeneric
interface EmpleadoExtended {
  id: number;
  denominacion: string;
  eliminado?: boolean;
  categoriaId?: number;
  // Propiedades originales del empleado
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  fechaIngreso?: string;
  legajo?: string;
  rol: Rol;
  estado?: boolean;
  fechaRegistro?: string;
  fechaUltimaModificacion?: string;
}

export const TablaEmpleados = ({
  empleados,
  loading,
  onEditarEmpleado,
  onEliminarEmpleado,
  onVerDetalles,
}: TablaEmpleadosProps) => {
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

  // Función para obtener ID de categoría por rol
  const getRolCategoryId = (rol: Rol) => {
    switch (rol) {
      case Rol.CAJERO:
        return 1;
      case Rol.COCINERO:
        return 2;
      case Rol.DELIVERY:
        return 3;
      default:
        return 1;
    }
  };

  // Convertir empleados para TableGeneric
  const empleadosExtended: EmpleadoExtended[] = useMemo(() => {
    return empleados.map((empleado) => ({
      id: empleado.id || 0,
      denominacion:
        `${empleado.nombre} ${empleado.apellido} ${empleado.email} ${empleado.legajo || ''} ${getRolLabel(empleado.rol)}`.toLowerCase(),
      eliminado: false, // No marcar como eliminado para evitar filtrado automático
      categoriaId: getRolCategoryId(empleado.rol),
      // Propiedades originales
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      telefono: empleado.telefono,
      email: empleado.email,
      fechaIngreso: empleado.fechaIngreso,
      legajo: empleado.legajo,
      rol: empleado.rol,
      estado: empleado.estado,
      fechaRegistro: empleado.fechaRegistro,
      fechaUltimaModificacion: empleado.fechaUltimaModificacion,
    }));
  }, [empleados]);

  // Definir las columnas para TableGeneric
  const columns = useMemo(
    () => [
      {
        label: 'Empleado',
        key: 'empleado',
        render: (empleado: EmpleadoExtended) => (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {empleado.nombre} {empleado.apellido}
            </div>
            <div className="text-sm text-gray-500">{empleado.telefono}</div>
          </div>
        ),
      },
      {
        label: 'Legajo',
        key: 'legajo',
        render: (empleado: EmpleadoExtended) => (
          <span className="text-sm text-gray-900">{empleado.legajo ?? '-'}</span>
        ),
      },
      {
        label: 'Rol',
        key: 'rol',
        render: (empleado: EmpleadoExtended) => (
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
        ),
      },
      {
        label: 'Email',
        key: 'email',
        render: (empleado: EmpleadoExtended) => (
          <span className="text-sm text-gray-500">{empleado.email}</span>
        ),
      },
      {
        label: 'Estado',
        key: 'estado',
        render: (empleado: EmpleadoExtended) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              empleado.estado ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {empleado.estado ? 'Activo' : 'Inactivo'}
          </span>
        ),
      },
      {
        label: 'Fecha Ingreso',
        key: 'fechaIngreso',
        render: (empleado: EmpleadoExtended) => (
          <span className="text-sm text-gray-500">
            {empleado.fechaIngreso ? new Date(empleado.fechaIngreso).toLocaleDateString() : '-'}
          </span>
        ),
      },
      {
        label: 'Acciones',
        key: 'acciones',
        render: (empleado: EmpleadoExtended) => (
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
            {empleado.estado ? (
              <button
                onClick={() => onEliminarEmpleado(empleado)}
                className="text-red-600 hover:text-red-900"
                title="Dar de baja empleado"
              >
                <IconoEliminar className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onEliminarEmpleado(empleado)}
                className="text-green-600 hover:text-green-900"
                title="Dar de alta empleado"
              >
                <IconoAgregar className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [onVerDetalles, onEditarEmpleado, onEliminarEmpleado]
  );

  // Categorías para filtrar por rol
  const categorias = useMemo(
    () => [
      { id: 1, denominacion: 'Cajero' },
      { id: 2, denominacion: 'Cocinero' },
      { id: 3, denominacion: 'Delivery' },
    ],
    []
  );

  // Filtro personalizado por rol
  const customCategoryFilter = (empleado: EmpleadoExtended, rolId: number) => {
    switch (rolId) {
      case 1:
        return empleado.rol === Rol.CAJERO;
      case 2:
        return empleado.rol === Rol.COCINERO;
      case 3:
        return empleado.rol === Rol.DELIVERY;
      default:
        return true;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Cargando empleados...</span>
      </div>
    );
  }

  return (
    <TableGeneric
      columns={columns}
      rows={empleadosExtended}
      handleDelete={() => {}} // No se usa ya que tenemos botones personalizados
      setOpenModal={() => {}} // No se usa ya que tenemos botones personalizados
      setSelectedItem={() => {}} // No se usa ya que tenemos botones personalizados
      showSearchBar={true}
      showCategoryFilter={true}
      categories={categorias}
      searchPlaceholder="Buscar por nombre, apellido, email o legajo..."
      customCategoryFilter={customCategoryFilter}
      onToggleDeleted={undefined} // Sin toggle para mostrar/ocultar
      showDeleted={false}
    />
  );
};

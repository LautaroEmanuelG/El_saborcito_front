import { useState, useEffect } from 'react';
import { EmpleadoFormData, ROLES_EMPLEADO, EmpleadoDTO } from '../model';
import { validarFormularioEmpleado, formDataToRegistroEmpleado, cleanFormData } from '../logic';
import { registrarEmpleado } from '../../../shared/services/empleadoService';
import { getAllSucursales } from '../../../shared/services/sucursalService';
import { Sucursal } from '../../../types/Sucursal';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
import { ModalConfirm } from '../../../shared/components/utils/ModalConfirm';
import { Rol } from '../../HU1_2_Registro_Login/models';
import IconoVer from '../../../assets/svgs/icons/IconoVer';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';

export const GestionEmpleados = () => {
  // Estados del provider
  const {
    empleados,
    loading: loadingEmpleados,
    error,
    cargarEmpleados,
    actualizarEstadoEmpleado,
    agregarEmpleado,
    actualizarEmpleado,
  } = useEmpleado();

  // Estados locales para el modal y filtros
  const [modalRegistro, setModalRegistro] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoDTO | null>(null);
  const [filtroRol, setFiltroRol] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estados del formulario
  const [formData, setFormData] = useState<EmpleadoFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rol: '',
    sucursal: undefined,
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [loadingForm, setLoadingForm] = useState(false);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loadingSucursales, setLoadingSucursales] = useState(false);

  // Estados locales para los modales de ver y editar
  const [modalVer, setModalVer] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [formEditar, setFormEditar] = useState<EmpleadoFormData>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    rol: '' as '' | Rol,
    sucursal: undefined,
  });

  const { mostrarNotificacion } = useNotificacion();

  // Cargar empleados al montar el componente
  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  // Cargar sucursales al montar el componente
  useEffect(() => {
    const cargarSucursales = async () => {
      setLoadingSucursales(true);
      try {
        const sucursalesData = await getAllSucursales();
        setSucursales(sucursalesData);
      } catch (error: any) {
        mostrarNotificacion('Error al cargar sucursales', 'error');
        console.error('Error al cargar sucursales:', error);
      } finally {
        setLoadingSucursales(false);
      }
    };

    cargarSucursales();
  }, []);

  // Mostrar error si hay
  useEffect(() => {
    if (error) {
      mostrarNotificacion(error, 'error');
    }
  }, [error, mostrarNotificacion]);

  // Función para abrir modal de confirmación
  const abrirModalConfirm = (empleado: EmpleadoDTO) => {
    setEmpleadoSeleccionado(empleado);
    setModalConfirm(true);
  };

  // Función para obtener etiqueta del rol
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
      empleado.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.apellido?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
      empleado.legajo?.toLowerCase().includes(busqueda.toLowerCase());

    const coincideRol = !filtroRol || empleado.rol === filtroRol;
    const coincideEstado =
      !filtroEstado ||
      (filtroEstado === 'activo' && empleado.estado) ||
      (filtroEstado === 'inactivo' && !empleado.estado);

    return coincideBusqueda && coincideRol && coincideEstado;
  });

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'sucursal') {
      // Manejar selección de sucursal
      const sucursalSeleccionada = sucursales.find((s) => s.id === parseInt(value));
      setFormData((prev) => ({
        ...prev,
        sucursal: sucursalSeleccionada,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (errores.length > 0) {
      setErrores([]);
    }
  };

  // Enviar formulario de registro
  const handleSubmitRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrores([]);
    setLoadingForm(true);

    try {
      const datosLimpios = cleanFormData(formData);
      const erroresValidacion = validarFormularioEmpleado(datosLimpios);

      if (erroresValidacion.length > 0) {
        setErrores(erroresValidacion);
        setLoadingForm(false);
        return;
      }

      const registroDto = formDataToRegistroEmpleado(datosLimpios);
      const response = await registrarEmpleado(registroDto);

      // Agregar al estado global
      agregarEmpleado(response.empleado);

      mostrarNotificacion('Empleado registrado exitosamente', 'success');

      // Resetear formulario y cerrar modal
      resetearFormulario();
      setModalRegistro(false);
    } catch (error: any) {
      const mensaje = error.message ?? 'Error al registrar el empleado';
      setErrores([mensaje]);
      mostrarNotificacion(mensaje, 'error');
    } finally {
      setLoadingForm(false);
    }
  };

  // Cambiar estado del empleado (usando el provider)
  const handleCambiarEstado = async () => {
    if (!empleadoSeleccionado) return;
    try {
      await actualizarEstadoEmpleado(empleadoSeleccionado.id!, !empleadoSeleccionado.estado);
      mostrarNotificacion(
        `Empleado ${!empleadoSeleccionado.estado ? 'activado' : 'desactivado'} exitosamente`,
        'success'
      );
      setModalConfirm(false);
      setEmpleadoSeleccionado(null);
    } catch (error: any) {
      mostrarNotificacion(error.message ?? 'Error al cambiar estado del empleado', 'error');
      setModalConfirm(false);
    }
  };

  // Funciones auxiliares
  const resetearFormulario = () => {
    setFormData({
      nombre: '',
      apellido: '',
      telefono: '',
      email: '',
      password: '',
      confirmarPassword: '',
      rol: '',
      sucursal: undefined,
    });
    setErrores([]);
  };

  const cerrarModalRegistro = () => {
    if (!loadingForm) {
      resetearFormulario();
      setModalRegistro(false);
    }
  };

  // Función para abrir modal de ver detalles
  const handleVerDetalles = (empleado: EmpleadoDTO) => {
    setEmpleadoSeleccionado(empleado);
    setModalVer(true);
  };

  // Función para abrir modal de edición
  const handleEditarEmpleado = (empleado: EmpleadoDTO) => {
    setEmpleadoSeleccionado(empleado);
    setModalEditar(true);
  };

  // Sincronizar datos al abrir modal de edición
  useEffect(() => {
    if (modalEditar && empleadoSeleccionado) {
      setFormEditar({
        nombre: empleadoSeleccionado.nombre ?? '',
        apellido: empleadoSeleccionado.apellido ?? '',
        telefono: empleadoSeleccionado.telefono ?? '',
        email: empleadoSeleccionado.email ?? '',
        password: '',
        confirmarPassword: '',
        rol: (empleadoSeleccionado.rol as '' | Rol) ?? '',
        sucursal: empleadoSeleccionado.sucursal,
      });
    }
  }, [modalEditar, empleadoSeleccionado]);

  // Guardar cambios (simulado)
  const handleSubmitEditarEmpleado = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empleadoSeleccionado) return;
    try {
      // Convierte los domicilios a tipo Domicilio (modelo frontend)
      const domiciliosConvertidos = (empleadoSeleccionado.domicilios as any)?.map((d: any) => ({
        id: d.id,
        calle: d.calle,
        numero: d.numero ? Number(d.numero) : undefined,
        cp: d.cp,
        localidad: d.localidad ?? (d.localidadId ? { id: d.localidadId } : undefined),
        latitud: d.latitud,
        longitud: d.longitud,
      }));
      // Llama al provider con el tipo correcto
      await actualizarEmpleado(empleadoSeleccionado.id!, {
        empleadoId: empleadoSeleccionado.id!,
        nombre: formEditar.nombre,
        apellido: formEditar.apellido,
        telefono: formEditar.telefono,
        email: formEditar.email,
        domicilios: domiciliosConvertidos,
        rol: formEditar.rol as Rol,
        sucursalId: formEditar.sucursal?.id,
        estado: empleadoSeleccionado.estado,
      });
      mostrarNotificacion('Empleado actualizado correctamente', 'success');
      setModalEditar(false);
    } catch (error: any) {
      mostrarNotificacion(error.message ?? 'Error al actualizar el empleado', 'error');
    }
  };

  return (
    <div className="p-3 sm:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col w-full sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Empleados</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra los empleados del sistema</p>
        </div>
        <button
          onClick={() => setModalRegistro(true)}
          className="flex items-center justify-center gap-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-md hover:bg-primarydark transition-colors text-sm sm:text-base w-full sm:w-auto"
        >
          <IconoAgregar className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Registrar Nuevo Empleado</span>
          <span className="xs:hidden">Nuevo Empleado</span>
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid w-full grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{empleados.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Empleados</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {empleados.filter((e) => e.estado).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="text-lg sm:text-2xl font-bold text-yellow-600">
            {empleados.filter((e) => e.rol === Rol.CAJERO).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Cajeros</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {empleados.filter((e) => e.rol === Rol.COCINERO).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Cocineros</div>
        </div>
      </div>

      {/* Tabla Responsive siguiendo el patrón del proyecto */}
      <div className="w-full flex flex-col justify-center items-center space-y-2">
        {/* Barra de filtros */}
        <div className="w-full bg-white rounded-lg shadow-sm border p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Buscador */}
            <div className="flex-1 relative min-w-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Buscar por nombre, apellido, email o legajo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
              {/* Selector de rol */}
              <div className="w-full sm:w-40">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filtroRol}
                  onChange={(e) => setFiltroRol(e.target.value)}
                >
                  <option value="">Todos los roles</option>
                  <option value={Rol.CAJERO}>Cajero</option>
                  <option value={Rol.COCINERO}>Cocinero</option>
                  <option value={Rol.DELIVERY}>Delivery</option>
                </select>
              </div>

              {/* Selector de estado */}
              <div className="w-full sm:w-40">
                <select
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="text-sm text-gray-500 border-t pt-3">
            Mostrando {empleadosFiltrados.length} de {empleados.length} elementos
          </div>
        </div>

        {/* Tabla */}
        <div className="w-full bg-white rounded-lg shadow-sm border overflow-hidden">
          {loadingEmpleados ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-600">Cargando empleados...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      Empleado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 hidden sm:table-cell">
                      Legajo
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      Rol
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 hidden md:table-cell">
                      Sucursal
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 hidden lg:table-cell">
                      Email
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      Estado
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200 hidden md:table-cell">
                      Fecha Ingreso
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empleadosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <svg
                            className="h-12 w-12 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"
                            />
                          </svg>
                          <span className="text-lg font-medium">No se encontraron empleados</span>
                          <span className="text-sm">Intenta ajustar los filtros de búsqueda</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    empleadosFiltrados.map((empleado) => {
                      let rolClass = 'bg-gray-100 text-gray-800';
                      if (empleado.rol === Rol.CAJERO) rolClass = 'bg-blue-100 text-blue-800';
                      else if (empleado.rol === Rol.COCINERO)
                        rolClass = 'bg-green-100 text-green-800';
                      else if (empleado.rol === Rol.DELIVERY)
                        rolClass = 'bg-yellow-100 text-yellow-800';

                      return (
                        <tr
                          key={empleado.id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          {/* Columna Empleado - Siempre visible */}
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900 break-words">
                                {empleado.nombre} {empleado.apellido}
                              </div>
                              <div className="text-sm text-gray-500 break-words">
                                {empleado.telefono}
                              </div>
                              {/* Mostrar legajo en móvil */}
                              <div className="text-xs text-gray-400 sm:hidden mt-1">
                                {empleado.legajo ? `Legajo: ${empleado.legajo}` : ''}
                              </div>
                            </div>
                          </td>

                          {/* Columna Legajo - Oculta en móvil */}
                          <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                            <span className="text-sm text-gray-900">{empleado.legajo ?? '-'}</span>
                          </td>

                          {/* Columna Rol - Siempre visible */}
                          <td className="px-3 sm:px-6 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rolClass}`}
                            >
                              {getRolLabel(empleado.rol)}
                            </span>
                          </td>

                          {/* Columna Sucursal - Oculta en tablets y móviles */}
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-500">
                              {empleado.sucursal?.nombre ?? '-'}
                            </span>
                          </td>

                          {/* Columna Email - Oculta en tablets y móviles */}
                          <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                            <span className="text-sm text-gray-500 break-all">
                              {empleado.email}
                            </span>
                          </td>

                          {/* Columna Estado - Siempre visible */}
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex flex-col">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                                  empleado.estado
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {empleado.estado ? 'Activo' : 'Inactivo'}
                              </span>
                              {/* Mostrar email en móvil/tablet debajo del estado */}
                              <div className="text-xs text-gray-400 lg:hidden mt-1 break-all">
                                {empleado.email}
                              </div>
                            </div>
                          </td>

                          {/* Columna Fecha - Oculta en móvil */}
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                            <span className="text-sm text-gray-500">
                              {empleado.fechaIngreso
                                ? new Date(empleado.fechaIngreso).toLocaleDateString()
                                : '-'}
                            </span>
                          </td>

                          {/* Columna Acciones - Siempre visible */}
                          <td className="px-3 sm:px-6 py-4 text-center">
                            <div className="flex space-x-2 justify-center">
                              <button
                                onClick={() => handleVerDetalles(empleado)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <IconoVer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditarEmpleado(empleado)}
                                className="text-primary hover:text-primarydark"
                                title="Editar empleado"
                              >
                                <IconoEditar className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => abrirModalConfirm(empleado)}
                                className={`transition-colors ${
                                  empleado.estado
                                    ? 'text-red-600 hover:text-red-900'
                                    : 'text-green-600 hover:text-green-900'
                                }`}
                                title={empleado.estado ? 'Dar de baja' : 'Dar de alta'}
                              >
                                {empleado.estado ? (
                                  <IconoEliminar className="w-4 h-4" />
                                ) : (
                                  <IconoAgregar className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            {/* Mostrar fecha en móvil debajo del botón */}
                            <div className="text-xs text-gray-400 md:hidden">
                              {empleado.fechaIngreso
                                ? new Date(empleado.fechaIngreso).toLocaleDateString()
                                : '-'}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Registro */}
      {modalRegistro && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Registrar Nuevo Empleado</h2>
                <button
                  onClick={cerrarModalRegistro}
                  disabled={loadingForm}
                  className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                >
                  <IconoCerrar color="#6B7280" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRegistro} className="p-6">
              {/* Mostrar errores */}
              {errores.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <ul className="text-sm text-red-600 space-y-1">
                    {errores.map((error) => (
                      <li key={error}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="nombre">Nombre *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ingrese el nombre"
                  />
                </div>

                <div>
                  <label htmlFor="apellido">Apellido *</label>
                  <input
                    type="text"
                    id="apellido"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ingrese el apellido"
                  />
                </div>

                <div>
                  <label htmlFor="telefono">Teléfono *</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ingrese el teléfono"
                  />
                </div>

                <div>
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Ingrese el email"
                  />
                </div>

                <div>
                  <label htmlFor="rol">Rol *</label>
                  <select
                    id="rol"
                    name="rol"
                    value={formData.rol}
                    onChange={handleInputChange}
                    disabled={loadingForm}
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

                <div>
                  <label htmlFor="sucursal">Sucursal *</label>
                  <select
                    id="sucursal"
                    name="sucursal"
                    value={formData.sucursal?.id ?? ''}
                    onChange={handleInputChange}
                    disabled={loadingForm || loadingSucursales}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">
                      {loadingSucursales ? 'Cargando sucursales...' : 'Seleccione una sucursal'}
                    </option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="password">Contraseña Provisoria *</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Mínimo 8 caracteres con mayúscula, minúscula y símbolo"
                  />
                </div>

                <div>
                  <label htmlFor="confirmarPassword">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    id="confirmarPassword"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleInputChange}
                    disabled={loadingForm}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
                    placeholder="Confirme la contraseña"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={cerrarModalRegistro}
                  disabled={loadingForm}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingForm}
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primarydark rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingForm ? 'Registrando...' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      <ModalConfirm
        isOpen={modalConfirm}
        setIsOpen={setModalConfirm}
        onConfirm={handleCambiarEstado}
        title={`${empleadoSeleccionado?.estado ? 'Desactivar' : 'Activar'} Empleado`}
        message={`¿Estás seguro que deseas ${empleadoSeleccionado?.estado ? 'desactivar' : 'activar'} al empleado ${empleadoSeleccionado?.nombre} ${empleadoSeleccionado?.apellido}?`}
        confirmText={empleadoSeleccionado?.estado ? 'Desactivar' : 'Activar'}
      />

      {/* Modal de Ver Detalles */}
      {modalVer && empleadoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Detalles del Empleado</h2>
              <button
                onClick={() => setModalVer(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconoCerrar color="#6B7280" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <b>Nombre:</b> {empleadoSeleccionado.nombre}
              </div>
              <div>
                <b>Apellido:</b> {empleadoSeleccionado.apellido}
              </div>
              <div>
                <b>Email:</b> {empleadoSeleccionado.email}
              </div>
              <div>
                <b>Teléfono:</b> {empleadoSeleccionado.telefono}
              </div>
              <div>
                <b>Rol:</b> {getRolLabel(empleadoSeleccionado.rol)}
              </div>
              <div>
                <b>Sucursal:</b> {empleadoSeleccionado.sucursal?.nombre ?? '-'}
              </div>
              <div>
                <b>Legajo:</b> {empleadoSeleccionado.legajo ?? '-'}
              </div>
              <div>
                <b>Estado:</b> {empleadoSeleccionado.estado ? 'Activo' : 'Inactivo'}
              </div>
              <div>
                <b>Fecha de ingreso:</b>{' '}
                {empleadoSeleccionado.fechaIngreso
                  ? new Date(empleadoSeleccionado.fechaIngreso).toLocaleDateString()
                  : '-'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Editar Empleado */}
      {modalEditar && empleadoSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Editar Empleado</h2>
              <button
                onClick={() => setModalEditar(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <IconoCerrar color="#6B7280" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSubmitEditarEmpleado}>
              <div>
                <label htmlFor="nombre">Nombre *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.nombre}
                  onChange={(e) => setFormEditar((f) => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido">Apellido *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.apellido}
                  onChange={(e) => setFormEditar((f) => ({ ...f, apellido: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="telefono">Teléfono *</label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.telefono}
                  onChange={(e) => setFormEditar((f) => ({ ...f, telefono: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.email}
                  onChange={(e) => setFormEditar((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label htmlFor="rol">Rol *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.rol}
                  onChange={(e) =>
                    setFormEditar((f) => ({ ...f, rol: e.target.value as '' | Rol }))
                  }
                  required
                >
                  <option value="">Seleccione un rol</option>
                  {ROLES_EMPLEADO.map((rol) => (
                    <option key={rol.value} value={rol.value}>
                      {rol.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="sucursal">Sucursal *</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  value={formEditar.sucursal?.id ?? ''}
                  onChange={(e) =>
                    setFormEditar((f) => ({
                      ...f,
                      sucursal: sucursales.find((s) => s.id === parseInt(e.target.value)),
                    }))
                  }
                  required
                >
                  <option value="">Seleccione una sucursal</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.id} value={sucursal.id}>
                      {sucursal.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalEditar(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primarydark rounded-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

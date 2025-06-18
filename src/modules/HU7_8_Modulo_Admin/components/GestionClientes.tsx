import { useState, useEffect } from 'react';
import { ClienteDTO } from '../model';
import {
  obtenerTodosLosClientes,
  bajaLogicaCliente,
  altaCliente,
} from '../../../shared/services/clienteAdminService';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';
import { ModalConfirm } from '../../../shared/components/utils/ModalConfirm';
import { ModalEditarCliente } from './ModalEditarCliente';
import { TablaClientes } from './TablaClientes';

export const GestionClientes = () => {
  const [clientes, setClientes] = useState<ClienteDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteDTO | null>(null);

  const { mostrarNotificacion } = useNotificacion();

  // Cargar clientes al montar el componente
  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const clientesData = await obtenerTodosLosClientes();
      setClientes(clientesData);
    } catch (error: any) {
      mostrarNotificacion(error.message || 'Error al cargar clientes', 'error');
      console.error('Error al cargar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para abrir modal de confirmación
  const abrirModalConfirm = (cliente: ClienteDTO) => {
    setClienteSeleccionado(cliente);
    setModalConfirm(true);
  };

  // Función para abrir modal de edición
  const abrirModalEditar = (cliente: ClienteDTO) => {
    setClienteSeleccionado(cliente);
    setModalEditar(true);
  };

  // Función para abrir modal de detalles
  const abrirModalDetalles = (cliente: ClienteDTO) => {
    setClienteSeleccionado(cliente);
    setModalDetalles(true);
  };

  // Manejar actualización de cliente
  const handleClienteActualizado = (clienteActualizado: ClienteDTO) => {
    setClientes((prev) =>
      prev.map((cliente) => (cliente.id === clienteActualizado.id ? clienteActualizado : cliente))
    );
  };

  // Cambiar estado del cliente
  const handleCambiarEstado = async () => {
    if (!clienteSeleccionado?.id) return;

    try {
      if (clienteSeleccionado.estado) {
        await bajaLogicaCliente(clienteSeleccionado.id);
        mostrarNotificacion('Cliente dado de baja exitosamente', 'success');
      } else {
        await altaCliente(clienteSeleccionado.id);
        mostrarNotificacion('Cliente dado de alta exitosamente', 'success');
      }

      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === clienteSeleccionado.id ? { ...cliente, estado: !cliente.estado } : cliente
        )
      );
      setModalConfirm(false);
      setClienteSeleccionado(null);
    } catch (error: any) {
      mostrarNotificacion(error.message || 'Error al cambiar estado del cliente', 'error');
      setModalConfirm(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 w-full">
      {/* Header */}
      <div className="flex flex-col w-full sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p className="text-gray-600 text-sm sm:text-base">Administra los clientes del sistema</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="text-lg sm:text-2xl font-bold text-blue-600">{clientes.length}</div>
          <div className="text-xs sm:text-sm text-gray-600">Total Clientes</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="text-lg sm:text-2xl font-bold text-green-600">
            {clientes.filter((c) => c.estado).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Activos</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-red-500">
          <div className="text-lg sm:text-2xl font-bold text-red-600">
            {clientes.filter((c) => !c.estado).length}
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Inactivos</div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="text-lg sm:text-2xl font-bold text-purple-600">
            {
              clientes.filter(
                (c) =>
                  c.fechaRegistro &&
                  new Date(c.fechaRegistro) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              ).length
            }
          </div>
          <div className="text-xs sm:text-sm text-gray-600">Nuevos (30 días)</div>
        </div>
      </div>

      {/* Tabla de clientes */}
      <TablaClientes
        clientes={clientes}
        loading={loading}
        onEditarCliente={abrirModalEditar}
        onEliminarCliente={abrirModalConfirm}
        onVerDetalles={abrirModalDetalles}
      />

      {/* Modal de edición */}
      <ModalEditarCliente
        isOpen={modalEditar}
        setIsOpen={setModalEditar}
        cliente={clienteSeleccionado}
        onClienteActualizado={handleClienteActualizado}
      />

      {/* Modal de confirmación */}
      <ModalConfirm
        isOpen={modalConfirm}
        setIsOpen={setModalConfirm}
        onConfirm={handleCambiarEstado}
        title={clienteSeleccionado?.estado ? 'Dar de baja cliente' : 'Dar de alta cliente'}
        message={`¿Estás seguro que deseas ${
          clienteSeleccionado?.estado ? 'dar de baja' : 'dar de alta'
        } al cliente ${clienteSeleccionado?.nombre} ${clienteSeleccionado?.apellido}?`}
        confirmText={clienteSeleccionado?.estado ? 'Dar de Baja' : 'Dar de Alta'}
      />

      {/* Modal de detalles */}
      {modalDetalles && clienteSeleccionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Cliente</h2>
                <button
                  onClick={() => setModalDetalles(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
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
                      <div className="mt-1 text-sm text-gray-900">{clienteSeleccionado.nombre}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Apellido</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {clienteSeleccionado.apellido}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 text-sm text-gray-900">{clienteSeleccionado.email}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {clienteSeleccionado.telefono || 'No especificado'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Estado</label>
                      <div className="mt-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            clienteSeleccionado.estado
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {clienteSeleccionado.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setModalDetalles(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

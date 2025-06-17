import { useState, useEffect } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import { updateCliente } from '../../../shared/services/clienteService';
import { getLocalidades } from '../../../shared/services/localidadService';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import IconoUbicacion from '../../../assets/svgs/icons/IconoUbicacion';
import MapaInteractivo from '../../HU11_12_Carrito_Confirmacion/MapaInteractivo';
import { ModalConfirm } from '../../../shared/components/utils/ModalConfirm';

interface Provincia {
  id: number;
  nombre: string;
}

interface Localidad {
  id: number;
  nombre: string;
  provincia: Provincia;
}

interface Domicilio {
  id?: number;
  calle: string;
  numero: string;
  cp: string;
  localidad: Localidad;
  latitud?: number;
  longitud?: number;
}

interface FormData {
  calle: string;
  numero: string;
  cp: string;
  localidad?: Localidad;
  latitud?: number;
  longitud?: number;
}

export const MisDirecciones = () => {
  const { user, setUser } = useUser();
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomicilio, setEditingDomicilio] = useState<Domicilio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    calle: '',
    numero: '',
    cp: '',
    localidad: undefined,
    latitud: undefined,
    longitud: undefined,
  });
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<number | undefined>(
    user?.domicilios && user.domicilios.length > 0 ? user.domicilios[0].id : undefined
  );
  const [modalConfirmOpen, setModalConfirmOpen] = useState(false);
  const [domicilioAEliminar, setDomicilioAEliminar] = useState<number | null>(null);

  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const data = await getLocalidades();
        setLocalidades(data);
      } catch (error) {
        console.error('Error al cargar localidades:', error);
        setError('Error al cargar las localidades');
      }
    };
    cargarLocalidades();
  }, []);

  useEffect(() => {
    if (user?.domicilios && user.domicilios.length > 0) {
      setDireccionSeleccionada(user.domicilios[0].id);
    }
  }, [user?.domicilios]);

  const handleOpenModal = (domicilio?: Domicilio) => {
    if (domicilio) {
      setEditingDomicilio(domicilio);
      setFormData({
        calle: domicilio.calle || '',
        numero: String(domicilio.numero ?? ''),
        cp: domicilio.cp || '',
        localidad: domicilio.localidad || {
          id: 0,
          nombre: '',
          provincia: { id: 0, nombre: '', pais: { id: 0, nombre: '' } },
        },
        latitud: domicilio.latitud,
        longitud: domicilio.longitud,
      });
    } else {
      setEditingDomicilio(null);
      setFormData({
        calle: '',
        numero: '',
        cp: '',
        localidad: undefined,
        latitud: undefined,
        longitud: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !formData.localidad) return;

    try {
      const domicilioToSend = {
        calle: formData.calle,
        numero: formData.numero,
        cp: formData.cp,
        localidad: {
          id: formData.localidad.id,
        },
        latitud: formData.latitud,
        longitud: formData.longitud,
      };

      const currentDomicilios = [...(user.domicilios || [])];
      let updatedDomicilios;

      if (editingDomicilio) {
        // Si estamos editando, reemplazamos el domicilio existente
        updatedDomicilios = currentDomicilios.map((d) =>
          d.id === editingDomicilio.id ? { ...domicilioToSend, id: d.id } : d
        );
      } else {
        // Si es nuevo, lo agregamos a la lista
        updatedDomicilios = [...currentDomicilios, domicilioToSend];
      }

      // Enviamos la lista completa actualizada al backend
      const response = await updateCliente(user.id, { domicilios: updatedDomicilios });
      setUser(response);
      setIsModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error al guardar dirección:', error);
      setError('Error al guardar la dirección');
    }
  };

  const handleDelete = async (id: number) => {
    if (!user?.id) return;
    try {
      // Filtramos el domicilio a eliminar
      const updatedDomicilios = user.domicilios?.filter((d) => d.id !== id) || [];
      // Enviamos la lista actualizada al backend
      const response = await updateCliente(user.id, { domicilios: updatedDomicilios });
      setUser(response);
      setError(null);
    } catch (error) {
      console.error('Error al eliminar dirección:', error);
      setError('Error al eliminar la dirección');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Mis Direcciones</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primarydark transition-colors"
        >
          <IconoAgregar className="w-5 h-5" />
          Agregar Dirección
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {user?.domicilios && user.domicilios.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">
            Selecciona tu dirección de entrega principal:
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            value={direccionSeleccionada}
            onChange={(e) => {
              setDireccionSeleccionada(Number(e.target.value));
              localStorage.setItem('direccionPrincipalId', e.target.value);
            }}
          >
            {user.domicilios.map((dom) => (
              <option key={dom.id} value={dom.id}>
                {dom.calle} {dom.numero} - {dom.localidad?.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {user?.domicilios && user.domicilios.length > 0 && direccionSeleccionada && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-400 rounded">
          <div className="font-semibold mb-1">Dirección de entrega seleccionada:</div>
          <div>
            {(() => {
              const dom = user.domicilios.find((d) => d.id === direccionSeleccionada);
              if (!dom) return null;
              return (
                <span>
                  {dom.calle} {dom.numero}, CP: {dom.cp} - {dom.localidad?.nombre},{' '}
                  {dom.localidad?.provincia.nombre}
                </span>
              );
            })()}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {user?.domicilios?.map((domicilio) => (
          <div
            key={domicilio.id}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <IconoUbicacion />
              <div>
                <p className="font-medium">
                  {domicilio.calle} {domicilio.numero}
                </p>
                <p className="text-sm text-gray-600">
                  CP: {domicilio.cp}
                  {domicilio.localidad
                    ? ` - ${domicilio.localidad.nombre}, ${domicilio.localidad.provincia.nombre}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleOpenModal({
                    ...domicilio,
                    calle: domicilio.calle || '',
                    numero: String(domicilio.numero ?? ''),
                    cp: domicilio.cp || '',
                    localidad: domicilio.localidad || {
                      id: 0,
                      nombre: '',
                      provincia: { id: 0, nombre: '', pais: { id: 0, nombre: '' } },
                    },
                  })
                }
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <IconoEditar className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={() => {
                  setDomicilioAEliminar(domicilio.id!);
                  setModalConfirmOpen(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <IconoEliminar className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md sm:max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingDomicilio ? 'Editar' : 'Agregar'} Dirección
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Calle</label>
                <input
                  type="text"
                  value={formData.calle}
                  onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Número</label>
                <input
                  type="text"
                  value={String(formData.numero)}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Código Postal</label>
                <input
                  type="text"
                  value={formData.cp}
                  onChange={(e) => setFormData({ ...formData, cp: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Localidad</label>
                <select
                  value={formData.localidad?.id || ''}
                  onChange={(e) => {
                    const localidad = localidades.find((l) => l.id === Number(e.target.value));
                    setFormData({ ...formData, localidad });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Seleccione una localidad</option>
                  {localidades.map((localidad) => (
                    <option key={localidad.id} value={localidad.id}>
                      {localidad.nombre}, {localidad.provincia.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación en el mapa</label>
                <MapaInteractivo
                  onUbicacionSeleccionada={(lat, lng) => {
                    setFormData((prev) => ({ ...prev, latitud: lat, longitud: lng }));
                  }}
                  ubicacionActual={
                    formData.latitud && formData.longitud
                      ? { lat: formData.latitud, lng: formData.longitud }
                      : undefined
                  }
                />
                <div className="text-xs text-gray-500 mt-1">
                  Selecciona la ubicación exacta de la dirección en el mapa.
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primarydark transition-colors"
                >
                  {editingDomicilio ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar dirección */}
      <ModalConfirm
        isOpen={modalConfirmOpen}
        setIsOpen={setModalConfirmOpen}
        onConfirm={() => {
          if (domicilioAEliminar) handleDelete(domicilioAEliminar);
          setModalConfirmOpen(false);
        }}
        title="Eliminar dirección"
        message="¿Estás seguro que deseas eliminar esta dirección?"
        confirmText="Eliminar"
      />
    </div>
  );
};

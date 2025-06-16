import { useState, useEffect } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import { updateCliente } from '../../../shared/services/clienteService';
import { getLocalidades } from '../../../shared/services/localidadService';
import IconoAgregar from '../../../assets/svgs/icons/IconoAgregar';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoEliminar from '../../../assets/svgs/icons/IconoEliminar';
import IconoUbicacion from '../../../assets/svgs/icons/IconoUbicacion';

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
}

interface FormData {
  calle: string;
  numero: string;
  cp: string;
  localidad?: Localidad;
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
    localidad: undefined
  });

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

  const handleOpenModal = (domicilio?: Domicilio) => {
    if (domicilio) {
      setEditingDomicilio(domicilio);
      setFormData({
        calle: domicilio.calle,
        numero: domicilio.numero,
        cp: domicilio.cp,
        localidad: domicilio.localidad
      });
    } else {
      setEditingDomicilio(null);
      setFormData({
        calle: '',
        numero: '',
        cp: '',
        localidad: undefined
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
          id: formData.localidad.id
        }
      };

      const currentDomicilios = [...(user.domicilios || [])];
      let updatedDomicilios;

      if (editingDomicilio) {
        // Si estamos editando, reemplazamos el domicilio existente
        updatedDomicilios = currentDomicilios.map(d => 
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
    if (!user?.id || !window.confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
      // Filtramos el domicilio a eliminar
      const updatedDomicilios = user.domicilios?.filter(d => d.id !== id) || [];
      
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

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {user?.domicilios?.map((domicilio) => (
          <div
            key={domicilio.id}
            className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <IconoUbicacion className="w-6 h-6 text-primary" />
              <div>
                <p className="font-medium">
                  {domicilio.calle} {domicilio.numero}
                </p>
                <p className="text-sm text-gray-600">
                  CP: {domicilio.cp} - {domicilio.localidad.nombre},{' '}
                  {domicilio.localidad.provincia.nombre}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleOpenModal(domicilio)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <IconoEditar className="w-5 h-5 text-primary" />
              </button>
              <button
                onClick={() => domicilio.id && handleDelete(domicilio.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                  value={formData.numero}
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
                    const localidad = localidades.find(
                      (l) => l.id === Number(e.target.value)
                    );
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
    </div>
  );
}; 
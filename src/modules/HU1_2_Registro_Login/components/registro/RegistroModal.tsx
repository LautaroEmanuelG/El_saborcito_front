import { useState, useEffect } from 'react';
import { registrarCliente } from '../../../../shared/services/authService';
import { getLocalidades } from '../../../../shared/services/localidadService';
import { isValidEmail, isValidPassword } from '../../logic';
import { RegistroCliente, Domicilio, Localidad } from '../../models';
import { useUser } from '../../../../shared/providers/UserProvider';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotificacion } from '../../../../shared/hooks/useNotificacion';
import MapaInteractivo from '../../../HU11_12_Carrito_Confirmacion/MapaInteractivo';

interface RegistroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistroModal = ({ isOpen, onClose }: RegistroModalProps) => {
  const [formData, setFormData] = useState<RegistroCliente>({
    nombre: '',
    apellido: '',
    telefono: '',
    email: '',
    password: '',
    confirmarPassword: '',
    fechaNacimiento: '',
    domicilios: [],
    esAuth0: false,
  });

  const [domicilio, setDomicilio] = useState<Domicilio>({
    calle: '',
    numero: undefined,
    cp: '',
    localidad: undefined,
  });
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useUser();
  const { mostrarNotificacion } = useNotificacion();

  useEffect(() => {
    if (!isOpen) return;
    const cargarLocalidades = async () => {
      try {
        const data = await getLocalidades();
        setLocalidades(data);
      } catch (error) {
        console.error('Error al cargar localidades:', error);
      }
    };
    cargarLocalidades();
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'localidad') {
      const localidadSeleccionada = localidades.find((l) => l.id === Number(value));
      setDomicilio((prev) => ({
        ...prev,
        localidad: localidadSeleccionada,
      }));
    } else {
      setDomicilio((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  const { loginWithRedirect } = useAuth0();
  // Placeholder para registro con Google
  const handleGoogleRegister = async () => {
    // Aquí irá la integración con Google Auth
    await loginWithRedirect();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validaciones
      if (
        !formData.nombre ||
        !formData.apellido ||
        !formData.email ||
        !formData.password ||
        !formData.confirmarPassword
      ) {
        throw new Error('Todos los campos marcados con * son obligatorios');
      }
      if (!isValidEmail(formData.email)) {
        throw new Error('El formato del email no es válido');
      }
      if (formData.password !== formData.confirmarPassword) {
        throw new Error('Las contraseñas no coinciden');
      }
      if (!isValidPassword(formData.password)) {
        throw new Error(
          'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
        );
      }
      // Si hay datos de domicilio, los agregamos al formData
      if (domicilio.calle && domicilio.numero && domicilio.localidad) {
        formData.domicilios = [domicilio];
      }
      // Llamada al servicio de registro
      const response = await registrarCliente(formData);
      // Guardar usuario en contexto global
      setUser(response.usuario || response);
      mostrarNotificacion('¡Registro exitoso!', 'success');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (error: any) {
      const backendMsg = error.response?.data?.message;
      if (backendMsg) {
        setError(backendMsg);
        mostrarNotificacion(backendMsg, 'error');
      } else if (typeof error.message === 'string') {
        setError(error.message);
        mostrarNotificacion(error.message, 'error');
      } else {
        setError('Error al registrar el usuario');
        mostrarNotificacion('Error al registrar el usuario', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[700px] max-h-[90vh] overflow-y-auto shadow-lg relative p-8">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-negro">Registro de Cliente</h2>
        {/* Botón Google */}
        <button
          onClick={handleGoogleRegister}
          className="w-full mb-6 bg-blanco border border-gris text-negro py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary transition"
          type="button"
        >
          <img src="/img/google-icon.png" alt="Google" className="w-5 h-5" />
          <span className="font-medium">Registrarse con Google</span>
        </button>
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gris"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-blanco text-gris">O regístrate con email</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-negro text-sm font-bold mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-negro text-sm font-bold mb-2">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-negro text-sm font-bold mb-2">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-negro text-sm font-bold mb-2">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-negro text-sm font-bold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="block text-negro text-sm font-bold mb-2">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-sm text-gris mt-1">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo
            </p>
          </div>
          <div>
            <label className="block text-negro text-sm font-bold mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          {/* Sección de Domicilio */}
          <div className="border-t border-gris pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4 text-negro">Domicilio (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-negro text-sm font-bold mb-2">Calle</label>
                <input
                  type="text"
                  name="calle"
                  value={domicilio.calle}
                  onChange={handleDomicilioChange}
                  className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-negro text-sm font-bold mb-2">Número</label>
                <input
                  type="number"
                  name="numero"
                  value={domicilio.numero}
                  onChange={handleDomicilioChange}
                  className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-negro text-sm font-bold mb-2">Código Postal</label>
              <input
                type="text"
                name="cp"
                value={domicilio.cp}
                onChange={handleDomicilioChange}
                className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mt-4">
              <label className="block text-negro text-sm font-bold mb-2">Localidad</label>
              <select
                name="localidad"
                value={domicilio.localidad?.id || ''}
                onChange={handleDomicilioChange}
                className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccione una localidad</option>
                {localidades.map((localidad) => (
                  <option key={localidad.id} value={localidad.id}>
                    {localidad.nombre}, {localidad.provincia.nombre}
                  </option>
                ))}
              </select>
            </div>
            {/* Mapa para seleccionar ubicación */}
            <div className="mt-4">
              <label className="block text-negro text-sm font-bold mb-2">
                Ubicación en el mapa
              </label>
              <MapaInteractivo
                onUbicacionSeleccionada={(lat: number, lng: number) => {
                  setDomicilio((prev) => ({ ...prev, latitud: lat, longitud: lng }));
                }}
                ubicacionActual={
                  domicilio.latitud && domicilio.longitud
                    ? { lat: domicilio.latitud, lng: domicilio.longitud }
                    : undefined
                }
              />
              <div className="text-xs text-gray-500 mt-1">
                Selecciona la ubicación exacta de tu domicilio en el mapa.
              </div>
            </div>
          </div>
          {error && <div className="text-primary text-sm mt-2">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-primary text-blanco py-2 rounded-lg cursor-pointer ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

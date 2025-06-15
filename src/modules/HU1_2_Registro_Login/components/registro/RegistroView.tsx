import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../../../shared/services/authService';
import { getLocalidades } from '../../../../shared/services/localidadService';
import { isValidEmail, isValidPassword } from '../../logic';
import { RegistroCliente, Domicilio, Localidad } from '../../models';

export const RegistroView = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const data = await getLocalidades();
        setLocalidades(data);
      } catch (error) {
        console.error('Error al cargar localidades:', error);
      }
    };

    cargarLocalidades();
  }, []);

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
      console.log('Registro exitoso:', response);

      // Redirección a la página principal
      navigate('/');
    } catch (error: any) {
      console.error('Error en el registro:', error);
      setError(error.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Implementar login con Google
    console.log('Login con Google');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Registro de Cliente</h2>

        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50"
        >
          <img src="/google-icon.png" alt="Google" className="w-6 h-6 mr-2" />
          Registrarse con Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">O regístrate con email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Nombre *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Apellido *</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un símbolo
            </p>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Confirmar Contraseña *
            </label>
            <input
              type="password"
              name="confirmarPassword"
              value={formData.confirmarPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Sección de Domicilio */}
          <div className="border-t pt-4 mt-4">
            <h3 className="text-lg font-semibold mb-4">Domicilio (Opcional)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Calle</label>
                <input
                  type="text"
                  name="calle"
                  value={domicilio.calle}
                  onChange={handleDomicilioChange}
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Número</label>
                <input
                  type="number"
                  name="numero"
                  value={domicilio.numero}
                  onChange={handleDomicilioChange}
                  className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Código Postal</label>
              <input
                type="text"
                name="cp"
                value={domicilio.cp}
                onChange={handleDomicilioChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Localidad</label>
              <select
                name="localidad"
                value={domicilio.localidad?.id || ''}
                onChange={handleDomicilioChange}
                className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seleccione una localidad</option>
                {localidades.map((localidad) => (
                  <option key={localidad.id} value={localidad.id}>
                    {localidad.nombre}, {localidad.provincia.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-[#E11D48] text-white py-2 rounded-lg cursor-pointer ${
              loading ? 'opacity-50' : ''
            }`}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <span>¿Ya tenés cuenta? </span>
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-semibold hover:underline"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

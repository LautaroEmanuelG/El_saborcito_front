import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarCliente } from '../../../../shared/services/authService';
import { isValidEmail, isValidPassword } from '../../logic';
import { RegistroCliente, Domicilio } from '../../models';

type RegistroModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const RegistroModal = ({ isOpen, onClose }: RegistroModalProps) => {
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

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDomicilioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDomicilio((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      if (domicilio.calle && domicilio.numero) {
        formData.domicilios = [domicilio];
      }

      // Llamada al servicio de registro
      const response = await registrarCliente(formData);
      console.log('Registro exitoso:', response);

      // Redirección a la página principal
      navigate('/');
      onClose();
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

        <h2 className="text-2xl font-bold mb-6">Registro de Cliente</h2>

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
            onClick={() => {
              onClose();
              navigate('/login');
            }}
            className="text-primary font-semibold hover:underline"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

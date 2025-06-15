import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginManual } from '../../../../shared/services/authService';
import emailjs from 'emailjs-com';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: number;
    if (isBlocked && blockTime > 0) {
      timer = setInterval(() => {
        setBlockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBlocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBlocked, blockTime]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      console.log('Intentando login con:', { email, contraseña });
      const response = await loginManual({ email, password: contraseña });
      console.log('Respuesta del servidor:', response);

      const { token, usuario } = response;

      // Guardar en localStorage (puedes mover esto luego a UserContext)
      localStorage.setItem('token', token);
      localStorage.setItem('rol', usuario.rol);
      localStorage.setItem('nombre', usuario.nombre);

      // Redirección según rol
      if (usuario.rol === 'ADMIN') {
        navigate('/admin/historial');
      } else {
        navigate('/');
      }

      onClose();
    } catch (error: any) {
      console.error('Error detallado en el login:', error);
      console.error('Respuesta del servidor:', error.response?.data);
      console.error('Status del error:', error.response?.status);

      if (error.response?.status === 403) {
        setError('Este usuario está dado de baja.');
      } else {
        setError('Credenciales inválidas.');
      }

      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= 3) {
        setIsBlocked(true);
        setBlockTime(30);
        sendEmail();
      }
    }
  };

  const sendEmail = () => {
    const templateParams = {
      to_name: 'Profesor',
      message: 'Intentos fallidos de inicio de sesión en la aplicación.',
    };

    emailjs
      .send('service_knm7iv4', 'template_8m66sol', templateParams, '5YeDDYePK2xnzByFN')
      .then((response) => {
        console.log('Correo enviado', response);
      })
      .catch((error) => {
        console.error('Error al enviar correo', error);
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[700px] h-[430px] shadow-lg relative p-8">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Usuario</label>
          <input
            type="text"
            placeholder="Ingresa tu usuario"
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            disabled={isBlocked}
          />
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <button
          className={`w-full bg-[#E11D48] text-white py-2 rounded-lg cursor-pointer ${isBlocked ? 'opacity-50' : ''}`}
          onClick={handleLogin}
          disabled={isBlocked}
        >
          {isBlocked ? `Bloqueado (${blockTime}s)` : 'Ingresar'}
        </button>

        <div className="mt-4 text-center">
          <span>¿No tenés cuenta? </span>
          <button
            onClick={() => {
              onClose();
              navigate('/registro', { replace: true });
            }}
            className="text-primary font-semibold hover:underline"
          >
            Registrate
          </button>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginManual } from '../../../../shared/services/authService';
import { useUser } from '../../../../shared/providers/UserProvider';
import emailjs from 'emailjs-com';
import { useAuth0 } from '@auth0/auth0-react';
import { useNotificacion } from '../../../../shared/hooks/useNotificacion';
import { isValidEmail, isValidPassword } from '../../logic';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegistro: () => void;
}

export const LoginModal = ({ isOpen, onClose, onOpenRegistro }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const navigate = useNavigate();
  const { setUser } = useUser();
  const { loginWithRedirect } = useAuth0();
  const { mostrarNotificacion } = useNotificacion();

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
    // Validaciones antes de enviar al backend
    if (!email.trim()) {
      setError('El email es obligatorio');
      mostrarNotificacion('El email es obligatorio', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      setError('El formato del email no es válido');
      mostrarNotificacion('El formato del email no es válido', 'error');
      return;
    }

    if (!contraseña.trim()) {
      setError('La contraseña es obligatoria');
      mostrarNotificacion('La contraseña es obligatoria', 'error');
      return;
    }

    if (!isValidPassword(contraseña)) {
      setError(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo'
      );
      mostrarNotificacion(
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un símbolo',
        'error'
      );
      return;
    }

    try {
      const response = await loginManual({ email, password: contraseña });
      const { token, usuario } = response;
      localStorage.setItem('token', token);
      setUser(usuario);
      mostrarNotificacion('¡Login exitoso!', 'success');
      if (usuario.rol === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      onClose();
    } catch (error: any) {
      setError(error.message ?? 'Error en el servidor. Intente nuevamente.');
      mostrarNotificacion(error.message ?? 'Error en el servidor. Intente nuevamente.', 'error');
      setAttempts((prev) => prev + 1);
      if (attempts + 1 >= 3) {
        setIsBlocked(true);
        setBlockTime(30);
        sendEmail();
      }
    }
  };

  const handleGoogleLogin = async () => {
    // Solo login con Auth0, sin argumentos para máxima compatibilidad
    await loginWithRedirect();
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
      <div className="bg-white rounded-lg w-[700px] max-h-[90vh] overflow-y-auto shadow-lg relative p-8">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>
        <h2 className="text-2xl font-bold mb-6 text-negro">Iniciar Sesión</h2>
        {/* Botón Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 bg-blanco border border-gris text-negro py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary transition"
          type="button"
        >
          <img src="/img/google-icon.png" alt="Google" className="w-5 h-5" />
          <span className="font-medium">Iniciar sesión con Google</span>
        </button>
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gris"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-blanco text-gris">O inicia sesión con email</span>
          </div>
        </div>
        <div className="mb-4">
          <label htmlFor="login-usuario" className="block text-negro text-sm font-bold mb-2">
            Usuario
          </label>
          <input
            id="login-usuario"
            type="text"
            placeholder="Ingresa tu usuario"
            className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="login-password" className="block text-negro text-sm font-bold mb-2">
            Contraseña
          </label>
          <input
            id="login-password"
            type="password"
            placeholder="Ingresa tu contraseña"
            className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            disabled={isBlocked}
          />
        </div>
        {error && <p className="text-primary mb-4">{error}</p>}
        <button
          className={`w-full bg-primary text-blanco py-2 rounded-lg cursor-pointer ${isBlocked ? 'opacity-50' : ''}`}
          onClick={handleLogin}
          disabled={isBlocked}
        >
          {isBlocked ? `Bloqueado (${blockTime}s)` : 'Ingresar'}
        </button>
        <div className="mt-4 text-center">
          <span className="text-negro">¿No tenés cuenta? </span>
          <button
            onClick={() => {
              onClose();
              onOpenRegistro();
            }}
            className="text-primary font-semibold hover:underline"
          >
            Registrate
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-gris">
          <p>
            ¿Eres empleado?{' '}
            <span className="text-primary font-medium">Usa el acceso de empleados en el menú</span>
          </p>
        </div>
      </div>
    </div>
  );
};

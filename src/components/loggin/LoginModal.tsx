import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../../utils/services/axios/loginService';

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
    if (isBlocked) {
      const timer = setInterval(() => {
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
  }, [isBlocked]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      const response = await loginUsuario(email, contraseña);
      console.log('Login exitoso:', response);

      // Extraer el rol del usuario de la respuesta
      const rolMatch = response.match(/Rol: (\w+)/);
      const rol = rolMatch ? rolMatch[1] : null;

      if (rol) {
        // Guardar el rol en el localStorage
        localStorage.setItem('rol', rol);

        // Redirigir a /admin
        navigate('/admin/historial');
      }

      onClose();
    } catch (error) {
      console.error('Error en el login:', error);
      setError('Credenciales inválidas.');
      setAttempts((prev) => prev + 1);

      if (attempts + 1 >= 3) {
        setIsBlocked(true);
        setBlockTime(30);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[700px] h-[370px] shadow-lg relative p-8">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}>
          X
        </button>
        <h2 className="text-2xl font-bold mb-6">Iniciar Sesión</h2>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Usuario
          </label>
          <input
            type="text"
            placeholder="Ingresa tu usuario"
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contraseña
          </label>
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
          disabled={isBlocked}>
            Ingresar {isBlocked && <span className="text-white mb-4">{blockTime}</span>}
        </button>
      </div>
    </div>
  );
};
import { useState } from 'react';
import { loginUsuario } from '../../utils/services/axios/loginService';
import { useNavigate } from 'react-router-dom';

type LoginModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = async () => {
    try {
      const response = await loginUsuario(email, contraseña);
      // Suponiendo que `response.success` indica si el login fue exitoso
      console.log(response)
      if (response.success) {
        navigate("/admin");
      } else {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.");
      }
    } catch (error) {
      setError("Hubo un problema con el inicio de sesión. Intenta más tarde.");
      console.error("Error en login:", error);
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
            Mail
          </label>
          <input
            type="text"
            placeholder="Ingresa tu mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contraseña
          </label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          className="w-full bg-[#E11D48] text-white py-2 rounded-lg hover:bg-[#BE123C]"
          onClick={handleLogin}>
          Ingresar
        </button>
      </div>
    </div>
  );
};

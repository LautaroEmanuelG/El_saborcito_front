import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  cambiarContraseñaEmpleado,
  loginEmpleado,
  validarLoginEmpleado,
  validarNuevaContraseña,
} from '../logic';
import { EstadoLoginEmpleado, type Empleado } from '../model';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
import emailjs from 'emailjs-com';
import { loginAdmin } from '../../../shared/services/authService';

interface LoginEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginEmpleadoModal = ({ isOpen, onClose }: LoginEmpleadoModalProps) => {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [error, setError] = useState('');
  const [estado, setEstado] = useState<EstadoLoginEmpleado>(EstadoLoginEmpleado.INICIAL);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);
  const [empleadoTemp, setEmpleadoTemp] = useState<Empleado | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();
  const { setEmpleado } = useEmpleado();

  useEffect(() => {
    let timer: number;
    if (isBlocked && blockTime > 0) {
      timer = setInterval(() => {
        setBlockTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBlocked(false);
            setAttempts(0);
            setEstado(EstadoLoginEmpleado.INICIAL);
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
      setEstado(EstadoLoginEmpleado.AUTENTICANDO);
      setError('');

      // Validaciones
      const errorValidacion = validarLoginEmpleado({ email, password: contraseña });
      if (errorValidacion) {
        setError(errorValidacion);
        setEstado(EstadoLoginEmpleado.ERROR);
        return;
      }

      if (isAdmin) {
        // Login como admin - usar endpoint /admin/login
        try {
          const response = await loginAdmin({ email, password: contraseña });
          if (response.token && response.usuario) {
            localStorage.setItem('empleadoToken', response.token);
            setEmpleado(response.usuario);
            navigate('/admin');
            onClose();
            return;
          }
        } catch (adminError: any) {
          setError('No tienes permisos de administrador o credenciales incorrectas');
          setEstado(EstadoLoginEmpleado.ERROR);
          return;
        }
      } else {
        // Login como empleado - usar endpoint /empleados/login/manual
        try {
          const response = await loginEmpleado({ email, password: contraseña });

          if (response.cambioRequerido) {
            setEstado(EstadoLoginEmpleado.CAMBIO_CONTRASEÑA);
            setEmpleadoTemp(response.empleado);
          } else {
            setEstado(EstadoLoginEmpleado.EXITOSO);
            if (response.token) {
              localStorage.setItem('empleadoToken', response.token);
              setEmpleado(response.empleado);
              // Redirigir según el rol de empleado
              switch (response.empleado.rol) {
                case 'CAJERO':
                  navigate('/admin/recepcion');
                  break;
                case 'COCINERO':
                  navigate('/admin/cocina');
                  break;
                case 'DELIVERY':
                  navigate('/admin/delivery');
                  break;
                default:
                  navigate('/admin');
              }
            }
            onClose();
          }
        } catch (empleadoError: any) {
          setError(
            empleadoError.message ||
              'Este usuario no es un empleado. Use el checkbox "¿Eres admin?" si es administrador.'
          );
          setEstado(EstadoLoginEmpleado.ERROR);
          return;
        }
      }
    } catch (error: any) {
      setError(error.message || 'Error en el servidor. Intente nuevamente.');
      setEstado(EstadoLoginEmpleado.ERROR);
      setAttempts((prev) => prev + 1);
      if (attempts + 1 >= 3) {
        setIsBlocked(true);
        setBlockTime(30);
        setEstado(EstadoLoginEmpleado.BLOQUEADO);
        sendEmail();
      }
    }
  };

  const handleCambiarContraseña = async () => {
    try {
      setError('');

      const errorValidacion = validarNuevaContraseña(nuevaContraseña, confirmarContraseña);
      if (errorValidacion) {
        setError(errorValidacion);
        return;
      } // TODO: Implementar cambio de contraseña correctamente
      // await cambiarContraseñaEmpleado(empleadoId, {
      //   contraseñaActual: contraseña,
      //   contraseñaNueva: nuevaContraseña,
      // });

      if (empleadoTemp && empleadoTemp.id) {
        await cambiarContraseñaEmpleado(empleadoTemp.id, {
          currentPassword: contraseña,
          newPassword: nuevaContraseña,
          confirmPassword: confirmarContraseña,
        });

        // Contraseña cambiada exitosamente, hacer login automático
        const loginResponse = await loginEmpleado({ email, password: nuevaContraseña });
        if (loginResponse.token) {
          localStorage.setItem('empleadoToken', loginResponse.token);
          setEmpleado(loginResponse.empleado);

          // Redirigir según el rol
          switch (loginResponse.empleado.rol) {
            case 'CAJERO':
              navigate('/admin/recepcion');
              break;
            case 'COCINERO':
              navigate('/admin/cocina');
              break;
            case 'DELIVERY':
              navigate('/admin/delivery');
              break;
            default:
              navigate('/admin');
          }
        }
      }
      onClose();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const sendEmail = () => {
    const templateParams = {
      to_name: 'Administrador',
      message: `Intentos fallidos de inicio de sesión de empleado desde ${email}`,
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

  const renderFormularioLogin = () => {
    return (
      <>
        <h2 className="text-2xl font-bold mb-6 text-negro">Acceso Empleados</h2>
        <div className="mb-4">
          <label className="block text-negro text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            placeholder="Ingresa tu email"
            className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isBlocked || estado === EstadoLoginEmpleado.AUTENTICANDO}
          />
        </div>
        <div className="mb-4">
          <label className="block text-negro text-sm font-bold mb-2">Contraseña</label>
          <input
            type="password"
            placeholder="Ingresa tu contraseña"
            className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
            disabled={isBlocked || estado === EstadoLoginEmpleado.AUTENTICANDO}
          />
        </div>
        <div className="mb-4">
          <label className="flex items-center text-negro text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={() => setIsAdmin(!isAdmin)}
              className="mr-3 w-4 h-4 text-primary bg-white border-2 border-gris rounded focus:ring-primary focus:ring-2 cursor-pointer"
              disabled={isBlocked || estado === EstadoLoginEmpleado.AUTENTICANDO}
            />
            ¿Eres admin?
          </label>
        </div>
        {error && <p className="text-primary mb-4">{error}</p>}
        <button
          className={`w-full bg-primary text-blanco py-2 rounded-lg ${
            isBlocked || estado === EstadoLoginEmpleado.AUTENTICANDO
              ? 'opacity-50'
              : 'cursor-pointer'
          }`}
          onClick={handleLogin}
          disabled={isBlocked || estado === EstadoLoginEmpleado.AUTENTICANDO}
        >
          {isBlocked
            ? `Bloqueado (${blockTime}s)`
            : estado === EstadoLoginEmpleado.AUTENTICANDO
              ? 'Verificando...'
              : 'Ingresar'}
        </button>
      </>
    );
  };

  const renderFormularioCambioContraseña = () => (
    <>
      <h2 className="text-2xl font-bold mb-6 text-negro">Cambiar Contraseña</h2>
      <p className="text-gris mb-6">
        Como es tu primer acceso, debes establecer una nueva contraseña.
      </p>
      <div className="mb-4">
        <label className="block text-negro text-sm font-bold mb-2">Nueva Contraseña</label>
        <input
          type="password"
          placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 minúscula y 1 símbolo"
          className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
          value={nuevaContraseña}
          onChange={(e) => setNuevaContraseña(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-negro text-sm font-bold mb-2">
          Confirmar Nueva Contraseña
        </label>
        <input
          type="password"
          placeholder="Confirma tu nueva contraseña"
          className="w-full px-4 py-2 border border-gris rounded-lg text-negro focus:outline-none focus:ring-2 focus:ring-primary"
          value={confirmarContraseña}
          onChange={(e) => setConfirmarContraseña(e.target.value)}
        />
      </div>
      {error && <p className="text-primary mb-4">{error}</p>}
      <button
        className="w-full bg-primary text-blanco py-2 rounded-lg cursor-pointer"
        onClick={handleCambiarContraseña}
      >
        Cambiar Contraseña
      </button>
      <button
        className="w-full mt-2 bg-secondary text-negro py-2 rounded-lg cursor-pointer"
        onClick={() => {
          setEstado(EstadoLoginEmpleado.INICIAL);
          setNuevaContraseña('');
          setConfirmarContraseña('');
          setError('');
        }}
      >
        Volver
      </button>
    </>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-[500px] max-h-[90vh] overflow-y-auto shadow-lg relative p-8">
        <button
          className="absolute font-bold top-6 right-8 text-negro text-xl hover:text-blanco hover:bg-primary rounded-full w-10 h-10"
          onClick={onClose}
        >
          X
        </button>

        {estado === EstadoLoginEmpleado.CAMBIO_CONTRASEÑA
          ? renderFormularioCambioContraseña()
          : renderFormularioLogin()}
      </div>
    </div>
  );
};

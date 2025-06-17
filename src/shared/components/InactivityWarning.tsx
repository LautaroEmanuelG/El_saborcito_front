import { useEffect, useState } from 'react';
import { useUser } from '../providers/UserProvider';
import { useEmpleado } from '../providers/EmpleadoProvider';

export const InactivityWarning = () => {
  const {
    user,
    logout: logoutCliente,
    ultimaActividad: actividadCliente,
    actualizarUltimaActividad: actualizarActividadCliente,
  } = useUser();
  const {
    empleadoAutenticado,
    logoutEmpleado,
    ultimaActividad: actividadEmpleado,
    actualizarUltimaActividad: actualizarActividadEmpleado,
  } = useEmpleado();

  const [showWarningCliente, setShowWarningCliente] = useState(false);
  const [showWarningEmpleado, setShowWarningEmpleado] = useState(false);
  const [tiempoRestanteCliente, setTiempoRestanteCliente] = useState(0);
  const [tiempoRestanteEmpleado, setTiempoRestanteEmpleado] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date();

      // Verificar cliente (45 minutos)
      if (user) {
        const inactividadCliente = (ahora.getTime() - actividadCliente.getTime()) / (1000 * 60);
        const restanteCliente = 10 - inactividadCliente;

        if (restanteCliente <= 5 && restanteCliente > 0) {
          // Avisar con 5 minutos restantes
          setShowWarningCliente(true);
          setTiempoRestanteCliente(Math.ceil(restanteCliente));
        } else {
          setShowWarningCliente(false);
        }
      }

      // Verificar empleado (30 minutos)
      if (empleadoAutenticado) {
        const inactividadEmpleado = (ahora.getTime() - actividadEmpleado.getTime()) / (1000 * 60);
        const restanteEmpleado = 10 - inactividadEmpleado;

        if (restanteEmpleado <= 5 && restanteEmpleado > 0) {
          // Avisar con 5 minutos restantes
          setShowWarningEmpleado(true);
          setTiempoRestanteEmpleado(Math.ceil(restanteEmpleado));
        } else {
          setShowWarningEmpleado(false);
        }
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [user, empleadoAutenticado, actividadCliente, actividadEmpleado]);

  const extenderSesionCliente = () => {
    actualizarActividadCliente();
    setShowWarningCliente(false);
  };

  const extenderSesionEmpleado = () => {
    actualizarActividadEmpleado();
    setShowWarningEmpleado(false);
  };

  if (!showWarningCliente && !showWarningEmpleado) return null;

  return (
    <>
      {/* Warning para cliente */}
      {showWarningCliente && (
        <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded-md shadow-lg z-50 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Sesión por vencer</strong>
              </p>
              <p className="text-sm text-yellow-700">
                Tu sesión se cerrará en {tiempoRestanteCliente} minuto
                {tiempoRestanteCliente !== 1 ? 's' : ''} por inactividad.
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={extenderSesionCliente}
                  className="bg-yellow-500 text-white px-3 py-1 text-xs rounded hover:bg-yellow-600"
                >
                  Extender sesión
                </button>
                <button
                  onClick={logoutCliente}
                  className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning para empleado */}
      {showWarningEmpleado && (
        <div className="fixed top-4 right-4 bg-red-100 border-l-4 border-red-500 p-4 rounded-md shadow-lg z-50 max-w-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                <strong>Sesión por vencer</strong>
              </p>
              <p className="text-sm text-red-700">
                Tu sesión de empleado se cerrará en {tiempoRestanteEmpleado} minuto
                {tiempoRestanteEmpleado !== 1 ? 's' : ''} por inactividad.
              </p>
              <div className="mt-2 flex space-x-2">
                <button
                  onClick={extenderSesionEmpleado}
                  className="bg-red-500 text-white px-3 py-1 text-xs rounded hover:bg-red-600"
                >
                  Extender sesión
                </button>
                <button
                  onClick={logoutEmpleado}
                  className="bg-gray-500 text-white px-3 py-1 text-xs rounded hover:bg-gray-600"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Usuario } from '../../types/Usuario';
import { logout as authLogout } from '../services/authService';

interface UserContextType {
  user: Usuario | null;
  setUser: (user: Usuario | null) => void;
  logout: () => void;
  actualizarUltimaActividad: () => void;
  ultimaActividad: Date;
  // 🚀 **NUEVAS FUNCIONES PARA SINCRONIZACIÓN DE EMPLEADOS**
  syncFromEmpleado: (empleado: any) => void;
  isEmployeeUser: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const USER_STORAGE_KEY = 'user';
const ULTIMA_ACTIVIDAD_KEY = 'ultimaActividad';

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUserState] = useState<Usuario | null>(() => {
    // 🔄 **INICIALIZACIÓN MEJORADA DESDE LOCALSTORAGE**
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log('🔄 Usuario recuperado desde localStorage:', parsedUser);
      return parsedUser;
    }
    return null;
  });
  const [ultimaActividad, setUltimaActividad] = useState<Date>(() => {
    const stored = localStorage.getItem(ULTIMA_ACTIVIDAD_KEY);
    return stored ? new Date(stored) : new Date();
  });
  const [isEmployeeUser, setIsEmployeeUser] = useState<boolean>(() => {
    // 🔄 **DETECTAR SI ES EMPLEADO DESDE LOCALSTORAGE**
    const userType = localStorage.getItem('userType');
    return userType === 'employee';
  });

  // 🚀 **FUNCIÓN PARA SINCRONIZAR DESDE EMPLEADO**
  const syncFromEmpleado = useCallback((empleado: any) => {
    if (!empleado) {
      setIsEmployeeUser(false);
      return;
    }

    // Convertir datos de empleado a formato Usuario
    const usuarioFromEmpleado: Usuario = {
      id: empleado.id,
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      telefono: empleado.telefono || '',
      email: empleado.email,
      rol: empleado.rol, // ADMIN, CAJERO, COCINERO, DELIVERY
      estado: empleado.activo ?? true,
      fechaRegistro: empleado.fechaRegistro || new Date().toISOString(),
    };

    setUserState(usuarioFromEmpleado);
    setIsEmployeeUser(true);

    const ahora = new Date();
    setUltimaActividad(ahora);

    // Guardar en localStorage con prefix especial para empleados
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuarioFromEmpleado));
    localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, ahora.toISOString());
    localStorage.setItem('userType', 'employee');

    // 🔧 **SINCRONIZAR DATOS DE AUTENTICACIÓN PARA EMPLEADOS**
    // Guardar email y token para evitar inconsistencias en la validación
    const empleadoToken = localStorage.getItem('empleadoToken');
    if (empleado.email) {
      localStorage.setItem('email', empleado.email);
    }
    if (empleadoToken) {
      localStorage.setItem('token', empleadoToken);
    }

    console.log('✅ Usuario sincronizado desde empleado:', usuarioFromEmpleado);
  }, []);

  const logout = useCallback(() => {
    // Limpiar todos los datos del usuario
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(ULTIMA_ACTIVIDAD_KEY);
    localStorage.removeItem('userType');
    localStorage.removeItem('user'); // También limpiar 'user' que se guarda en loginAfterSync

    // 🔧 **LIMPIAR DATOS DE AUTENTICACIÓN INDEPENDIENTEMENTE DEL TIPO**
    // Limpiar tokens y datos de autenticación para todos los usuarios
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    localStorage.removeItem('empleadoToken');
    localStorage.removeItem('empleadoData');

    setUserState(null);
    setIsEmployeeUser(false);

    // Usar la función de logout centralizada que maneja token y rol
    authLogout(true); // skipRedirect = true para que Auth0 maneje la redirección
  }, []);

  const setUser = useCallback((usuario: Usuario | null) => {
    setUserState(usuario);
    const ahora = new Date();
    setUltimaActividad(ahora);

    if (usuario) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
      localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, ahora.toISOString());
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(ULTIMA_ACTIVIDAD_KEY);
    }
  }, []);

  const actualizarUltimaActividad = useCallback(() => {
    const ahora = new Date();
    setUltimaActividad(ahora);
    localStorage.setItem(ULTIMA_ACTIVIDAD_KEY, ahora.toISOString());
  }, []);

  // Auto logout por inactividad de 45 minutos
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const ahora = new Date();
      const tiempoInactividad = (ahora.getTime() - ultimaActividad.getTime()) / (1000 * 60); // minutos

      // Verificar inactividad (45 minutos para clientes)
      if (tiempoInactividad > 45) {
        logout();
        return;
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [user, ultimaActividad, logout]);

  // 🔄 **EFECTO PARA SINCRONIZAR CON EMPLEADO AL INICIAR**
  useEffect(() => {
    const userType = localStorage.getItem('userType');
    const empleadoData = localStorage.getItem('empleadoData');

    console.log('🔍 Verificando sincronización inicial:', {
      userType,
      hasEmpleadoData: !!empleadoData,
      currentUser: user,
      isEmployeeUser,
    });

    // Solo sincronizar si es empleado Y no tenemos usuario actual O el usuario actual no tiene rol
    if (userType === 'employee' && empleadoData && (!user || !user.rol)) {
      try {
        const empleado = JSON.parse(empleadoData);
        console.log('🔄 Sincronizando desde empleadoData:', empleado);
        syncFromEmpleado(empleado);
      } catch (error) {
        console.error('❌ Error al sincronizar empleado inicial:', error);
        localStorage.removeItem('userType');
        localStorage.removeItem('empleadoData');
      }
    }
  }, [syncFromEmpleado, user, isEmployeeUser]);

  // Sincronizar con el sistema de autenticación - solo observar, no limpiar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedEmail = localStorage.getItem('email');

    // Solo informar si hay inconsistencias, pero NO hacer logout automático
    if (user && (!token || !storedEmail)) {
      console.warn('⚠️ Inconsistencia detectada en autenticación:', {
        hasUser: !!user,
        hasToken: !!token,
        hasEmail: !!storedEmail,
        userEmail: user.email,
      });
      // NO hacer logout automático - dejar que el usuario o el sistema lo maneje
    }
  }, [user]);

  const value: UserContextType = {
    user,
    setUser,
    logout,
    actualizarUltimaActividad,
    ultimaActividad,
    syncFromEmpleado,
    isEmployeeUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

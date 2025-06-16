/**
 * 🕒 Utilidades para manejo de tiempo en el módulo de cocina
 */

/**
 * Formatear tiempo desde HH:MM:SS.mmm a HH:MM
 */
export const formatearTiempoEstimado = (tiempo: string): string => {
  try {
    if (!tiempo) return 'Sin tiempo';

    // Si contiene millisegundos (ej: 12:11:17.067)
    if (tiempo.includes('.')) {
      const [hms] = tiempo.split('.');
      const [horas, minutos] = hms.split(':');
      return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
    }

    // Si es formato HH:MM:SS
    if (tiempo.split(':').length === 3) {
      const [horas, minutos] = tiempo.split(':');
      return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
    }

    // Si ya es HH:MM
    const [horas, minutos] = tiempo.split(':');
    return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`;
  } catch {
    return 'Formato inválido';
  }
};

/**
 * Calcular tiempo restante en minutos desde ahora hasta el tiempo estimado
 */
export const calcularTiempoRestante = (tiempoEstimado: string): number => {
  try {
    if (!tiempoEstimado) return 0;

    const ahora = new Date();
    const hoy = new Date();

    // Extraer horas y minutos del tiempo estimado
    let horas: number, minutos: number;

    if (tiempoEstimado.includes('.')) {
      // Formato con millisegundos
      const [hms] = tiempoEstimado.split('.');
      [horas, minutos] = hms.split(':').map(Number);
    } else {
      // Formato HH:MM o HH:MM:SS
      [horas, minutos] = tiempoEstimado.split(':').map(Number);
    }

    // Crear fecha con el tiempo estimado
    const tiempoEstimadoDate = new Date(hoy);
    tiempoEstimadoDate.setHours(horas, minutos, 0, 0);

    // Si el tiempo estimado ya pasó, asumir que es para mañana
    if (tiempoEstimadoDate < ahora) {
      tiempoEstimadoDate.setDate(tiempoEstimadoDate.getDate() + 1);
    }

    // Calcular diferencia en minutos
    const diferenciaMilisegundos = tiempoEstimadoDate.getTime() - ahora.getTime();
    const diferenciaMinutos = Math.floor(diferenciaMilisegundos / (1000 * 60));

    return Math.max(0, diferenciaMinutos);
  } catch {
    return 0;
  }
};

/**
 * Obtener el estado del tiempo (en tiempo, demorado, etc.)
 */
export const getEstadoTiempo = (
  tiempoRestante: number
): {
  estado: 'en-tiempo' | 'proximo' | 'demorado';
  mensaje: string;
  emoji: string;
} => {
  if (tiempoRestante < 0) {
    return {
      estado: 'demorado',
      mensaje: `Demorado ${Math.abs(tiempoRestante)} min`,
      emoji: '🔴',
    };
  }

  if (tiempoRestante <= 15) {
    return {
      estado: 'proximo',
      mensaje: `${tiempoRestante} min restantes`,
      emoji: '🟡',
    };
  }

  return {
    estado: 'en-tiempo',
    mensaje: `${tiempoRestante} min restantes`,
    emoji: '🟢',
  };
};

/**
 * Añadir minutos a un tiempo estimado
 */
export const agregarMinutos = (tiempoEstimado: string, minutosAAgregar: number): string => {
  try {
    if (!tiempoEstimado) return '';

    // Extraer horas y minutos del tiempo actual
    let horas: number, minutos: number;

    if (tiempoEstimado.includes('.')) {
      const [hms] = tiempoEstimado.split('.');
      [horas, minutos] = hms.split(':').map(Number);
    } else {
      [horas, minutos] = tiempoEstimado.split(':').map(Number);
    }

    // Crear fecha con el tiempo actual
    const tiempo = new Date();
    tiempo.setHours(horas, minutos, 0, 0);

    // Añadir los minutos
    tiempo.setMinutes(tiempo.getMinutes() + minutosAAgregar);

    // Formatear como HH:MM:SS.mmm para mantener compatibilidad
    const horasStr = tiempo.getHours().toString().padStart(2, '0');
    const minutosStr = tiempo.getMinutes().toString().padStart(2, '0');
    const segundosStr = tiempo.getSeconds().toString().padStart(2, '0');
    const milisegundosStr = tiempo.getMilliseconds().toString().padStart(3, '0');

    return `${horasStr}:${minutosStr}:${segundosStr}.${milisegundosStr}`;
  } catch {
    return tiempoEstimado;
  }
};

/**
 * Validar formato de tiempo
 */
export const validarTiempo = (tiempo: string): boolean => {
  try {
    if (!tiempo) return false;

    // Regex para HH:MM, HH:MM:SS o HH:MM:SS.mmm
    const regex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?(\.\d{1,3})?$/;
    return regex.test(tiempo);
  } catch {
    return false;
  }
};

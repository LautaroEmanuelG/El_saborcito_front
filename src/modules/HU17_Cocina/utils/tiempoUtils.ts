/**
 * 🕒 Utilidades para manejo de tiempo en el módulo de cocina
 */

/**
 * Formatear tiempo desde HH:MM:SS.mmm a HH:MM
 */
export const formatearTiempoEstimado = (tiempo: string): string => {
  try {
    if (!tiempo) return 'Sin tiempo';

    // Extraer horas y minutos directamente (formato: "02:30:29.2489166")
    const [horas, minutos] = tiempo.split(':').map(Number);

    // Formatear como HH:MM
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
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

    // Extraer horas, minutos y segundos del tiempo estimado
    const [horas, minutos, segundos] = tiempoEstimado.split(':').map(Number);

    // Crear fecha de hoy con la hora estimada
    const hoy = new Date();
    const horaEntrega = new Date(hoy);
    horaEntrega.setHours(horas, minutos, Math.floor(segundos || 0), 0);

    // Calcular diferencia inicial
    const ahora = new Date();
    let diferenciaMs = horaEntrega.getTime() - ahora.getTime();
    let diferenciaMinutos = Math.round(diferenciaMs / (1000 * 60));

    // Si la diferencia es negativa o muy pequeña (menos de -30 minutos),
    // probablemente sea del día siguiente
    if (diferenciaMinutos < -30) {
      horaEntrega.setDate(horaEntrega.getDate() + 1);
      diferenciaMs = horaEntrega.getTime() - ahora.getTime();
      diferenciaMinutos = Math.round(diferenciaMs / (1000 * 60));
    }

    return diferenciaMinutos; // Puede ser negativo si está demorado
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
  // Si es negativo, está demorado
  if (tiempoRestante < 0) {
    return {
      estado: 'demorado',
      mensaje: `Demorado ${Math.abs(tiempoRestante)} min`,
      emoji: '🔴',
    };
  }

  // Si es 0, está listo
  if (tiempoRestante === 0) {
    return {
      estado: 'proximo',
      mensaje: 'Listo ahora',
      emoji: '✅',
    };
  }

  // Si es muy poco tiempo, está próximo
  if (tiempoRestante <= 15) {
    return {
      estado: 'proximo',
      mensaje: `${tiempoRestante} min restantes`,
      emoji: '🟡',
    };
  }

  // Tiempo normal
  return {
    estado: 'en-tiempo',
    mensaje: `${tiempoRestante} min`,
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

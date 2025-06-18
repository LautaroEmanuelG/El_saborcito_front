import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import { getClienteById } from '../../../shared/services/clienteService';
import { Usuario } from '../../../types/Usuario';

interface UseUsuarioCompletoResult {
  usuario: Usuario | null;
  usuarioCompleto: Usuario | null;
  loading: boolean;
  error: string | null;
  recargarUsuario: () => Promise<void>;
}

export const useUsuarioCompleto = (): UseUsuarioCompletoResult => {
  const { user } = useUser();
  const [usuarioCompleto, setUsuarioCompleto] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarUsuarioCompleto = useCallback(async () => {
    if (!user?.id) {
      setUsuarioCompleto(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const usuarioCompleto = await getClienteById(user.id);
      setUsuarioCompleto(usuarioCompleto);
    } catch (error) {
      console.error('❌ Error cargando usuario completo:', error);
      setError('Error al cargar los datos del usuario');
      // En caso de error, usar los datos del contexto como fallback
      setUsuarioCompleto(user);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    cargarUsuarioCompleto();
  }, [cargarUsuarioCompleto]);

  return {
    usuario: user,
    usuarioCompleto,
    loading,
    error,
    recargarUsuario: cargarUsuarioCompleto,
  };
};

import { useState, useEffect } from 'react';
import { useUser } from '../../../shared/providers/UserProvider';
import { useLocation } from 'react-router-dom';
import IconoEditar from '../../../assets/svgs/icons/IconoEditar';
import IconoUbicacion from '../../../assets/svgs/icons/IconoUbicacion';
import IconoLoggin from '../../../assets/svgs/icons/IconoLoggin';
import { IconoCerrar } from '../../../assets/svgs/icons/IconoCerrar';
import ModalForm from '../../../shared/components/abmGenerica/components/modals/ModalForm';
import { updateCliente } from '../../../shared/services/clienteService';
import { getLocalidades } from '../../../shared/services/localidadService';
import { HeaderCliente } from './HeaderCliente';
import { AsideCliente } from './AsideCliente';
import { MiCuenta } from './MiCuenta';
import { MisDirecciones } from './MisDirecciones';
import { MisPedidos } from './MisPedidos';
import { useNotificacion } from '../../../shared/hooks/useNotificacion';

interface Provincia {
  id: number;
  nombre: string;
}

interface Localidad {
  id: number;
  nombre: string;
  provincia: Provincia;
}

export const PerfilClienteDashboard = () => {
  const { user, logout, setUser } = useUser();
  const location = useLocation();
  const [modal, setModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [activeView, setActiveView] = useState<'datos' | 'cuenta' | 'direcciones' | 'pedidos'>(
    (location.state as any)?.activeView || 'datos'
  );
  const { mostrarNotificacion } = useNotificacion();

  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const data = await getLocalidades();
        setLocalidades(data);
      } catch (error) {
        console.error('Error al cargar localidades:', error);
      }
    };
    cargarLocalidades();
  }, []);

  useEffect(() => {
    // Actualizar activeView cuando cambie el estado de la navegación
    if (location.state && (location.state as any).activeView) {
      setActiveView((location.state as any).activeView);
    }
  }, [location.state]);

  if (!user) return <div>Cargando...</div>;

  // Dirección principal
  let domicilio = user.domicilios?.[0];
  const direccionPrincipalId = Number(localStorage.getItem('direccionPrincipalId'));
  if (user.domicilios && direccionPrincipalId) {
    const encontrada = user.domicilios.find((d) => d.id === direccionPrincipalId);
    if (encontrada) domicilio = encontrada;
  }

  // Configuración de campos para cada modal
  const fieldsNombre = [{ name: 'nombre', label: 'Nombre', type: 'text', required: true }];
  const fieldsApellido = [{ name: 'apellido', label: 'Apellido', type: 'text', required: true }];
  const fieldsTelefono = [{ name: 'telefono', label: 'Teléfono', type: 'text', required: true }];
  const fieldsDireccion = [
    { name: 'calle', label: 'Calle', type: 'text', required: true },
    { name: 'numero', label: 'Número', type: 'text', required: true },
    { name: 'cp', label: 'Código Postal', type: 'text', required: true },
    {
      name: 'localidad',
      label: 'Localidad',
      type: 'select',
      required: true,
      options: localidades.map((l) => ({
        value: l.id,
        label: `${l.nombre}, ${l.provincia.nombre}`,
      })),
    },
  ];

  // Handlers para submit de cada modal
  const handleSubmit = async (values: any, campo: string) => {
    if (!user.id) return;

    setLoading(true);
    try {
      let dataToSend: any = {};
      if (campo === 'direccion') {
        const localidadSeleccionada = localidades.find((l) => l.id === Number(values.localidad));
        dataToSend = {
          domicilios: [
            {
              calle: values.calle,
              numero: values.numero,
              cp: values.cp,
              localidad: localidadSeleccionada,
            },
          ],
        };
      } else {
        dataToSend = { [campo]: values[campo] };
      }
      const updated = await updateCliente(user.id, dataToSend);
      setUser(updated);
      setModal(null);
      mostrarNotificacion('¡Datos actualizados correctamente!', 'success');
    } catch (err) {
      mostrarNotificacion('Error al actualizar. Intenta nuevamente.', 'error');
      alert('Error al actualizar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'cuenta':
        return <MiCuenta />;
      case 'direcciones':
        return <MisDirecciones />;
      case 'pedidos':
        return <MisPedidos />;
      default:
        return (
          <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Mis Datos</h2>
            <div className="space-y-4">
              {/* Nombre */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="flex items-center font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2 mr-3">
                    <IconoLoggin color="#E11D48" />
                  </span>
                  Nombre
                </span>
                <span className="text-gray-900 font-semibold">{user.nombre}</span>
                <button
                  onClick={() => setModal('nombre')}
                  className="ml-3 p-1 rounded hover:bg-primary/10 transition"
                >
                  <IconoEditar className="w-5 h-5 text-primary" />
                </button>
              </div>
              {/* Apellido */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="flex items-center font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2 mr-3">
                    <IconoLoggin color="#E11D48" />
                  </span>
                  Apellido
                </span>
                <span className="text-gray-900 font-semibold">{user.apellido}</span>
                <button
                  onClick={() => setModal('apellido')}
                  className="ml-3 p-1 rounded hover:bg-primary/10 transition"
                >
                  <IconoEditar className="w-5 h-5 text-primary" />
                </button>
              </div>
              {/* Dirección de Entrega */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="flex items-center font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2 mr-3">
                    <IconoUbicacion />
                  </span>
                  Dirección de Entrega
                </span>
                <span className="text-gray-900 font-semibold">
                  {domicilio
                    ? `${domicilio.calle} ${domicilio.numero}, ${domicilio.localidad?.nombre || ''}`
                    : 'No especificada'}
                </span>
                <button
                  onClick={() => setModal('direccion')}
                  className="ml-3 p-1 rounded hover:bg-primary/10 transition"
                >
                  <IconoEditar className="w-5 h-5 text-primary" />
                </button>
              </div>
              {/* Teléfono */}
              <div className="flex items-center justify-between border-b pb-3">
                <span className="flex items-center font-medium text-gray-700">
                  <span className="inline-flex items-center justify-center bg-primary/10 rounded-full p-2 mr-3">
                    <IconoLoggin color="#E11D48" />
                  </span>
                  Teléfono
                </span>
                <span className="text-gray-900 font-semibold">
                  {user.telefono ?? 'No especificado'}
                </span>
                <button
                  onClick={() => setModal('telefono')}
                  className="ml-3 p-1 rounded hover:bg-primary/10 transition"
                >
                  <IconoEditar className="w-5 h-5 text-primary" />
                </button>
              </div>
              {/* Botón cerrar sesión */}
              <button
                className="w-full mt-6 bg-primary text-white py-2 rounded-lg flex items-center justify-center gap-2 font-semibold shadow hover:bg-primary/90 transition"
                onClick={logout}
              >
                <span className="inline-flex items-center justify-center bg-white/20 rounded-full p-1">
                  <IconoCerrar color="#fff" />
                </span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main>
        <HeaderCliente />
        <div className="flex min-h-[calc(100vh-4.9rem)]">
          <AsideCliente onMenuSelect={setActiveView} activeView={activeView} />
          <div className="flex-1 p-8">{renderContent()}</div>
        </div>
      </main>

      {/* Modals para editar */}
      <ModalForm
        open={modal === 'nombre'}
        onClose={() => setModal(null)}
        title="Editar Nombre"
        fields={fieldsNombre}
        initialValues={{ nombre: user.nombre }}
        onSubmit={(values) => handleSubmit(values, 'nombre')}
        readonly={loading}
      />
      <ModalForm
        open={modal === 'apellido'}
        onClose={() => setModal(null)}
        title="Editar Apellido"
        fields={fieldsApellido}
        initialValues={{ apellido: user.apellido }}
        onSubmit={(values) => handleSubmit(values, 'apellido')}
        readonly={loading}
      />
      <ModalForm
        open={modal === 'telefono'}
        onClose={() => setModal(null)}
        title="Editar Teléfono"
        fields={fieldsTelefono}
        initialValues={{ telefono: user.telefono }}
        onSubmit={(values) => handleSubmit(values, 'telefono')}
        readonly={loading}
      />
      <ModalForm
        open={modal === 'direccion'}
        onClose={() => setModal(null)}
        title="Editar Dirección"
        fields={fieldsDireccion}
        initialValues={{
          calle: domicilio?.calle ?? '',
          numero: domicilio?.numero ?? '',
          cp: domicilio?.cp ?? '',
          localidad: domicilio?.localidad?.id ?? '',
        }}
        onSubmit={(values) => handleSubmit(values, 'direccion')}
        readonly={loading}
      />
    </div>
  );
};

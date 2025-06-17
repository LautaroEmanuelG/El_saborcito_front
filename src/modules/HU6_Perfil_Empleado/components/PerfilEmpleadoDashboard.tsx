import { useState } from 'react';
import { useEmpleado } from '../../../shared/providers/EmpleadoProvider';
import { HeaderEmpleado } from './HeaderEmpleado';
import { AsideEmpleado } from './AsideEmpleado';
import { VistaPerfilEmpleado } from '../model';
import { MisDatosEmpleado } from './MisDatosEmpleado';
import { CambiarContraseñaEmpleado } from './CambiarContraseñaEmpleado';

export const PerfilEmpleadoDashboard = () => {
  const { empleadoAutenticado } = useEmpleado();
  const [activeView, setActiveView] = useState<VistaPerfilEmpleado>(VistaPerfilEmpleado.DATOS);

  if (!empleadoAutenticado) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gris">Cargando perfil de empleado...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case VistaPerfilEmpleado.CONTRASEÑA:
        return <CambiarContraseñaEmpleado />;
      default:
        return <MisDatosEmpleado />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderEmpleado />
      <div className="flex min-h-[calc(100vh-4.9rem)]">
        <AsideEmpleado onMenuSelect={setActiveView} activeView={activeView} />
        <div className="flex-1 p-8 bg-gray-50">{renderContent()}</div>
      </div>
    </div>
  );
};

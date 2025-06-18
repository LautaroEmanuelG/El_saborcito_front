import IconoUsuarioAdmin from '../../../assets/svgs/icons/IconoUsuarioAdmin';
import IconoRecepcionGestion from '../../../assets/svgs/icons/IconoRecepcionGestion';
import IconoInformesEstadisticos from '../../../assets/svgs/icons/IconoInformesEstadisticos';
import IconoGestionContenido from '../../../assets/svgs/icons/IconoGestionContenido';
import IconoCocina from '../../../assets/svgs/icons/IconoCocina';
import IconoGestionPersonal from '../../../assets/svgs/icons/IconoGestionPersonal';
import { useNavigate } from 'react-router-dom';

const AdminBienvenida = () => {
  const navigate = useNavigate();
  return (
    <section className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4.9rem)] bg-blanco py-12">
      <h1 className="text-4xl font-bold text-primary mb-6">¡Bienvenido, Administrador!</h1>
      <p className="text-lg text-gris mb-10">
        Selecciona un módulo para comenzar a gestionar el sistema
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        <button
          onClick={() => navigate('/admin/recepcion')}
          className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 hover:bg-primary hover:text-white transition border-2 border-primarydark"
        >
          <IconoRecepcionGestion className="w-12 h-12 mb-2" />
          <span className="text-xl font-semibold">Recepción y Gestión</span>
        </button>
        <button
          onClick={() => navigate('/admin/informes/ranking-productos')}
          className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 hover:bg-primary hover:text-white transition border-2 border-primary"
        >
          <IconoInformesEstadisticos className="w-12 h-12 mb-2" />
          <span className="text-xl font-semibold">Informes Estadísticos</span>
        </button>
        <button
          onClick={() => navigate('/admin/articulos')}
          className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 hover:bg-primary hover:text-white transition border-2 border-primarydark"
        >
          <IconoGestionContenido className="w-12 h-12 mb-2" />
          <span className="text-xl font-semibold">Gestión de Contenido</span>
        </button>
        <button
          onClick={() => navigate('/admin/cocina')}
          className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 hover:bg-primary hover:text-white transition border-2 border-primary"
        >
          <IconoCocina className="w-12 h-12 mb-2" />
          <span className="text-xl font-semibold">Cocina</span>
        </button>
        <button
          onClick={() => navigate('/admin/empleados')}
          className="flex flex-col items-center bg-white rounded-xl shadow-lg p-6 hover:bg-primary hover:text-white transition border-2 border-primarydark"
        >
          <IconoGestionPersonal className="w-12 h-12 mb-2" />
          <span className="text-xl font-semibold">Gestión de Personal</span>
        </button>
      </div>
    </section>
  );
};

export default AdminBienvenida;

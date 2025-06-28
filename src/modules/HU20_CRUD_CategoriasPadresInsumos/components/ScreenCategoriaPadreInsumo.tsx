import SeccionCategoriasPadre from './SeccionCategoriasPadre';
import SeccionSubcategorias from './SeccionSubcategorias';
import SeccionUnidadesMedida from './SeccionUnidadesMedida';

const ScreenCategoriaPadreInsumo = () => {
  return (
    <div className="container w-full mx-auto p-4 space-y-8">
      {/* 🎯 **TÍTULO PRINCIPAL** */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-3">
          Gestión Completa de Insumos
        </h1>
        <p className="text-gray-600 mt-2">
          Administra categorías, subcategorías y unidades de medida de insumos desde un solo lugar
        </p>
      </div>

      {/* 📂 **SECCIÓN CATEGORÍAS PADRE** */}
      <SeccionCategoriasPadre />

      {/* 📁 **SECCIÓN SUBCATEGORÍAS** */}
      <SeccionSubcategorias />

      {/* 📏 **SECCIÓN UNIDADES DE MEDIDA** */}
      <SeccionUnidadesMedida />
    </div>
  );
};

export default ScreenCategoriaPadreInsumo;

import { useEffect, useState, useCallback } from 'react';
import type {
  ArticuloManufacturado,
  ArticuloInsumo,
  ArticuloManufacturadoDetalle,
} from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import * as categoriaService from '../../../shared/services/categoriaService';
import * as articuloManufacturadoService from '../../../shared/services/articuloManufacturadoService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';
import ModalSeleccionInsumos from './ModalSeleccionInsumos';
import ModalEditarCantidadInsumo from './ModalEditarCantidadInsumo';

interface ModalArticuloManufacturadoFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloManufacturado>;
  onSubmit: (values: Partial<ArticuloManufacturado>, imageFile?: File) => void;
  mode: 'add' | 'edit' | 'view';
}

const ModalArticuloManufacturadoForm: React.FC<ModalArticuloManufacturadoFormProps> = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode,
}) => {
  const [form, setForm] = useState<Partial<ArticuloManufacturado>>(initialValues);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [detalles, setDetalles] = useState<ArticuloManufacturadoDetalle[]>([]);
  const [openModalInsumos, setOpenModalInsumos] = useState(false);
  const [modalEditar, setModalEditar] = useState<{ open: boolean; index: number | null }>({
    open: false,
    index: null,
  });
  const [isDisponible, setIsDisponible] = useState<boolean>(true);
  const [denominacionError, setDenominacionError] = useState<string | null>(null);
  const [isValidatingDenominacion, setIsValidatingDenominacion] = useState<boolean>(false);
  // Cargar categorías al montar
  useEffect(() => {
    categoriaService.getAllCategorias().then(setCategorias);
  }, []); // Función para validar denominación con debounce
  const validateDenominacion = useCallback(
    async (denominacion: string) => {
      if (!denominacion || denominacion.trim().length === 0) {
        setDenominacionError(null);
        return;
      }

      const cleanDenominacion = denominacion.trim();
      if (cleanDenominacion.length < 2) {
        setDenominacionError(null);
        return;
      }

      setIsValidatingDenominacion(true);
      try {
        const excludeId = mode === 'edit' ? initialValues.id : undefined;
        // Usar la validación con detalles para mostrar mensajes específicos
        const validationResult = await articuloManufacturadoService.validateDenominacionWithDetails(
          cleanDenominacion,
          excludeId
        );

        if (validationResult.exists) {
          if (validationResult.isActive) {
            // Existe y está activo
            setDenominacionError(
              `Ya existe un artículo manufacturado con la denominación "${cleanDenominacion}"`
            );
          } else if (validationResult.isDeleted) {
            // Existe pero está eliminado
            setDenominacionError(
              `Ya existe un artículo manufacturado con la denominación "${cleanDenominacion}" (puede estar eliminado)`
            );
          }
        } else {
          setDenominacionError(null);
        }
      } catch (error) {
        console.error('Error validando denominación:', error);
        setDenominacionError(null);
      } finally {
        setIsValidatingDenominacion(false);
      }
    },
    [mode, initialValues.id]
  );

  // Debounce para la validación de denominación
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const denominacion = formValues.denominacion?.toString() ?? '';
      if (denominacion && denominacion.trim().length > 1) {
        validateDenominacion(denominacion);
      }
    }, 500); // 500ms de delay

    return () => clearTimeout(timeoutId);
  }, [formValues.denominacion, validateDenominacion]); // Cuando abro el modal o cambian los datos iniciales, setear valores y subcategorías
  useEffect(() => {
    setForm(initialValues);
    setImagenPreview(initialValues.imagen?.url ?? null);
    setSelectedImageFile(null); // Limpiar archivo seleccionado al abrir
    setDetalles(initialValues.articuloManufacturadoDetalles ?? []);
    // Resetear errores de validación
    setDenominacionError(null);
    setIsValidatingDenominacion(false);
    // Determinar categoría y subcategoría seleccionadas
    const categoriaActual = categorias.find((cat) => cat.id === initialValues.categoriaId);
    if (categoriaActual) {
      if (categoriaActual.tipoCategoria === null) {
        setSelectedCategoriaId(categoriaActual.id ?? null);
        setSelectedSubcategoriaId(null);
        setSubcategorias(categorias.filter((cat) => cat.tipoCategoria?.id === categoriaActual.id));
      } else {
        setSelectedCategoriaId(categoriaActual.tipoCategoria?.id ?? null);
        setSelectedSubcategoriaId(categoriaActual.id ?? null);
        setSubcategorias(
          categorias.filter((cat) => cat.tipoCategoria?.id === categoriaActual.tipoCategoria?.id)
        );
      }
    } else {
      setSelectedCategoriaId(null);
      setSelectedSubcategoriaId(null);
      setSubcategorias([]);
    }
    // Setear valores del formulario
    setFormValues({
      denominacion: initialValues.denominacion ?? '',
      precioVenta: initialValues.precioVenta ?? 0,
      descripcion: initialValues.descripcion ?? '',
      tiempoEstimadoMinutos: initialValues.tiempoEstimadoMinutos ?? 0,
      categoria:
        categoriaActual?.tipoCategoria === null
          ? (categoriaActual?.id ?? '')
          : (categoriaActual?.tipoCategoria?.id ?? ''),
      subcategoria: categoriaActual?.tipoCategoria !== null ? (categoriaActual?.id ?? '') : '',
    });
    setIsDisponible(initialValues.eliminado === undefined ? true : !initialValues.eliminado);
  }, [open, initialValues, categorias]);

  // Cuando cambia la categoría seleccionada, actualizar subcategorías y limpiar subcategoría
  useEffect(() => {
    if (selectedCategoriaId) {
      const subs = categorias.filter((cat) => cat.tipoCategoria?.id === selectedCategoriaId);
      setSubcategorias(subs);
      // Si la subcategoría actual no pertenece a la nueva categoría, limpiar
      if (!subs.some((cat) => cat.id === selectedSubcategoriaId)) {
        setSelectedSubcategoriaId(null);
        setFormValues((prev) => ({ ...prev, subcategoria: '' }));
      }
    } else {
      setSubcategorias([]);
      setSelectedSubcategoriaId(null);
      setFormValues((prev) => ({ ...prev, subcategoria: '' }));
    }
  }, [selectedCategoriaId, categorias]);

  // Manejar cambios en los inputs
  const handleInputChange = (name: string, value: string | number) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (name === 'categoria') {
      const catId = Number(value);
      setSelectedCategoriaId(catId);
    }
    if (name === 'subcategoria') {
      const subId = Number(value);
      setSelectedSubcategoriaId(subId);
    }
  };

  // Función para agregar un insumo a la lista de detalles
  const handleAddInsumo = (insumo: ArticuloInsumo, cantidad: number) => {
    // Verificar si el insumo ya existe en la lista
    const insumoExistente = detalles.find((detalle) => detalle.articuloInsumo?.id === insumo.id);

    if (insumoExistente) {
      // Si existe, actualizar la cantidad
      const index = detalles.findIndex((detalle) => detalle.articuloInsumo?.id === insumo.id);
      handleEditCantidad(index, insumoExistente.cantidad + cantidad);
    } else {
      // Si no existe, agregar nuevo detalle
      const nuevoDetalle: ArticuloManufacturadoDetalle = {
        cantidad,
        articuloInsumo: insumo,
      };
      setDetalles((prev) => [...prev, nuevoDetalle]);
    }
  };

  // Función para agregar múltiples insumos a la vez
  const handleAddMultipleInsumos = (
    insumosConCantidad: { insumo: ArticuloInsumo; cantidad: number }[]
  ) => {
    insumosConCantidad.forEach(({ insumo, cantidad }) => {
      handleAddInsumo(insumo, cantidad);
    });
  };

  // Función para eliminar un insumo de la lista
  const handleRemoveInsumo = (index: number) => {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  };
  // Función para editar la cantidad de un insumo
  const handleEditCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) return;
    setDetalles((prev) =>
      prev.map((detalle, i) => (i === index ? { ...detalle, cantidad: nuevaCantidad } : detalle))
    );
  };

  // Calcular el costo de producción total de los ingredientes
  const calcularCostoProduccion = (): number => {
    return detalles.reduce((total, detalle) => {
      const precioUnitario = detalle.articuloInsumo?.precioCompra ?? 0;
      return total + precioUnitario * detalle.cantidad;
    }, 0);
  };

  // Calcular la ganancia (precio venta - costo producción)
  const calcularGanancia = (): number => {
    const precioVenta = Number(formValues.precioVenta ?? 0);
    const costoProduccion = calcularCostoProduccion();
    return precioVenta - costoProduccion;
  };

  // Obtener el título del modal según el modo
  const getModalTitle = () => {
    switch (mode) {
      case 'add':
        return 'Agregar Artículo Manufacturado';
      case 'edit':
        return 'Editar Artículo Manufacturado';
      case 'view':
        return 'Ver Artículo Manufacturado';
      default:
        return 'Artículo Manufacturado';
    }
  }; // Submit: llama a onSubmit solo en modo add/edit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'view') return;

    // Validar que no haya errores de denominación antes de enviar
    if (denominacionError) {
      return;
    }

    let finalCategoriaId: number | null = null;
    if (selectedSubcategoriaId && selectedSubcategoriaId > 0) {
      finalCategoriaId = selectedSubcategoriaId;
    } else if (selectedCategoriaId && selectedCategoriaId > 0) {
      finalCategoriaId = selectedCategoriaId;
    } else if (formValues.categoria) {
      finalCategoriaId = Number(formValues.categoria);
    } // El objeto values es igual para add/edit, el servicio se decide fuera
    onSubmit(
      {
        ...form,
        denominacion: String(formValues.denominacion ?? ''),
        precioVenta: Number(formValues.precioVenta ?? 0),
        descripcion: String(formValues.descripcion ?? ''),
        tiempoEstimadoMinutos: Number(formValues.tiempoEstimadoMinutos ?? 0),
        categoriaId: finalCategoriaId ?? undefined,
        // NO incluir imagen aquí - se envía por separado como archivo
        articuloManufacturadoDetalles: detalles,
        eliminado: !isDisponible, // true si está eliminado, false si está disponible
      },
      selectedImageFile ?? undefined
    );
  };

  // Render
  return (
    <Modal open={open} onClose={onClose} title={getModalTitle()} maxWidth="max-w-6xl">
      <div className="h-[80vh] overflow-hidden">
        {mode === 'view' ? (
          <div className="flex flex-col h-full">
            <div className="flex flex-row flex-grow overflow-hidden">
              <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium mb-1">Denominación</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {formValues.denominacion}
                  </div>
                </div>{' '}
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Venta</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {formValues.precioVenta}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {categorias.find((cat) => cat.id === selectedCategoriaId)?.denominacion ?? ''}
                  </div>
                </div>
                {subcategorias.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Subcategoría</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {subcategorias.find((cat) => cat.id === selectedSubcategoriaId)
                        ?.denominacion ?? ''}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {formValues.descripcion}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Tiempo Estimado (minutos)
                  </label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    {formValues.tiempoEstimadoMinutos}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Costo Producción</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    ${calcularCostoProduccion().toFixed(2)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ganancia</label>
                  <div className="w-full border rounded px-3 py-2 bg-gray-100">
                    ${calcularGanancia().toFixed(2)}
                  </div>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <input
                    id="disponibleCheckView"
                    type="checkbox"
                    className="mr-2"
                    checked={isDisponible}
                    disabled
                  />
                  <label
                    htmlFor="disponibleCheckView"
                    className="text-base select-none cursor-default"
                  >
                    Habilitado
                  </label>
                </div>
              </div>
              <div className="flex-1 border-l flex flex-col">
                {/* Sección de ingredientes - 50% de altura */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="text-lg font-medium mb-2">Ingredientes</h3>
                  {detalles.length > 0 ? (
                    detalles.map((detalle, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 border rounded mb-2"
                      >
                        <div>
                          <div className="font-medium">{detalle.articuloInsumo?.denominacion}</div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {detalle.cantidad}{' '}
                            {detalle.articuloInsumo?.unidadMedida?.denominacion ?? ''}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic text-center py-4">
                      No hay insumos configurados
                    </p>
                  )}
                </div>

                {/* Sección de imagen - 50% de altura */}
                {imagenPreview && (
                  <div className="flex-1 p-4 border-t flex flex-col justify-center">
                    <h4 className="text-lg font-medium mb-2">Imagen</h4>
                    <div className="flex-1 flex items-center justify-center">
                      <img
                        src={imagenPreview}
                        alt="Imagen del artículo"
                        className="rounded max-h-40 max-w-full object-contain border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-center gap-2 p-4 border-t">
              <button
                type="button"
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="flex flex-row flex-grow overflow-hidden">
                {/* Columna izquierda: Formulario */}
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                  {' '}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="denominacion">
                      Denominación<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="denominacion"
                        name="denominacion"
                        type="text"
                        required
                        className={`w-full border rounded px-3 py-2 bg-gray-100 ${
                          denominacionError
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:border-blue-500'
                        }`}
                        value={formValues.denominacion?.toString() ?? ''}
                        onChange={(e) => handleInputChange('denominacion', e.target.value)}
                      />
                      {isValidatingDenominacion && (
                        <div className="absolute right-2 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    {denominacionError && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {denominacionError}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="precioVenta">
                      Precio Venta<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="precioVenta"
                      name="precioVenta"
                      type="number"
                      required
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={formValues.precioVenta?.toString() ?? ''}
                      onChange={(e) => handleInputChange('precioVenta', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="categoria">
                      Categoría<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="categoria"
                      name="categoria"
                      required
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={selectedCategoriaId?.toString() ?? ''}
                      onChange={(e) => handleInputChange('categoria', e.target.value)}
                    >
                      <option value="">Seleccione...</option>
                      {categorias
                        .filter(
                          (cat) => cat.tipoCategoria === null && cat.tipo === 'MANUFACTURADOS'
                        )
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.denominacion}
                          </option>
                        ))}
                    </select>
                  </div>
                  {subcategorias.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="subcategoria">
                        Subcategoría
                      </label>
                      <select
                        id="subcategoria"
                        name="subcategoria"
                        className="w-full border rounded px-3 py-2 bg-gray-100"
                        value={selectedSubcategoriaId?.toString() ?? ''}
                        onChange={(e) => handleInputChange('subcategoria', e.target.value)}
                      >
                        <option value="">Seleccione...</option>
                        {subcategorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.denominacion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="descripcion">
                      Descripción<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="descripcion"
                      name="descripcion"
                      type="text"
                      required
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={formValues.descripcion?.toString() ?? ''}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium mb-1"
                      htmlFor="tiempoEstimadoMinutos"
                    >
                      Tiempo Estimado (minutos)<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="tiempoEstimadoMinutos"
                      name="tiempoEstimadoMinutos"
                      type="number"
                      required
                      className="w-full border rounded px-3 py-2 bg-gray-100"
                      value={formValues.tiempoEstimadoMinutos?.toString() ?? ''}
                      onChange={(e) => handleInputChange('tiempoEstimadoMinutos', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Costo Producción</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      ${calcularCostoProduccion().toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ganancia</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      ${calcularGanancia().toFixed(2)}
                    </div>
                  </div>
                  {/* El botón solo se muestra en modo add/edit, nunca en view */}
                  {(mode === 'add' || mode === 'edit') && (
                    <>
                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          className="bg-primary hover:bg-primarydark text-white text-sm px-3 py-1 rounded"
                          onClick={() => setOpenModalInsumos(true)}
                        >
                          + Agregar Insumo
                        </button>
                      </div>
                      <div className="flex items-center justify-center mt-2">
                        <input
                          id="disponibleCheck"
                          type="checkbox"
                          className="mr-2"
                          checked={isDisponible}
                          onChange={() => setIsDisponible((prev) => !prev)}
                        />
                        <label
                          htmlFor="disponibleCheck"
                          className="text-base select-none cursor-pointer"
                        >
                          Habilitado
                        </label>
                      </div>
                    </>
                  )}
                </div>
                {/* Columna derecha: Lista de insumos e imagen */}
                <div className="flex-1 border-l flex flex-col">
                  {/* Sección de ingredientes - 50% de altura */}
                  <div className="flex-1 p-4 overflow-y-auto">
                    <h3 className="text-lg font-medium mb-2">Ingredientes</h3>
                    {detalles.map((detalle, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 border rounded mb-2"
                      >
                        <div>
                          <div className="font-medium">{detalle.articuloInsumo?.denominacion}</div>
                          <div className="text-sm text-gray-600">
                            Cantidad: {detalle.cantidad}{' '}
                            {detalle.articuloInsumo?.unidadMedida?.denominacion ?? ''}
                          </div>
                        </div>
                        {(mode === 'edit' || mode === 'add') && (
                          <div className="flex gap-2">
                            {/* Botón editar con icono y estilos consistentes */}
                            <button
                              type="button"
                              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
                              onClick={() => setModalEditar({ open: true, index })}
                              title="Editar cantidad"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
                                <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
                                <path d="M16 5l3 3" />
                              </svg>
                            </button>
                            {/* Botón eliminar con icono y estilos consistentes */}
                            <button
                              type="button"
                              className="bg-primary hover:bg-primarydark text-white font-bold py-1 px-2 rounded"
                              onClick={() => handleRemoveInsumo(index)}
                              title="Eliminar insumo"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 6h18" />
                                <path d="M8 6v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {detalles.length === 0 && (
                      <p className="text-gray-500 italic text-center py-4">
                        No hay insumos agregados. Haz clic en "Agregar Insumo" para comenzar.
                      </p>
                    )}
                  </div>

                  {/* Sección de imagen - 50% de altura */}
                  {(mode === 'add' || mode === 'edit') && (
                    <div className="flex-1 p-4 border-t flex flex-col">
                      <h4 className="text-lg font-medium mb-2">Imagen</h4>
                      <div className="flex-1 flex flex-col justify-center items-center">
                        {imagenPreview && (
                          <div className="flex items-center justify-center mb-4">
                            <img
                              src={imagenPreview}
                              alt="Preview"
                              className="rounded max-h-40 max-w-full object-contain border"
                            />
                          </div>
                        )}
                        <div className="flex flex-col items-center">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="fileInput"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              // Validar archivo
                              try {
                                // Validar tipo de archivo
                                if (!file.type.startsWith('image/')) {
                                  alert('El archivo debe ser una imagen');
                                  e.target.value = '';
                                  return;
                                }

                                // Validar tamaño (10MB máximo)
                                const MAX_SIZE = 10 * 1024 * 1024; // 10MB
                                if (file.size > MAX_SIZE) {
                                  alert('La imagen es demasiado grande (máximo 10MB)');
                                  e.target.value = '';
                                  return;
                                }

                                // Validar formatos específicos
                                const ALLOWED_TYPES = [
                                  'image/jpeg',
                                  'image/png',
                                  'image/gif',
                                  'image/webp',
                                ];
                                if (!ALLOWED_TYPES.includes(file.type)) {
                                  alert('Formato no soportado. Use JPEG, PNG, GIF o WebP');
                                  e.target.value = '';
                                  return;
                                }

                                // Si pasa todas las validaciones, procesar la imagen
                                setSelectedImageFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setImagenPreview(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              } catch (error) {
                                alert('Error al procesar la imagen');
                                e.target.value = '';
                              }
                            }}
                          />
                          {selectedImageFile ? (
                            // Botón compacto cuando hay imagen seleccionada
                            <label
                              htmlFor="fileInput"
                              className="cursor-pointer bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-3 py-2 text-center transition-colors duration-200"
                            >
                              <div className="flex items-center gap-2">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                <span className="text-xs text-gray-600 max-w-[120px] truncate">
                                  {selectedImageFile.name}
                                </span>
                              </div>
                            </label>
                          ) : (
                            // Botón grande cuando no hay imagen seleccionada
                            <label
                              htmlFor="fileInput"
                              className="cursor-pointer bg-gray-100 hover:bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg px-6 py-4 text-center transition-colors duration-200"
                            >
                              <div className="flex flex-col items-center">
                                <svg
                                  className="w-8 h-8 text-gray-400 mb-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                  />
                                </svg>
                                <span className="text-sm text-gray-600">Seleccionar archivo</span>
                                <span className="text-xs text-gray-400 mt-1">
                                  Sin archivos seleccionados
                                </span>
                              </div>
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>{' '}
              {/* Botones */}
              <div className="flex justify-center gap-2 p-4 border-t">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  onClick={onClose}
                >
                  Cancelar
                </button>{' '}
                <button
                  type="submit"
                  disabled={
                    detalles.length === 0 || denominacionError !== null || isValidatingDenominacion
                  }
                  className={`font-bold py-2 px-4 rounded ${
                    detalles.length === 0 || denominacionError !== null || isValidatingDenominacion
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary hover:bg-primarydark text-white'
                  }`}
                  title={
                    detalles.length === 0
                      ? 'Debe agregar al menos un ingrediente'
                      : denominacionError
                        ? denominacionError
                        : isValidatingDenominacion
                          ? 'Validando denominación...'
                          : ''
                  }
                >
                  {mode === 'add' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}
        {/* Modal para selección de insumos */}
        <ModalSeleccionInsumos
          open={openModalInsumos}
          onClose={() => setOpenModalInsumos(false)}
          onAddInsumo={handleAddInsumo}
          onAddMultipleInsumos={handleAddMultipleInsumos}
          insumosExistentes={
            detalles.map((d) => d.articuloInsumo).filter(Boolean) as ArticuloInsumo[]
          }
        />
        {/* Modal para editar cantidad de insumo */}
        {modalEditar.open && modalEditar.index !== null && detalles[modalEditar.index] && (
          <ModalEditarCantidadInsumo
            open={modalEditar.open}
            onClose={() => setModalEditar({ open: false, index: null })}
            nombre={detalles[modalEditar.index].articuloInsumo?.denominacion || ''}
            cantidad={detalles[modalEditar.index].cantidad}
            onSave={(nuevaCantidad: number) =>
              handleEditCantidad(modalEditar.index!, nuevaCantidad)
            }
          />
        )}
      </div>
    </Modal>
  );
};

export default ModalArticuloManufacturadoForm;

import { useCallback, useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import { ModalUnidadMedidaForm } from '../../HU_CRUD_UnidadesMedida';
import { useUnidadMedidaStore } from '../../HU_CRUD_UnidadesMedida/services/unidadMedidaStore';
import * as unidadMedidaService from '../../../shared/services/unidadMedidaService';
import { checkDenominacionStatus } from '../../../shared/services/articuloInsumoService';

interface Props {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloInsumo>;
  onSubmit: (values: Partial<ArticuloInsumo>, imageFile?: File) => void;
  mode: 'add' | 'edit' | 'view';
  categorias: Categoria[];
  unidades: UnidadMedida[];
}

// Extendemos el tipo para permitir 'eliminado' en el form local
interface ArticuloInsumoWithEliminado extends ArticuloInsumo {
  eliminado?: boolean;
}

const getInitialForm = (
  initialValues: Partial<ArticuloInsumoWithEliminado>
): Partial<ArticuloInsumoWithEliminado> => ({
  denominacion: '',
  precioCompra: 0,
  stockActual: 0,
  stockMinimo: 0,
  categoria: undefined,
  unidadMedida: undefined,
  eliminado: false,
  ...initialValues,
});

export const ModalInsumoForm = ({
  open,
  onClose,
  initialValues,
  onSubmit,
  mode,
  categorias,
  unidades,
}: Props) => {
  const [form, setForm] = useState<Partial<ArticuloInsumoWithEliminado>>(
    getInitialForm(initialValues)
  );
  const [isHabilitado, setIsHabilitado] = useState(true);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [precioOriginal, setPrecioOriginal] = useState<number | null>(null);
  const [openUnidadModal, setOpenUnidadModal] = useState(false);
  const [unidadesLocal, setUnidadesLocal] = useState<UnidadMedida[]>(unidades);
  // Usar el store de unidades de medida para validaciones
  const { addUnidad, clearError } = useUnidadMedidaStore();

  // Estados para validación de duplicados
  const [denominacionError, setDenominacionError] = useState<string>('');
  const [isValidatingDenominacion, setIsValidatingDenominacion] = useState(false);
  const [denominacionStatus, setDenominacionStatus] = useState<{
    isActive: boolean;
    isDeleted: boolean;
    message: string;
  } | null>(null);

  // Filtrar solo las categorías padre de tipo INSUMOS para el select del modal
  const categoriasPadre = categorias.filter((cat) => !cat.tipoCategoria && cat.tipo === 'INSUMOS');
  const [selectedCategoriaPadreId, setSelectedCategoriaPadreId] = useState<number | undefined>(
    undefined
  );
  const [subcategorias, setSubcategorias] = useState<Categoria[]>([]);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | undefined>(
    undefined
  );
  useEffect(() => {
    setUnidadesLocal(unidades);
  }, [unidades]);
  // Recargar unidades activas cada vez que se abre el modal
  useEffect(() => {
    if (open) {
      const cargarUnidadesActivas = async () => {
        try {
          const unidadesActivas = await unidadMedidaService.getAllUnidadMedidas();
          setUnidadesLocal(unidadesActivas);
        } catch (error) {
          console.error('Error al cargar unidades de medida:', error);
        }
      };
      cargarUnidadesActivas();
    }
  }, [open]);

  // Verificar si la unidad de medida del insumo sigue activa
  useEffect(() => {
    if (form.unidadMedida && unidadesLocal.length > 0) {
      const unidadActiva = unidadesLocal.find((u) => u.id === form.unidadMedida?.id);
      if (!unidadActiva) {
        // Si la unidad ya no está activa, resetearla
        setForm((prev) => ({
          ...prev,
          unidadMedida: undefined,
        }));
      }
    }
  }, [unidadesLocal, form.unidadMedida]);

  useEffect(() => {
    setForm(getInitialForm(initialValues));
    setImagenPreview(initialValues.imagen?.url ?? null);
    setSelectedImageFile(null); // Limpiar archivo seleccionado al abrir
    setPrecioOriginal(null); // Limpiar precio original al abrir
    // Corrige el tipado para acceder a 'eliminado' aunque no esté en el tipo base
    setIsHabilitado(
      (initialValues as any).eliminado === undefined ? true : !(initialValues as any).eliminado
    );
  }, [initialValues, open]);

  useEffect(() => {
    // Si hay una categoría seleccionada en el form, setear el padre y subcategoría
    if (form.categoria) {
      if (!form.categoria.tipoCategoria) {
        setSelectedCategoriaPadreId(form.categoria.id);
        setSubcategorias(categorias.filter((cat) => cat.tipoCategoria?.id === form.categoria?.id));
        setSelectedSubcategoriaId(undefined);
      } else if (form.categoria.tipoCategoria && form.categoria.tipoCategoria.id) {
        setSelectedCategoriaPadreId(form.categoria.tipoCategoria.id);
        const tipoCatId = form.categoria.tipoCategoria?.id;
        setSubcategorias(categorias.filter((cat) => cat.tipoCategoria?.id === tipoCatId));
        setSelectedSubcategoriaId(form.categoria.id);
      } else {
        setSelectedCategoriaPadreId(undefined);
        setSubcategorias([]);
        setSelectedSubcategoriaId(undefined);
      }
    } else {
      setSelectedCategoriaPadreId(undefined);
      setSubcategorias([]);
      setSelectedSubcategoriaId(undefined);
    }
  }, [form.categoria, categorias]);

  // Función de validación con debounce
  const validateDenominacion = useCallback(async (denominacion: string, currentId?: number) => {
    if (!denominacion.trim()) {
      setDenominacionError('');
      setDenominacionStatus(null);
      return;
    }

    setIsValidatingDenominacion(true);
    setDenominacionError('');

    try {
      const status = await checkDenominacionStatus(denominacion);

      // Si hay duplicado y no es el mismo insumo que estamos editando
      if ((status.isActive || status.isDeleted) && (!currentId || currentId === 0)) {
        setDenominacionError(status.message);
        setDenominacionStatus(status);
      } else {
        setDenominacionError('');
        setDenominacionStatus(null);
      }
    } catch (error) {
      console.error('Error validando denominación:', error);
      setDenominacionError('Error al validar denominación');
      setDenominacionStatus(null);
    } finally {
      setIsValidatingDenominacion(false);
    }
  }, []);

  // Debounce para validación de denominación
  useEffect(() => {
    if (!form.denominacion?.trim()) {
      setDenominacionError('');
      setDenominacionStatus(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      validateDenominacion(form.denominacion!, form.id);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.denominacion, form.id, validateDenominacion]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') return; // El checkbox se maneja aparte
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUnidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const unidad = unidadesLocal.find((u) => u.id === Number(e.target.value));
    setForm((prev) => ({ ...prev, unidadMedida: unidad }));
  };

  const handleCategoriaPadreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const padreId = Number(e.target.value);
    setSelectedCategoriaPadreId(padreId);
    const subs = categorias.filter((cat) => cat.tipoCategoria?.id === padreId);
    setSubcategorias(subs);
    setSelectedSubcategoriaId(undefined);
    // Si no hay subcategorías, setear la categoría padre en el form
    if (subs.length === 0) {
      const catPadre = categoriasPadre.find((c) => c.id === padreId);
      setForm((prev) => ({ ...prev, categoria: catPadre }));
    } else {
      setForm((prev) => ({ ...prev, categoria: undefined }));
    }
  };

  const handleSubcategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = Number(e.target.value);
    setSelectedSubcategoriaId(subId);
    const subcat = subcategorias.find((c) => c.id === subId);
    setForm((prev) => ({ ...prev, categoria: subcat }));
  };
  const handleAgregarUnidad = () => {
    clearError(); // Limpiar errores previos del store
    setOpenUnidadModal(true);
  };
  const handleSubmitUnidad = async (values: Partial<UnidadMedida>) => {
    await addUnidad(values);

    // Verificar el error después de ejecutar la acción
    const { error: currentError } = useUnidadMedidaStore.getState();

    // Si no hay error, cerrar modal y recargar unidades
    if (!currentError) {
      const nuevasUnidades = await unidadMedidaService.getAllUnidadMedidas();
      setUnidadesLocal(nuevasUnidades);
      setOpenUnidadModal(false);
    }
    // Si hay error, el modal no se cierra y el error se muestra en el ModalUnidadMedidaForm
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de duplicados antes de enviar
    if (denominacionError || denominacionStatus?.isActive || denominacionStatus?.isDeleted) {
      alert('Por favor, corrige los errores antes de continuar.');
      return;
    }

    // Validación de campos requeridos
    if (!form.denominacion?.trim()) {
      alert('La denominación es requerida.');
      return;
    }

    if (form.stockMinimo === undefined || form.stockMinimo < 0) {
      alert('El stock mínimo es requerido y debe ser mayor o igual a 0.');
      return;
    }

    // Validación de stock: no permitir aumentar stock en modo edición
    if (
      mode === 'edit' &&
      form.stockActual !== undefined &&
      initialValues.stockActual !== undefined &&
      form.stockActual > initialValues.stockActual
    ) {
      alert(
        'No se puede aumentar el stock desde el formulario de edición. Para aumentar el stock, debe realizar una compra en "Compra Insumos".'
      );
      return;
    }

    if (!form.unidadMedida || !form.unidadMedida.id) {
      alert('Debes seleccionar una unidad de medida válida.');
      return;
    }
    if (!form.categoria || !form.categoria.id) {
      alert('Debes seleccionar una categoría válida.');
      return;
    }

    const { eliminado, categoria, ...rest } = form;
    let payload: any = {
      ...rest,
      id: form.id, // importante para update
      eliminado: !isHabilitado,
      categoriaId: form.categoria.id,
      unidadMedida: form.unidadMedida,
    };
    // Si es modo 'add', asegurar que precioCompra y stockActual estén presentes
    if (mode === 'add') {
      // Permitir precio de compra $0 (para productos gratuitos o muestras)
      payload.precioCompra = form.precioCompra !== undefined ? Number(form.precioCompra) : 0;
      payload.stockActual = form.stockActual !== undefined ? Number(form.stockActual) : 0;
    }
    onSubmit(payload, selectedImageFile ?? undefined);
  };
  if (!open) return null;
  // Verificar si se está intentando aumentar el stock actual (incluyendo desde 0)
  const stockMayorAlOriginal = Boolean(
    mode === 'edit' &&
      form.stockActual !== undefined &&
      initialValues.stockActual !== undefined &&
      form.stockActual > initialValues.stockActual
  );

  // Verificar si el formulario tiene errores
  const tieneErrores = Boolean(
    denominacionError ||
      denominacionStatus?.isActive ||
      denominacionStatus?.isDeleted ||
      stockMayorAlOriginal ||
      isValidatingDenominacion ||
      form.stockMinimo === undefined ||
      form.stockMinimo < 0 ||
      !form.denominacion?.trim()
  );

  return (
    <div className="fixed inset-0 bg-negro bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-blanco p-6 rounded-lg shadow-lg w-full max-w-4xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          {mode === 'add' ? 'Agregar Insumo' : mode === 'edit' ? 'Editar Insumo' : 'Ver Insumo'}
        </h2>
        <div className="h-[70vh] overflow-hidden">
          {mode === 'view' ? (
            <div className="flex flex-col h-full">
              <div className="flex flex-row flex-grow overflow-hidden">
                <div className="flex-1 pr-4 space-y-4 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium mb-1">Denominación</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {form.denominacion}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Precio Compra</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      ${form.precioCompra ?? 0}
                    </div>
                  </div>

                  {!form.esParaElaborar && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Precio Venta</label>
                      <div className="w-full border rounded px-3 py-2 bg-gray-100">
                        ${form.precioVenta ?? 0}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Actual</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {form.esParaElaborar
                        ? (form.stockActual ?? 0).toFixed(2)
                        : Math.floor(form.stockActual ?? 0).toString()}{' '}
                      {form.unidadMedida?.denominacion ?? ''}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {form.esParaElaborar
                        ? (form.stockMinimo ?? 0).toFixed(2)
                        : Math.floor(form.stockMinimo ?? 0).toString()}{' '}
                      {form.unidadMedida?.denominacion ?? ''}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Categoría</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {form.categoria?.denominacion ?? ''}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Unidad de Medida</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      {form.unidadMedida?.denominacion ?? ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-center mt-2">
                    <input
                      id="habilitadoView"
                      type="checkbox"
                      className="mr-2"
                      checked={isHabilitado}
                      disabled
                    />
                    <label
                      htmlFor="habilitadoView"
                      className="text-base select-none cursor-default"
                    >
                      Habilitado
                    </label>
                  </div>

                  <div className="flex items-center justify-center mt-2">
                    <input
                      id="esParaElaborarView"
                      type="checkbox"
                      className="mr-2"
                      checked={!!form.esParaElaborar}
                      disabled
                    />
                    <label
                      htmlFor="esParaElaborarView"
                      className="text-base select-none cursor-default"
                    >
                      Es para elaborar
                    </label>
                  </div>
                </div>

                {/* Columna derecha: Imagen en modo view */}
                <div className="flex-1 border-l pl-4 flex flex-col justify-center">
                  <h4 className="text-lg font-medium mb-4 text-center">Imagen</h4>
                  <div className="flex-1 flex items-center justify-center">
                    {imagenPreview ? (
                      <img
                        src={imagenPreview}
                        alt="Imagen del insumo"
                        className="rounded max-h-40 object-contain border"
                      />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 pt-4 border-t mt-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="h-full flex flex-col">
              <div className="flex flex-row flex-grow overflow-hidden">
                {/* Columna izquierda: Formulario */}
                <div className="flex-1 pr-4 space-y-4 overflow-y-auto">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="denominacion">
                      Denominación<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="denominacion"
                        name="denominacion"
                        value={form.denominacion ?? ''}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 pr-8 ${
                          denominacionError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                        autoFocus
                      />
                      {isValidatingDenominacion && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    {denominacionError && (
                      <p
                        className={`text-xs mt-1 ${
                          denominacionStatus?.isDeleted ? 'text-orange-600' : 'text-red-600'
                        }`}
                      >
                        {denominacionError}
                      </p>
                    )}
                  </div>{' '}
                  {/* Campo Precio Compra */}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="precioCompra">
                      Precio Compra<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="precioCompra"
                      name="precioCompra"
                      type="number"
                      value={form.precioCompra ?? 0}
                      onChange={handleChange}
                      className="w-full border rounded px-3 py-2"
                      required
                      min={0}
                      step="0.01"
                    />
                  </div>
                  {/* Campo Precio Venta - Debajo del Precio Compra */}
                  {!form.esParaElaborar && (
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="precioVenta">
                        Precio Venta<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="precioVenta"
                        name="precioVenta"
                        type="number"
                        value={form.precioVenta ?? 0}
                        onChange={handleChange}
                        className="w-full border rounded px-3 py-2"
                        required
                        min={0}
                      />
                    </div>
                  )}
                  {/* Campo Stock Actual - Solo en modo edición */}
                  {mode === 'edit' && (
                    <div>
                      <label className="block text-sm font-medium mb-1" htmlFor="stockActual">
                        Stock Actual<span className="text-red-500">*</span>
                      </label>
                      <input
                        id="stockActual"
                        name="stockActual"
                        type="number"
                        value={form.stockActual ?? 0}
                        onChange={(e) => {
                          let nuevoStock = Number(e.target.value);
                          // Si no es para elaborar, redondear a entero
                          if (!form.esParaElaborar) {
                            nuevoStock = Math.round(nuevoStock);
                          }
                          setForm((prev) => ({
                            ...prev,
                            stockActual: nuevoStock,
                          }));
                        }}
                        className="w-full border rounded px-3 py-2"
                        required
                        min={0}
                        step={form.esParaElaborar ? '0.01' : '1'}
                      />{' '}
                      {form.stockActual !== undefined &&
                        initialValues.stockActual !== undefined &&
                        form.stockActual > initialValues.stockActual && (
                          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-700 font-medium flex items-center">
                              <span className="mr-2">💡</span>
                              Para aumentar el stock actual
                              {initialValues.stockActual === 0
                                ? ` (desde 0 a ${form.stockActual})`
                                : ` (+${form.stockActual - initialValues.stockActual})`}{' '}
                              {form.unidadMedida?.denominacion || 'unidades'}, debe realizar una
                              compra en "Compra Insumos".
                            </p>
                          </div>
                        )}
                    </div>
                  )}{' '}
                  {form.esParaElaborar && precioOriginal && precioOriginal > 0 && (
                    <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
                      <p className="text-sm text-orange-700 font-medium flex items-center">
                        <span className="mr-2">⚠️</span>
                        Precio de venta anulado: ${precioOriginal} (Insumo para elaboración)
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="stockMinimo">
                      Stock Mínimo<span className="text-red-500">*</span>
                    </label>
                    <input
                      id="stockMinimo"
                      name="stockMinimo"
                      type="number"
                      value={form.stockMinimo ?? ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setForm((prev) => ({
                            ...prev,
                            stockMinimo: undefined,
                          }));
                        } else {
                          let nuevoStock = Number(value);
                          // Si no es para elaborar, redondear a entero
                          if (!form.esParaElaborar && !isNaN(nuevoStock)) {
                            nuevoStock = Math.round(nuevoStock);
                          }
                          setForm((prev) => ({
                            ...prev,
                            stockMinimo: nuevoStock,
                          }));
                        }
                      }}
                      className="w-full border rounded px-3 py-2"
                      required
                      min={0}
                      step={form.esParaElaborar ? '0.01' : '1'}
                      placeholder="Ingrese el stock mínimo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="categoriaPadre">
                      Categoría<span className="text-red-500">*</span>
                    </label>
                    <select
                      id="categoriaPadre"
                      name="categoriaPadre"
                      value={selectedCategoriaPadreId ?? ''}
                      onChange={handleCategoriaPadreChange}
                      className="w-full border rounded px-3 py-2"
                      required
                    >
                      <option value="">Seleccionar Categoría</option>
                      {categoriasPadre.map((cat) => (
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
                        value={selectedSubcategoriaId ?? ''}
                        onChange={handleSubcategoriaChange}
                        className="w-full border rounded px-3 py-2"
                        required
                      >
                        <option value="">Seleccionar Subcategoría</option>
                        {subcategorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.denominacion}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}{' '}
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="unidadMedida">
                      Unidad de Medida<span className="text-red-500">*</span>
                    </label>{' '}
                    <div className="flex gap-2">
                      <select
                        id="unidadMedida"
                        name="unidadMedida"
                        value={form.unidadMedida?.id ?? ''}
                        onChange={handleUnidadChange}
                        className="flex-1 border rounded px-3 py-2"
                        required
                      >
                        <option value="">Seleccionar Unidad de Medida</option>
                        {unidadesLocal.map((uni) => (
                          <option key={uni.id} value={uni.id}>
                            {uni.denominacion}
                          </option>
                        ))}
                      </select>{' '}
                      <button
                        type="button"
                        onClick={handleAgregarUnidad}
                        className="bg-primary hover:bg-primarydark text-blanco px-3 py-2 rounded font-bold text-lg leading-none"
                        title="Agregar nueva unidad de medida"
                      >
                        +
                      </button>
                    </div>
                    {/* Mostrar advertencia si la unidad original del insumo ya no está disponible */}
                    {initialValues.unidadMedida &&
                      mode === 'edit' &&
                      !unidadesLocal.find((u) => u.id === initialValues.unidadMedida?.id) && (
                        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm mt-1">
                          ⚠️ La unidad de medida original "{initialValues.unidadMedida.denominacion}
                          " ya no está disponible.
                        </div>
                      )}
                  </div>
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <input
                      id="habilitado"
                      type="checkbox"
                      checked={isHabilitado}
                      onChange={() => setIsHabilitado((prev) => !prev)}
                    />
                    <label htmlFor="habilitado" className="text-base select-none cursor-pointer">
                      Habilitado
                    </label>
                  </div>{' '}
                  <div className="flex justify-center items-center gap-2 mt-2">
                    <input
                      id="esParaElaborar"
                      type="checkbox"
                      checked={!!form.esParaElaborar}
                      onChange={() =>
                        setForm((prev) => {
                          const nuevoEsParaElaborar = !prev.esParaElaborar;
                          if (nuevoEsParaElaborar && prev.precioVenta && prev.precioVenta > 0) {
                            // Guardar el precio original antes de anularlo
                            setPrecioOriginal(prev.precioVenta);
                          } else if (!nuevoEsParaElaborar) {
                            // Si se desmarca, limpiar el precio original
                            setPrecioOriginal(null);
                          }

                          return {
                            ...prev,
                            esParaElaborar: nuevoEsParaElaborar,
                            precioVenta: nuevoEsParaElaborar ? 0 : prev.precioVenta,
                          };
                        })
                      }
                    />
                    <label
                      htmlFor="esParaElaborar"
                      className="text-base select-none cursor-pointer"
                    >
                      Es para elaborar
                    </label>
                  </div>{' '}
                </div>

                {/* Columna derecha: Imagen */}
                <div className="flex-1 border-l pl-4 flex flex-col justify-center">
                  <h4 className="text-lg font-medium mb-4 text-center">Imagen</h4>
                  <div className="flex-1 flex items-center justify-center">
                    {mode === 'add' || mode === 'edit' ? (
                      <div className="w-full flex flex-col items-center">
                        {imagenPreview && (
                          <img
                            src={imagenPreview}
                            alt="Preview"
                            className="mb-4 rounded max-h-40 object-contain border"
                          />
                        )}

                        {/* Input file oculto */}
                        <input
                          id="imagen-upload-insumo"
                          type="file"
                          accept="image/*"
                          className="hidden"
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

                        {/* Botón customizado dinámico */}
                        {selectedImageFile ? (
                          // Botón compacto cuando hay imagen seleccionada
                          <label
                            htmlFor="imagen-upload-insumo"
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
                            htmlFor="imagen-upload-insumo"
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
                    ) : // Modo view
                    imagenPreview ? (
                      <img
                        src={imagenPreview}
                        alt="Imagen del insumo"
                        className="rounded max-h-40 object-contain border"
                      />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-center gap-2 pt-4 border-t mt-4">
                <button type="button" className="bg-gray-300 px-4 py-2 rounded" onClick={onClose}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${
                    tieneErrores
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary text-blanco hover:bg-primarydark'
                  }`}
                  disabled={tieneErrores}
                  title={
                    stockMayorAlOriginal
                      ? 'No se puede aumentar el stock. Use el módulo de compras.'
                      : denominacionError
                        ? denominacionError
                        : isValidatingDenominacion
                          ? 'Validando denominación...'
                          : undefined
                  }
                >
                  {mode === 'add' ? 'Crear' : 'Guardar'}
                </button>{' '}
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal para agregar unidad de medida */}
      <ModalUnidadMedidaForm
        open={openUnidadModal}
        onClose={() => setOpenUnidadModal(false)}
        initialValues={{ denominacion: '' }}
        onSubmit={handleSubmitUnidad}
        mode="add"
      />
    </div>
  );
};

export default ModalInsumoForm;

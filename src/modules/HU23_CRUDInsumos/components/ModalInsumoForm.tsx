import { useCallback, useEffect, useState } from 'react';
import type { ArticuloInsumo } from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import type { UnidadMedida } from '../../../types/UnidadMedida';
import { ModalUnidadMedidaForm } from '../../HU_CRUD_UnidadesMedida';
import { useUnidadMedidaStore } from '../../HU_CRUD_UnidadesMedida/services/unidadMedidaStore';
import { useInsumoStore } from '../services/insumoStore';
import * as unidadMedidaService from '../../../shared/services/unidadMedidaService';
import { checkDenominacionStatus } from '../../../shared/services/articuloInsumoService';
import { registrarCompra } from '../../HU24_CompraIngredientes/services/compraInsumoService';
import type { NuevaCompraDTO, CompraInsumoDTO } from '../../HU24_CompraIngredientes/model';
import ModalSiNo from '../../../shared/components/abmGenerica/components/modals/ModalSiNo';
import CompraIngredientesModal from '../../HU24_CompraIngredientes/components/CompraIngredientesModal';
import type { ArticuloManufacturado } from '../../../types/Articulo';

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
  // Usar el store de insumos para refrescar después de compras
  const { fetchInsumos } = useInsumoStore();

  // Estados para validación de duplicados
  const [denominacionError, setDenominacionError] = useState<string>('');
  const [isValidatingDenominacion, setIsValidatingDenominacion] = useState(false);
  const [denominacionStatus, setDenominacionStatus] = useState<{
    isActive: boolean;
    isDeleted: boolean;
    message: string;
  } | null>(null);

  // Estado para controlar ajuste de stock
  const [requiereAjusteStock] = useState(false);
  const [cantidadAjuste] = useState(0);

  // Estados para modales de confirmación
  const [modalConfirmacion, setModalConfirmacion] = useState({
    open: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Estados para modal de compra de ingredientes
  const [openCompraModal, setOpenCompraModal] = useState(false);

  // Estado para rastrear compras realizadas durante la sesión
  const [comprasRealizadas, setComprasRealizadas] = useState<
    { insumoId: number; cantidadTotal: number }[]
  >([]);

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
    setComprasRealizadas([]); // Limpiar compras realizadas al abrir
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

  // Función helper para mostrar modal de confirmación
  const mostrarModal = (title: string, description: string, onConfirm: () => void) => {
    setModalConfirmacion({
      open: true,
      title,
      description,
      onConfirm,
    });
  };

  const cerrarModal = () => {
    setModalConfirmacion((prev) => ({ ...prev, open: false }));
  };

  // Funciones para manejar el modal de compra
  const handleRealizarCompra = () => {
    setOpenCompraModal(true);
  };

  const handleCloseCompraModal = () => {
    setOpenCompraModal(false);
  };

  const handleCompraRegistrada = async (compra: CompraInsumoDTO) => {
    // Cuando se registra una compra, refrescamos los insumos para actualizar el stock
    try {
      await fetchInsumos();

      // Buscar si la compra incluye el insumo actual y actualizar el formulario
      let mensajeDetalle = '';
      if (form.id && compra.detalles) {
        const detalleInsumoActual = compra.detalles.find((detalle) => detalle.insumoId === form.id);
        if (detalleInsumoActual) {
          // Registrar la compra realizada para evitar ajustes innecesarios
          setComprasRealizadas((prev) => {
            const existente = prev.find((c) => c.insumoId === form.id);
            if (existente) {
              // Actualizar la cantidad total comprada
              return prev.map((c) =>
                c.insumoId === form.id
                  ? { ...c, cantidadTotal: c.cantidadTotal + detalleInsumoActual.cantidad }
                  : c
              );
            } else {
              // Agregar nueva compra
              return [...prev, { insumoId: form.id!, cantidadTotal: detalleInsumoActual.cantidad }];
            }
          });

          // Actualizar el stock actual en el formulario
          const nuevoStock = (form.stockActual ?? 0) + detalleInsumoActual.cantidad;
          setForm((prev) => ({
            ...prev,
            stockActual: nuevoStock,
          }));

          mensajeDetalle =
            `\n\n📦 Stock actualizado de "${form.denominacion}":\n` +
            `• Cantidad comprada: ${detalleInsumoActual.cantidad} ${form.unidadMedida?.denominacion || 'unidades'}\n` +
            `• Nuevo stock: ${nuevoStock.toFixed(form.esParaElaborar ? 2 : 0)} ${form.unidadMedida?.denominacion || 'unidades'}`;
        }
      }

      setOpenCompraModal(false);

      // Mostrar mensaje de éxito
      mostrarModal(
        '✅ Compra realizada exitosamente',
        `La compra "${compra.denominacion}" se registró correctamente por un total de $${compra.totalCompra.toFixed(2)}.${mensajeDetalle}`,
        () => {}
      );

      console.log('Compra registrada y stock actualizado:', compra);
    } catch (error) {
      console.error('Error al actualizar los insumos después de la compra:', error);
      // Aún así cerramos el modal pero mostramos un mensaje
      setOpenCompraModal(false);
      mostrarModal(
        'Compra realizada',
        'La compra se realizó exitosamente, pero hubo un problema al actualizar la vista. Por favor, recarga la página para ver los cambios.',
        () => {}
      );
    }
  };

  const handleActualizarPrecios = (
    _insumosConCambios: any[],
    _articulosAfectados: ArticuloManufacturado[]
  ) => {
    // Esta función se ejecuta cuando hay cambios de precios desde el modal de compra
    // Por ahora solo cerramos el modal de compra
    setOpenCompraModal(false);
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

  // Función para generar ajuste de stock automático
  const generarAjusteStock = async (insumo: ArticuloInsumo, cantidadAjuste: number) => {
    try {
      const denominacionAjuste = `Ajuste de Stock [${insumo.denominacion}]`;

      // El subtotal se calculará en el backend como precioUnitario * cantidad
      const ajusteDTO: NuevaCompraDTO = {
        denominacion: denominacionAjuste,
        detalles: [
          {
            insumoId: insumo.id,
            cantidad: cantidadAjuste, // Puede ser negativo para reducir stock
            precioUnitario: insumo.precioCompra ?? 0,
            subtotal: (insumo.precioCompra ?? 0) * cantidadAjuste, // precioUnitario * cantidad
          },
        ],
      };

      await registrarCompra(ajusteDTO);
    } catch (error) {
      console.error('❌ Error al generar ajuste de stock:', error);
      throw new Error('No se pudo generar el ajuste de stock automático');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de duplicados antes de enviar
    if (denominacionError || denominacionStatus?.isActive || denominacionStatus?.isDeleted) {
      mostrarModal(
        'Error de validación',
        'Por favor, corrige los errores antes de continuar.',
        () => {}
      );
      return;
    }

    // Validación de campos requeridos
    if (!form.denominacion?.trim()) {
      mostrarModal('Campo requerido', 'La denominación es requerida.', () => {});
      return;
    }

    if (form.stockMinimo === undefined || form.stockMinimo < 0) {
      mostrarModal(
        'Campo requerido',
        'El stock mínimo es requerido y debe ser mayor o igual a 0.',
        () => {}
      );
      return;
    }

    // La validación de stock ahora se maneja con ajustes automáticos
    // Ya no impedimos el aumento de stock, se genera una transacción automática

    // Validar unidad de medida solo en modo 'add', en 'edit' no se puede cambiar
    if (mode === 'add' && (!form.unidadMedida || !form.unidadMedida.id)) {
      mostrarModal('Campo requerido', 'Debes seleccionar una unidad de medida válida.', () => {});
      return;
    }
    if (!form.categoria || !form.categoria.id) {
      mostrarModal('Campo requerido', 'Debes seleccionar una categoría válida.', () => {});
      return;
    }

    // Detectar si hay cambios en el stock y generar ajuste automático
    // NUEVA LÓGICA: Solo genera ajuste si hay diferencia real después de considerar compras manuales
    if (
      mode === 'edit' &&
      form.stockActual !== undefined &&
      initialValues.stockActual !== undefined &&
      form.stockActual !== initialValues.stockActual
    ) {
      // Calcular el stock esperado considerando las compras realizadas durante la sesión
      let stockEsperado = initialValues.stockActual;
      const compraDelInsumo = comprasRealizadas.find((c) => c.insumoId === form.id);
      if (compraDelInsumo) {
        stockEsperado += compraDelInsumo.cantidadTotal;
      }

      // Solo generar ajuste si hay diferencia entre el stock esperado y el que ingresó el usuario
      // Esto evita generar ajustes innecesarios cuando el usuario hace compras manuales
      const cantidadAjuste = form.stockActual - stockEsperado;

      if (cantidadAjuste !== 0) {
        try {
          // Crear objeto insumo completo para el ajuste
          const insumoCompleto: ArticuloInsumo = {
            ...(form as ArticuloInsumo),
            id: form.id!,
          };

          await generarAjusteStock(insumoCompleto, cantidadAjuste);

          // Mostrar mensaje de confirmación
          const tipoAjuste = cantidadAjuste > 0 ? 'incremento' : 'reducción';
          const mensaje =
            `✅ Se generó automáticamente una transacción de ajuste de stock:\n\n` +
            `• Insumo: ${form.denominacion}\n` +
            `• ${tipoAjuste === 'incremento' ? 'Incremento' : 'Reducción'}: ${Math.abs(cantidadAjuste)} ${form.unidadMedida?.denominacion || 'unidades'}\n` +
            `• Stock original: ${initialValues.stockActual}\n` +
            `• Stock después de compras: ${stockEsperado}\n` +
            `• Stock final: ${form.stockActual}\n` +
            `• Valor del ajuste: $${(cantidadAjuste * (form.precioCompra ?? 0)).toFixed(2)}`;

          mostrarModal('Ajuste de stock generado', mensaje, () => {});
        } catch (error) {
          mostrarModal(
            'Error',
            '❌ Error al generar el ajuste de stock automático. Por favor, inténtelo nuevamente.',
            () => {}
          );
          return;
        }
      }
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
  // Verificar si el formulario tiene errores
  const tieneErrores = Boolean(
    denominacionError ||
      denominacionStatus?.isActive ||
      denominacionStatus?.isDeleted ||
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
                  {/* Descomentar en caso que querramos mostrar precio costo */}
                  {/* <div>
                    <label className="block text-sm font-medium mb-1">Precio Compra</label>
                    <div className="w-full border rounded px-3 py-2 bg-gray-100">
                      ${form.precioCompra ?? 0}
                    </div>
                  </div> */}

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
                  {/* Campo Precio Compra Descomentar en caso que querramos mostrar precio costo */}
                  {/* <div>
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
                  </div> */}
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
                      {/* Información sobre compras realizadas */}
                      {comprasRealizadas.find((c) => c.insumoId === form.id) && (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm font-medium text-green-700 flex items-center">
                            <span className="mr-2">🛒</span>
                            Compra realizada en esta sesión
                          </p>
                          <div className="mt-1 text-xs text-green-600">
                            {(() => {
                              const compra = comprasRealizadas.find((c) => c.insumoId === form.id);
                              const stockOriginal = initialValues.stockActual ?? 0;
                              const stockDespuesCompra =
                                stockOriginal + (compra?.cantidadTotal ?? 0);
                              const stockActual = form.stockActual ?? 0;
                              const ajusteManual = stockActual - stockDespuesCompra;

                              return (
                                <>
                                  • Stock original:{' '}
                                  {stockOriginal.toFixed(form.esParaElaborar ? 2 : 0)}{' '}
                                  {form.unidadMedida?.denominacion || 'unidades'}
                                  <br />• Cantidad comprada:{' '}
                                  {compra?.cantidadTotal?.toFixed(form.esParaElaborar ? 2 : 0)}{' '}
                                  {form.unidadMedida?.denominacion || 'unidades'}
                                  <br />• Stock después de compra:{' '}
                                  {stockDespuesCompra.toFixed(form.esParaElaborar ? 2 : 0)}{' '}
                                  {form.unidadMedida?.denominacion || 'unidades'}
                                  {ajusteManual !== 0 && (
                                    <>
                                      <br />• Ajuste manual adicional: {ajusteManual > 0 ? '+' : ''}
                                      {ajusteManual.toFixed(form.esParaElaborar ? 2 : 0)}{' '}
                                      {form.unidadMedida?.denominacion || 'unidades'}
                                      <br />
                                      <span className="text-orange-600 font-medium">
                                        ⚠️ Se generará un ajuste automático al guardar
                                      </span>
                                    </>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}
                      {/* Aviso para ajuste de stock automático */}
                      {requiereAjusteStock && (
                        <div
                          className={`mt-2 p-3 border rounded-md ${
                            cantidadAjuste > 0
                              ? 'bg-orange-50 border-orange-200'
                              : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <p
                            className={`text-sm font-medium flex items-center ${
                              cantidadAjuste > 0 ? 'text-orange-700' : 'text-green-700'
                            }`}
                          >
                            <span className="mr-2">🔄</span>
                            Se generará automáticamente una transacción "Ajuste de Stock [
                            {form.denominacion}]"
                          </p>
                          <div
                            className={`mt-1 text-xs ${
                              cantidadAjuste > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}
                          >
                            • {cantidadAjuste > 0 ? 'Incremento' : 'Reducción'}:{' '}
                            {Math.abs(cantidadAjuste)}{' '}
                            {form.unidadMedida?.denominacion || 'unidades'}
                            <br />• Valor de la transacción: $
                            {(cantidadAjuste * (form.precioCompra ?? 0)).toFixed(2)}
                            <br />• Stock original: {initialValues.stockActual ?? 0} → Nuevo stock:{' '}
                            {form.stockActual ?? 0}
                          </div>
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
                    </label>
                    {mode === 'edit' ? (
                      // En modo edición, solo mostrar la unidad de medida (no editable)
                      <div className="w-full border rounded px-3 py-2 bg-gray-100">
                        {form.unidadMedida?.denominacion ?? 'Sin unidad de medida'}
                      </div>
                    ) : (
                      // En modo agregar, mostrar el select con botón +
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
                        </select>
                        <button
                          type="button"
                          onClick={handleAgregarUnidad}
                          className="bg-primary hover:bg-primarydark text-blanco px-3 py-2 rounded font-bold text-lg leading-none"
                          title="Agregar nueva unidad de medida"
                        >
                          +
                        </button>
                      </div>
                    )}
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
                {mode === 'edit' && (
                  <button
                    type="button"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    onClick={handleRealizarCompra}
                    title={`Realizar compra de ${form.denominacion || 'este insumo'}`}
                  >
                    🛒 Realizar Compra
                  </button>
                )}
                <button
                  type="submit"
                  className={`px-4 py-2 rounded ${
                    tieneErrores
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      : 'bg-primary text-blanco hover:bg-primarydark'
                  }`}
                  disabled={tieneErrores}
                  title={
                    denominacionError
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

      {/* Modal de confirmación */}
      <ModalSiNo
        open={modalConfirmacion.open}
        onClose={cerrarModal}
        onConfirm={() => {
          modalConfirmacion.onConfirm();
          cerrarModal();
        }}
        title={modalConfirmacion.title}
        description={modalConfirmacion.description}
        confirmText="Aceptar"
        cancelText="Cerrar"
      />

      {/* Modal de Compra de Ingredientes */}
      <CompraIngredientesModal
        open={openCompraModal}
        onClose={handleCloseCompraModal}
        insumosPreseleccionados={form.id ? [form as ArticuloInsumo] : []}
        onCompraRegistrada={handleCompraRegistrada}
        onActualizarPrecios={handleActualizarPrecios}
      />
    </div>
  );
};

export default ModalInsumoForm;

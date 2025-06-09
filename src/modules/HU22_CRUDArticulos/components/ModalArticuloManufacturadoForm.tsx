import React, { useEffect, useState } from 'react';
import type {
  ArticuloManufacturado,
  ArticuloInsumo,
  ArticuloManufacturadoDetalle,
} from '../../../types/Articulo';
import type { Categoria } from '../../../types/Categoria';
import * as categoriaService from '../../../shared/services/categoriaService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';
import ModalSeleccionInsumos from './ModalSeleccionInsumos';

interface ModalArticuloManufacturadoFormProps {
  open: boolean;
  onClose: () => void;
  initialValues: Partial<ArticuloManufacturado>;
  onSubmit: (values: Partial<ArticuloManufacturado>) => void;
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
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
  const [selectedSubcategoriaId, setSelectedSubcategoriaId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string | number>>({});
  const [detalles, setDetalles] = useState<ArticuloManufacturadoDetalle[]>([]);
  const [openModalInsumos, setOpenModalInsumos] = useState(false);

  // Cargar categorías al montar
  useEffect(() => {
    categoriaService.getAllCategorias().then(setCategorias);
  }, []);

  // Cuando abro el modal o cambian los datos iniciales, setear valores y subcategorías
  useEffect(() => {
    setForm(initialValues);
    setImagenPreview(initialValues.imagen?.url ?? null);
    setDetalles(initialValues.articuloManufacturadoDetalles ?? []);
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

  // Calcular el costo estimado total de los insumos
  const calcularCostoEstimado = (): number => {
    return detalles.reduce((total, detalle) => {
      const precioUnitario = detalle.articuloInsumo?.precioCompra ?? 0;
      return total + precioUnitario * detalle.cantidad;
    }, 0);
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
  };

  // Submit: llama a onSubmit solo en modo add/edit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mode === 'view') return;
    let finalCategoriaId: number | null = null;
    if (selectedSubcategoriaId && selectedSubcategoriaId > 0) {
      finalCategoriaId = selectedSubcategoriaId;
    } else if (selectedCategoriaId && selectedCategoriaId > 0) {
      finalCategoriaId = selectedCategoriaId;
    } else if (formValues.categoria) {
      finalCategoriaId = Number(formValues.categoria);
    }
    // El objeto values es igual para add/edit, el servicio se decide fuera
    onSubmit({
      ...form,
      denominacion: String(formValues.denominacion ?? ''),
      precioVenta: Number(formValues.precioVenta ?? 0),
      descripcion: String(formValues.descripcion ?? ''),
      tiempoEstimadoMinutos: Number(formValues.tiempoEstimadoMinutos ?? 0),
      categoriaId: finalCategoriaId ?? undefined,
      imagen: form.imagen,
      articuloManufacturadoDetalles: detalles,
    });
  };

  // Render
  return (
    <Modal open={open} onClose={onClose} title={getModalTitle()}>
      {mode === 'view' ? (
        <div className="flex flex-col h-full">
          <div className="flex flex-row flex-grow">
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Denominación</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">
                  {formValues.denominacion}
                </div>
              </div>
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
                    {subcategorias.find((cat) => cat.id === selectedSubcategoriaId)?.denominacion ??
                      ''}
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
                <label className="block text-sm font-medium mb-1">Tiempo Estimado (minutos)</label>
                <div className="w-full border rounded px-3 py-2 bg-gray-100">
                  {formValues.tiempoEstimadoMinutos}
                </div>
              </div>
            </div>
            <div className="flex-1 p-4 max-h-96 overflow-y-auto border-l">
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
                <p className="text-gray-500 italic text-center py-4">No hay insumos configurados</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t">
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
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex flex-row flex-grow">
            {/* Columna izquierda: Formulario */}
            <div className="flex-1 p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="denominacion">
                  Denominación<span className="text-red-500">*</span>
                </label>
                <input
                  id="denominacion"
                  name="denominacion"
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={formValues.denominacion?.toString() ?? ''}
                  onChange={(e) => handleInputChange('denominacion', e.target.value)}
                />
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
                    .filter((cat) => cat.tipoCategoria === null)
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
                <label className="block text-sm font-medium mb-1" htmlFor="tiempoEstimadoMinutos">
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
            </div>
            {/* Columna derecha: Lista de insumos */}
            <div className="flex-1 p-4 max-h-96 overflow-y-auto border-l">
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
                        onClick={() => {
                          const nuevaCantidad = prompt(
                            'Editar cantidad',
                            detalle.cantidad.toString()
                          );
                          if (
                            nuevaCantidad !== null &&
                            !isNaN(Number(nuevaCantidad)) &&
                            Number(nuevaCantidad) > 0
                          ) {
                            handleEditCantidad(index, Number(nuevaCantidad));
                          }
                        }}
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
              {/* El botón solo se muestra en modo add/edit, nunca en view */}
              {(mode === 'add' || mode === 'edit') && (
                <button
                  type="button"
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded mt-2"
                  onClick={() => setOpenModalInsumos(true)}
                >
                  + Agregar Insumo
                </button>
              )}
            </div>
          </div>
          {/* Botones */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {mode === 'add' ? 'Crear' : 'Guardar'}
            </button>
          </div>
        </form>
      )}
      {/* Modal para selección de insumos */}
      <ModalSeleccionInsumos
        open={openModalInsumos}
        onClose={() => setOpenModalInsumos(false)}
        onAddInsumo={handleAddInsumo}
        insumosExistentes={
          detalles.map((d) => d.articuloInsumo).filter(Boolean) as ArticuloInsumo[]
        }
      />
    </Modal>
  );
};

export default ModalArticuloManufacturadoForm;

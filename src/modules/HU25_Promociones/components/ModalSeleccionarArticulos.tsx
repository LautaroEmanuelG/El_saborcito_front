import React, { useEffect, useState } from 'react';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import * as articuloManufacturadoService from '../../../shared/services/articuloManufacturadoService';
import * as articuloInsumoService from '../../../shared/services/articuloInsumoService';
import * as categoriaService from '../../../shared/services/categoriaService';
import Modal from '../../../shared/components/abmGenerica/components/modals/Modal';
import type { Categoria } from '../../../types/Categoria';

interface ModalSeleccionarArticulosProps {
  open: boolean;
  onClose: () => void;
  onAddArticulo: (articulo: ArticuloManufacturado, cantidad: number) => void;
  onAddMultipleArticulos?: (
    articulos: { articulo: ArticuloManufacturado; cantidad: number }[]
  ) => void;
  articulosExistentes?: ArticuloManufacturado[];
}

const ModalSeleccionarArticulos: React.FC<ModalSeleccionarArticulosProps> = ({
  open,
  onClose,
  onAddArticulo,
  onAddMultipleArticulos,
  articulosExistentes = [],
}) => {
  const [articulos, setArticulos] = useState<ArticuloManufacturado[]>([]);
  const [filteredArticulos, setFilteredArticulos] = useState<ArticuloManufacturado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticulos, setSelectedArticulos] = useState<Map<number, number>>(new Map()); // Map de id del artículo -> cantidad
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  useEffect(() => {
    if (open) {
      loadArticulos();
      loadCategorias();
      setSelectedArticulos(new Map());
      setSearchTerm('');
    }
  }, [open]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = articulos.filter((articulo) =>
        articulo.denominacion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticulos(filtered);
    } else {
      setFilteredArticulos(articulos);
    }
  }, [searchTerm, articulos]);

  const loadArticulos = async () => {
    setLoading(true);
    setError(null);
    try {
      const [manufacturados, insumos] = await Promise.all([
        articuloManufacturadoService.getAllArticuloManufacturados(),
        articuloInsumoService.getAllArticuloInsumos(),
      ]);
      // Filtrar insumos que no son para elaborar
      const insumosNoElaborar = (insumos ?? []).filter(
        (insumo: any) => insumo.esParaElaborar === false
      );
      // Unir ambos arrays
      const todos = [...(manufacturados ?? []), ...insumosNoElaborar];
      setArticulos(todos);
      setFilteredArticulos(todos);
    } catch (err) {
      setError('Error al cargar artículos');
      console.error('Error loading articulos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const data = await categoriaService.getAllCategorias();
      setCategorias(data ?? []);
    } catch (err) {
      // Puedes agregar manejo de error si lo deseas
    }
  };

  const getCategoriaPadreDenominacion = (categoriaId?: number): string => {
    if (!categoriaId) return '-';
    let categoria = categorias.find((cat) => cat.id === categoriaId);
    // Si la categoría tiene tipoCategoria, buscar la raíz
    while (categoria && categoria.tipoCategoria) {
      const nextId = categoria.tipoCategoria?.id;
      if (!nextId) break;
      const nextCategoria = categorias.find((cat) => cat.id === nextId);
      if (!nextCategoria) break;
      categoria = nextCategoria;
    }
    return categoria?.denominacion ?? '-';
  };
  const handleAddArticulos = () => {
    if (selectedArticulos.size === 0 || !hasValidQuantities()) return;

    const articulosToAdd = Array.from(selectedArticulos.entries())
      .filter(([, cantidad]) => cantidad > 0) // Solo incluir artículos con cantidad > 0
      .map(([articuloId, cantidad]) => {
        const articulo = articulos.find((a) => a.id === articuloId)!;
        return { articulo, cantidad };
      });

    if (onAddMultipleArticulos) {
      onAddMultipleArticulos(articulosToAdd);
    } else {
      // Fallback: agregar uno por uno si no se proporciona la función múltiple
      articulosToAdd.forEach(({ articulo, cantidad }) => {
        onAddArticulo(articulo, cantidad);
      });
    }
    onClose();
  };

  const handleArticuloToggle = (articulo: ArticuloManufacturado) => {
    setSelectedArticulos((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(articulo.id!)) {
        newMap.delete(articulo.id!);
      } else {
        newMap.set(articulo.id!, 0); // Cantidad por defecto
      }
      return newMap;
    });
  };

  const handleCantidadChange = (articuloId: number, cantidad: number) => {
    if (cantidad <= 0) {
      setSelectedArticulos((prev) => {
        const newMap = new Map(prev);
        newMap.delete(articuloId);
        return newMap;
      });
    } else {
      setSelectedArticulos((prev) => {
        const newMap = new Map(prev);
        newMap.set(articuloId, cantidad);
        return newMap;
      });
    }
  };

  // Verificar si todos los artículos seleccionados tienen cantidad > 0
  const hasValidQuantities = () => {
    if (selectedArticulos.size === 0) return false;
    return Array.from(selectedArticulos.values()).every((cantidad) => cantidad > 0);
  };
  return (
    <Modal open={open} onClose={onClose} title="🍔 Seleccionar Artículos" maxWidth="max-w-4xl">
      <div className="space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Vista previa de artículos seleccionados */}
        {selectedArticulos.size > 0 && hasValidQuantities() && (
          <div className="bg-blue-50 p-4 rounded border">
            <h4 className="font-medium text-blue-800 mb-2">
              Artículos seleccionados (
              {Array.from(selectedArticulos.values()).filter((cantidad) => cantidad > 0).length}):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {Array.from(selectedArticulos.entries())
                .filter(([, cantidad]) => cantidad > 0) // Solo mostrar artículos con cantidad > 0
                .map(([articuloId, cantidad]) => {
                  const articulo = articulos.find((a) => a.id === articuloId);
                  if (!articulo) return null;
                  return (
                    <div key={articuloId} className="text-sm bg-white p-2 rounded border">
                      <div className="font-medium">{articulo.denominacion}</div>
                      <div className="text-gray-600">Cantidad: {cantidad}</div>
                      <div className="text-green-600">Precio: ${articulo.precioVenta}</div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Búsqueda */}
        <div>
          <label className="block text-sm font-medium mb-1">Buscar artículo</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Escribe para buscar..."
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Lista de artículos */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Seleccionar artículos (haz clic para agregar/quitar)
          </label>
          {loading ? (
            <div className="text-center py-4">Cargando artículos...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredArticulos.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {searchTerm ? 'No se encontraron artículos' : 'No hay artículos disponibles'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded p-2">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {filteredArticulos.map((articulo) => {
                  const yaSeleccionado = articulosExistentes.some(
                    (existing) => existing.id === articulo.id
                  );
                  const isSelected = selectedArticulos.has(articulo.id!);
                  const cantidad = selectedArticulos.get(articulo.id!) || 0;

                  return (
                    <div
                      key={articulo.id}
                      className={`p-3 rounded border transition-colors ${
                        isSelected
                          ? 'bg-blue-100 border-blue-300'
                          : yaSeleccionado
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => !yaSeleccionado && handleArticuloToggle(articulo)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="font-medium flex items-center gap-2">
                              {isSelected && <span className="text-blue-600">✓</span>}
                              {articulo.denominacion}
                              {yaSeleccionado && (
                                <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                  Ya agregado
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              Categoría: {getCategoriaPadreDenominacion(articulo.categoriaId)}
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-green-600">
                            ${articulo.precioVenta}
                          </div>
                        </div>
                      </div>

                      {/* Campo de cantidad para artículos seleccionados */}
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-blue-200">
                          <label className="block text-xs font-medium mb-1">Cantidad</label>
                          <input
                            type="number"
                            value={cantidad}
                            onChange={(e) =>
                              handleCantidadChange(articulo.id!, Number(e.target.value))
                            }
                            min="0.01"
                            step="0.01"
                            className="w-full border rounded px-2 py-1 text-sm"
                            placeholder="Cantidad"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            {selectedArticulos.size > 0 &&
              `${Array.from(selectedArticulos.values()).filter((cantidad) => cantidad > 0).length} artículo(s) con cantidad válida`}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`font-bold py-2 px-4 rounded bg-primary hover:bg-primarydark text-white ${
                selectedArticulos.size === 0 || !hasValidQuantities()
                  ? 'opacity-60 cursor-not-allowed'
                  : ''
              }`}
              onClick={handleAddArticulos}
              disabled={selectedArticulos.size === 0 || !hasValidQuantities()}
            >
              Agregar{' '}
              {Array.from(selectedArticulos.values()).filter((cantidad) => cantidad > 0).length}{' '}
              Artículo(s)
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSeleccionarArticulos;

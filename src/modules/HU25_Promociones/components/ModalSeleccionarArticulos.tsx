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
  articulosExistentes?: ArticuloManufacturado[];
}

const ModalSeleccionarArticulos: React.FC<ModalSeleccionarArticulosProps> = ({
  open,
  onClose,
  onAddArticulo,
  articulosExistentes = [],
}) => {
  const [articulos, setArticulos] = useState<ArticuloManufacturado[]>([]);
  const [filteredArticulos, setFilteredArticulos] = useState<ArticuloManufacturado[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloManufacturado | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    if (open) {
      loadArticulos();
      loadCategorias();
      setSelectedArticulo(null);
      setCantidad(1);
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

  const handleAddArticulo = () => {
    if (!selectedArticulo || cantidad <= 0) return;
    onAddArticulo(selectedArticulo, cantidad);
    onClose();
  };

  const handleArticuloSelect = (articulo: ArticuloManufacturado) => {
    setSelectedArticulo(articulo);
  };

  return (
    <Modal open={open} onClose={onClose} title="🍔 Seleccionar Artículos" maxWidth="max-w-md">
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {/* Vista previa de artículo seleccionado */}
        {selectedArticulo && (
          <div className="bg-blue-50 p-3 rounded border">
            <h4 className="font-medium text-blue-800 mb-1">Artículo seleccionado:</h4>
            <div className="text-sm">
              <div>
                <strong>{selectedArticulo.denominacion}</strong>
              </div>
              <div>Precio: ${selectedArticulo.precioVenta}</div>
              <div>Categoría: {getCategoriaPadreDenominacion(selectedArticulo.categoriaId)}</div>
              <div>Cantidad: {cantidad}</div>
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
          <label className="block text-sm font-medium mb-2">Seleccionar artículo</label>
          {loading ? (
            <div className="text-center py-4">Cargando artículos...</div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : filteredArticulos.length === 0 ? (
            <div className="text-gray-500 text-center py-4">
              {searchTerm ? 'No se encontraron artículos' : 'No hay artículos disponibles'}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto border rounded p-2 space-y-1">
              {filteredArticulos.map((articulo) => {
                const yaSeleccionado = articulosExistentes.some(
                  (existing) => existing.id === articulo.id
                );
                return (
                  <div
                    key={articulo.id}
                    className={`p-2 rounded cursor-pointer border transition-colors ${
                      selectedArticulo?.id === articulo.id
                        ? 'bg-blue-100 border-blue-300'
                        : yaSeleccionado
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                    onClick={() => handleArticuloSelect(articulo)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium flex items-center gap-2">
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
                );
              })}
            </div>
          )}
        </div>

        {/* Cantidad */}
        {selectedArticulo && (
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad</label>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(Number(e.target.value))}
              min="1"
              step="1"
              className="w-full border rounded px-3 py-2"
              placeholder="Ingrese la cantidad"
            />
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-center gap-2 pt-2 border-t">
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
              !(selectedArticulo && cantidad > 0) ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={handleAddArticulo}
            disabled={!selectedArticulo || cantidad <= 0}
          >
            Agregar Artículo
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalSeleccionarArticulos;

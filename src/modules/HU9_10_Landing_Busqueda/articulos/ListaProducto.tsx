import { useMemo } from 'react';
import { ArticuloManufacturado, ArticuloInsumo } from '../../../types/Articulo';
import {
  useProductStore,
  getArticuloCategoriaId,
  isPromocionNormalizada,
} from '../../../shared/providers/ProductProvider';
import { CardProducto } from './CardProducto';
import { CardPromocion } from '../../HU11_12_Carrito_Confirmacion/CardPromocion';
import type { Promocion, PromocionNormalizada } from '../../../types/Promocion';

interface Props {
  articulos: (ArticuloManufacturado | ArticuloInsumo | PromocionNormalizada)[];
  onProductClick: (articulo: ArticuloManufacturado | ArticuloInsumo | null) => void;
  onPromocionClick?: (promocion: Promocion | null) => void;
}

export const ListaProductos = ({ articulos, onProductClick, onPromocionClick }: Props) => {
  // 🔥 TODOS LOS HOOKS AL INICIO - NUNCA DESPUÉS DE RETURNS
  const { allCategorias, showPromociones, activeCategory } = useProductStore();

  // Separar productos y promociones usando useMemo para optimización
  const soloProductos = useMemo(
    () =>
      articulos.filter(
        (item): item is ArticuloManufacturado | ArticuloInsumo => !isPromocionNormalizada(item)
      ),
    [articulos]
  );

  const promociones = useMemo(() => articulos.filter(isPromocionNormalizada), [articulos]);

  // Filtrar categorías que tienen productos en la lista actual
  const categoriasConProductos = useMemo(() => {
    return allCategorias.filter((categoria) =>
      soloProductos.some((articulo) => getArticuloCategoriaId(articulo) === categoria.id)
    );
  }, [soloProductos, allCategorias]);

  // 🔥 DESPUÉS DE TODOS LOS HOOKS, AHORA SÍ PODEMOS HACER RETURNS CONDICIONALES

  // Si estamos mostrando promociones, renderizar diferente
  if (showPromociones && activeCategory === 'promociones') {
    if (promociones.length === 0) {
      return (
        <p className="text-center text-gray-500 text-xl mt-10">
          No se encontraron promociones disponibles.
        </p>
      );
    }

    return (
      <div className="container pt-0 mx-auto p-4 px-0 flex flex-wrap md:gap-6 mb-6">
        <div className="mb-4 w-full">
          <h2 className="text-2xl font-bold mb-4 text-negro border-b-2 border-primary pb-2">
            Promociones
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 flex-wrap">
            {promociones.map((promocionNormalizada) => (
              <CardPromocion
                key={`promocion-${promocionNormalizada.id}`}
                promocion={promocionNormalizada.promocionOriginal}
                setPromocionModal={onPromocionClick || (() => {})}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Para productos normales
  if (soloProductos.length === 0) {
    return (
      <p className="text-center text-gray-500 text-xl mt-10">
        No se encontraron productos para esta búsqueda.
      </p>
    );
  }

  return (
    <div className="container pt-0 mx-auto p-4 px-0 flex flex-wrap md:gap-6 mb-6">
      {categoriasConProductos.map((categoria) => {
        const productosFiltrados = soloProductos.filter(
          (articulo) => getArticuloCategoriaId(articulo) === categoria.id
        );
        return productosFiltrados.length > 0 ? (
          <div key={categoria.id} className="mb-4 w-full">
            <h2 className="text-2xl font-bold mb-4 text-negro border-b-2 border-primary pb-2">
              {categoria.denominacion}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 md:gap-6 flex-wrap">
              {productosFiltrados.map((articulo) => (
                <CardProducto
                  key={articulo.id}
                  articulo={articulo}
                  setProductoModal={onProductClick}
                />
              ))}
            </div>
          </div>
        ) : null;
      })}
    </div>
  );
};

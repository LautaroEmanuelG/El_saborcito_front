import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../../../HU11_CarritoCompras/components/BtnAgregarCarrito';
import type { ProductoValor } from '../../../../types/types';
import { getAllArticulos } from '../../../../shared/services/articuloService';

interface ActiveSliderProps {
  setProductoModal: (producto: ProductoValor) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({ setProductoModal }) => {
  const [articulos, setArticulos] = React.useState<ProductoValor[]>([]);
  const handleProductClick = (product: ProductoValor) => {
    setProductoModal(product);
  };
  useEffect(() => {
    const fetchArticulos = async () => {
      const data = await getAllArticulos();
      setArticulos(data);
    };
    fetchArticulos();
  }, []);
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="w-full h-[400px]"
    >
      {articulos.map((articulo, index) => (
        <SwiperSlide
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleProductClick(articulo);
          }}
          key={index}
          /* Efecto oscuro sobre la imagen */
          className="relative flex flex-col items-center justify-center cursor-pointer rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>

          {/* Elemento picture para cargar imágenes en diferentes formatos */}
          <picture>
            <source type="image/webp" />
            <img
              src={
                Array.isArray(articulo.imagen) && articulo.imagen.length > 0
                  ? articulo.imagen[0]
                  : Array.isArray(articulo.imagen) && articulo.imagen.length > 1
                    ? articulo.imagen[1]
                    : ''
              }
              alt={articulo.nombre}
              className="object-cover w-full h-full rounded-xl"
            />
          </picture>
          <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
            <h3 className="text-2xl font-semibold">{articulo.nombre}</h3>
            <p className="text-xl font">${articulo.valor.precio.toFixed(2)}</p>
          </div>

          {/* Botón "Agregar al carrito" */}
          <div className="absolute bottom-0 left-0 p-4 ">
            <BtnAgregarCarrito
              position="left"
              product={articulo}
              cantidadProducto={1}
              setCantidadProducto={() => 1}
              onClose={() => {}}
            />
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

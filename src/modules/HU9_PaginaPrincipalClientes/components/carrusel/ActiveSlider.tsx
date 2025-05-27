import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../../../HU11_CarritoCompras/components/BtnAgregarCarrito';
import { getAllArticuloManufacturados } from '../../../../shared/services/articuloManufacturadoService';
import type { ArticuloManufacturado } from '../../../../types/Articulo';

interface ActiveSliderProps {
  setArticuloModal: (articulo: ArticuloManufacturado) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({ setArticuloModal }) => {
  const [articulos, setArticulos] = React.useState<ArticuloManufacturado[]>([]);
  const handleProductClick = (articulo: ArticuloManufacturado) => {
    setArticuloModal(articulo);
  };
  useEffect(() => {
    const fetchArticulos = async () => {
      const data = await getAllArticuloManufacturados();
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
        disableOnInteraction: true,
      }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      className="w-full h-[400px] rounded-xl"
    >
      <SwiperSlide
        key={0}
        /* Efecto oscuro sobre la imagen */
        className="relative flex flex-col items-center justify-center cursor-pointer rounded-xl overflow-hidden"
      >
        <picture>
          <source type="image/png" />
          <img
            src="/img/Banner.png"
            alt="Banner el Saborcito"
            className="object-contain w-full h-full rounded-xl"
          />
        </picture>
        <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
          <h3 className="text-3xl font-semibold w-full justify-center flex pb-6">
            Los mejores sabores, amplia variedad
          </h3>
        </div>
      </SwiperSlide>
      {articulos.map((articulo, index) => (
        <SwiperSlide
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleProductClick(articulo);
          }}
          key={index + 1}
          /* Efecto oscuro sobre la imagen */
          className="relative flex flex-col items-center justify-center cursor-pointer rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>

          {/* Elemento picture para cargar imágenes en diferentes formatos */}
          <picture>
            <source type="image/png" />
            <img
              src={articulo?.imagen?.url ?? '/img/Banner.png'}
              alt={articulo?.denominacion ?? 'Banner el Saborcito'}
              className="object-cover w-full h-full rounded-xl"
            />
          </picture>
          <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
            <h3 className="text-2xl font-semibold">{articulo.denominacion}</h3>
            <p className="text-xl font">${articulo.precioVenta.toFixed(2)}</p>
          </div>

          {/* Botón "Agregar al carrito" */}
          <div className="absolute bottom-0 left-0 p-4 ">
            <BtnAgregarCarrito
              position="left"
              articulo={articulo}
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

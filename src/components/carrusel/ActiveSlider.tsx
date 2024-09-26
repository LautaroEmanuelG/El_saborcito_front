import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';
import '../../styles/styles.css';
import productsData from '../../data/ListaProductos.json'; // Importa el JSON
import type { Producto } from '../../utils/types';

interface ActiveSliderProps {
  setProductoModal: (producto: Producto) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({
  setProductoModal,
}) => {
  const handleProductClick = (product: Producto) => {
    setProductoModal(product);
  };
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      //className="w-full h-screen"
      className="w-full h-[400px]"
      /* 
      Ancho (w-): w-full, w-3/4, w-1/2, w-96 (384px), o valores personalizados como w-[600px].
      Altura (h-): h-full, h-screen, h-64 (256px), h-96 (384px), o h-[400px] para alturas personalizadas.

      O con CSS directamente anachei
      style={{ width: '80%', height: '400px' }}  // Tamaño personalizado
      */
    >
      {productsData.map((product, index) => (
        // <button onClick={() => handleProductClick(product)}>
        <SwiperSlide
          key={index}
          className="relative flex flex-col items-center justify-center">
          {/* Efecto oscuro sobre la imagen */}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>

          {/* Elemento picture para cargar imágenes en diferentes formatos */}
          <picture>
            <source
              srcSet={product.imagen[0]}
              type="image/webp"
            />
            <img
              src={product.imagen[1]}
              alt={product.nombre}
              className="object-cover w-full h-full rounded-xl"
            />
          </picture>

          {/* Contenedor para el detalle del producto 
            mb = margen inferior 
          */}
          <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
            <h3 className="text-2xl font-semibold">{product.nombre}</h3>
            <p className="text-xl font">${product.precio.toFixed(2)}</p>
          </div>

          {/* Botón "Agregar al carrito" */}
          <div className="absolute bottom-0 left-0 p-4 z-10">  {/* z-10 asegura que esté por encima de la paginación */}
            <BtnAgregarCarrito position="left" />
          </div>
        </SwiperSlide>
        // </button>
      ))}
    </Swiper>
  );
};

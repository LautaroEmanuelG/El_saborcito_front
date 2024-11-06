import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';
import '../../styles/styles.css';
import type { ProductoValor } from '../../utils/types';
import { getAllProductos } from '../../utils/services/axios/productoService';

interface ActiveSliderProps {
  setProductoModal: (producto: ProductoValor) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({
  setProductoModal,
}) => {
  const [products, setProducts] = React.useState<ProductoValor[]>([]);
  const handleProductClick = (product: ProductoValor) => {
    setProductoModal(product);
  };
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await getAllProductos();
      setProducts(data);
    };
    fetchProducts();
  });
  return (
    <Swiper
      spaceBetween={30}
      centeredSlides={true}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
      }}
      // pagination={{ clickable: true }}
      navigation={true}
      modules={[Autoplay, Pagination, Navigation]}
      //className="w-full h-screen"
      className="w-full h-[400px]">
      {products.map((product, index) => (
        // <button onClick={() => handleProductClick(product)}>
        <SwiperSlide
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handleProductClick(product);
          }}
          key={index}
          className="relative flex flex-col items-center justify-center cursor-pointer">
          {/* Efecto oscuro sobre la imagen */}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>

          {/* Elemento picture para cargar imágenes en diferentes formatos */}
            <picture>
              <source type="image/webp" />
              <img
                src={
                  Array.isArray(product.imagen) && product.imagen.length > 0
                    ? product.imagen[0]
                    : Array.isArray(product.imagen) && product.imagen.length > 1
                    ? product.imagen[1]
                    : ''
                }
                alt={product.nombre}
                className="object-cover w-full h-full"
              />
            </picture>

          <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
            <h3 className="text-2xl font-semibold">{product.nombre}</h3>
            <p className="text-xl font">${product.valor.precio.toFixed(2)}</p>
          </div>

          {/* Botón "Agregar al carrito" */}
          <div className="absolute bottom-0 left-0 p-4 ">
            <BtnAgregarCarrito
              position="left"
              product={product}
              cantidadProducto={1}
              setCantidadProducto={() => 1}
              onClose={() => {}}
            />
          </div>
        </SwiperSlide>
        // </button>
      ))}
    </Swiper>
  );
};

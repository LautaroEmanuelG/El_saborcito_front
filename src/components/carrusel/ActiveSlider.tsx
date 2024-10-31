import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../utils/BtnAgregarCarrito';
import '../../styles/styles.css';
import type { ProductoValor } from '../../utils/types';

interface ActiveSliderProps {
  products: ProductoValor[];
  setProductoModal: (producto: ProductoValor) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({
  products,
  setProductoModal,
}) => {
  const handleProductClick = (product: ProductoValor) => {
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
      // pagination={{ clickable: true }}
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
      {products.map((product, index) => (
        // <button onClick={() => handleProductClick(product)}>
        <SwiperSlide
          key={index}
          className="relative flex flex-col items-center justify-center">
          {/* Efecto oscuro sobre la imagen */}
          <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>

          {/* Elemento picture para cargar imágenes en diferentes formatos */}
          <picture>
            <source
              // srcSet={product.imagen[0]}
              type="image/webp"
            />
            <img
            src={
              // Array.isArray(product.imagen) ? product.imagen[0] : product.imagen
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAP8AAADGCAMAAAAqo6adAAAALVBMVEXQ0NDw8PDV1dXPz8/T09Pb29vZ2dnd3d3n5+ft7e3j4+Pg4ODr6+vz8/Ps7OyJEr6/AAAEhUlEQVR4nO3d20LCMAyAYbYiA3G+/+PqxANgD0mabMmSXHrF9wuC61oOB9czbv0ANp7w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w+57w901KieVxbDUd/oU+nk7j0XIDsj+l0/kyf81wnswWIPpTmi7z8Dvz8HqwWYDmT+O9/jaTyQAkf5r+6T+fA2eLASj+dM3wP+fNYACCP/vbtxoA709jiT/Mr+YCEPwl/RJgtBYA7U/Xin+47N9f4w/zyVgArD9NVb+5P4Fo/1vdP4s8SrlB+4t//L/9L7aeAEh/OjX8g7G3QKy/8fIfBmOfgrH+6rvfMsb+ALL73537d/779/76L//z8z3XXfsbH3/tfQBG+88Nvy0+3v9SfwEYe/mz//9n7QIA3l+8+rWMsXc/0vWf98qv/yjwEEWHcP3zWObbWwOgXP8t/Q9o8PIn7fp/PoDJBRDa+s+Y4xv75Hcb4vrf4fz0FJgv1t75bkNd/07jfYH5YnUFvGP9/zDdbgAY3q6jUX3f/S/p68aPlFze/7GTCb/vCb/vCb/vCb/vCb/vCb/vCb/vCb/vUelP620m0ehPp/WWURX6l+WV1QLo899Wl9YKoM7/s7i2UgBt/r+1xXUCKPPfL62uEkCX/3FleY0AqvzPdxeuEECTP3NzpXgARf7svaXSAfT4C7fWCgdQ4y/eWSwbQIu/cmO1aAAl/up95ZIBdPgbt9ULBlDhb+4qkAugwd/eVCEXQIEfwJcLsL0fxBcLsLkfyJcKsLUfzBcKsLEfwZcJsK0fxRcJsKkfyZcIsKUfzRcIwOtPR8TjI/D5A7D604S4YkXiswfg9C9b48ABiHzuAIz+285AYAAynzkAn/9nYyQoQAefNwCb/29fKCBAdgPVJgG4/PfbYpsBOvmcAZj8j7uCGwG6+YwBePzPm6KrARj4fAFY/P/3hFcCsPDZAnD4c1viiwGY+FwBGPz5EwEKAdj4TAH6/aUTMbIBGPk8Abr95QNBMgFY+SwBus8/r5yH8i8AM58jQKe/fhzMUwB2PkOAPn/rNJyHAAL8/gBd/hb/IYAIvztA1/7vJv8ugBC/N0DP9x8A+L8BxPidAeh+GP87gCC/LwD9/Acg/yuAKL8rAPn8DzB/CSDL7wlA/f4LBH+NIQcgnn+jjE8PQDv/SB2fHIB0/pVCPjUA5fwzlXxiAML5f0r5tAD48x/V8kkBuM8/3XbwAbDnH6vmEwLg/Nr5+AAov34+OgDGb4E/DJhbUFB+G3xkALjfCh8XAOy3w0cFgPot8TEBgH5bfEQAmN8aHx4A5LfHBweA+C3yoQEAfpt8YIC23yofFqDpt8sHBWj5LfMhARp+23xAgLrfOr8doOq3z28GqPn3wG8FqPj3wW8EKPvbX/VpZWoBiv798KsBSv498WsBCv598SsB8v698csBsv798YsBcv498ksBMv7P9/1dTvapnvvheNznQP2eJvy+J/y+J/y+J/y+J/y+J/y+J/y+J/y+Z/wAooFG1ZYJEhoAAAAASUVORK5CYII='
            }
              // src={product.imagen[1]}
              alt={product.nombre}
              className="object-cover w-full h-full rounded-xl"
            />
          </picture>

          {/* Contenedor para el detalle del producto 
            mb = margen inferior 
          */}
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
              onClose={() => handleProductClick(product)}
            />
          </div>
        </SwiperSlide>
        // </button>
      ))}
    </Swiper>
  );
};

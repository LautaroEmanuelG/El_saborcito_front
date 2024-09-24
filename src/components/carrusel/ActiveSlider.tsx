import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';  // Cambia la ruta del módulo
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ActiveSlider: React.FC = () => {
  const images = [
    'img/productos/pizzas/pizzaMargherita.png',
    'img/productos/hamburguesas/hamburguesaBbq.png',
    'img/productos/pizzas/pizzaCuatroQuesos.png'
  ];

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
      className= "w-full h-[400px]"
      /* 
      Ancho (w-): w-full, w-3/4, w-1/2, w-96 (384px), o valores personalizados como w-[600px].
      Altura (h-): h-full, h-screen, h-64 (256px), h-96 (384px), o h-[400px] para alturas personalizadas.

      O con CSS directamente anachei
      style={{ width: '80%', height: '400px' }}  // Tamaño personalizado
      */
    >
      {images.map((image, index) => (
        <SwiperSlide key={index} className="flex justify-center items-center">
          <img
            src={image}
            alt={`Imagen ${index + 1}`}
            className="object-cover w-full h-full rounded-xl"
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default ActiveSlider;

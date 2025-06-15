import React, { useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BtnAgregarCarrito } from '../../HU11_12_Carrito_Confirmacion/BtnAgregarCarrito';
import { BtnAgregarPromocion } from '../../HU11_12_Carrito_Confirmacion/BtnAgregarPromocion';
import { getAllArticuloManufacturados } from '../../../shared/services/articuloManufacturadoService';
import { useProductStore } from '../../../shared/providers/ProductProvider';
import type { ArticuloManufacturado } from '../../../types/Articulo';
import type { Promocion } from '../../../types/Promocion';

interface ActiveSliderProps {
  setArticuloModal: (articulo: ArticuloManufacturado) => void;
  setPromocionModal?: (promocion: Promocion) => void;
}

export const ActiveSlider: React.FC<ActiveSliderProps> = ({
  setArticuloModal,
  setPromocionModal,
}) => {
  const [articulos, setArticulos] = React.useState<ArticuloManufacturado[]>([]);

  // 🎁 Obtener promociones del store
  const { filteredPromociones, promocionAvailability } = useProductStore();

  // 🎁 Filtrar promociones disponibles
  const promocionesDisponibles = filteredPromociones.filter(
    (promocion) => promocionAvailability[promocion.id] !== false
  );

  const handleProductClick = (articulo: ArticuloManufacturado) => {
    setArticuloModal(articulo);
  };

  // 🎁 Manejar click en promociones
  const handlePromocionClick = (promocion: Promocion) => {
    if (setPromocionModal) {
      setPromocionModal(promocion);
    }
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
        <div className="absolute bottom-4 left-0 p-4 mb-3 text-primary font-bold w-full rounded-b-xl flex flex-col items-start">
          <h3 className="text-3xl w-full justify-center flex pb-6">Los mejores sabores</h3>
        </div>{' '}
      </SwiperSlide>

      {/* 🎁 Slides de promociones - mostrar primero después del banner */}
      {promocionesDisponibles.map((promocionNormalizada) => (
        <SwiperSlide
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            handlePromocionClick(promocionNormalizada.promocionOriginal);
          }}
          key={`promo-${promocionNormalizada.id}`}
          className="relative flex flex-col items-center justify-center cursor-pointer rounded-xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-red-600/70 to-transparent rounded-xl"></div>
          <picture>
            <source type="image/png" />
            <img
              src={promocionNormalizada.promocionOriginal?.imagen?.url ?? '/img/Banner.png'}
              alt={promocionNormalizada.promocionOriginal?.denominacion ?? 'Promoción especial'}
              className="object-cover w-full h-full rounded-xl"
            />
          </picture>
          {/* Badge de promoción */}
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            PROMO
          </div>
          <div className="absolute bottom-10 left-0 p-4 mb-3 text-white w-full rounded-b-xl flex flex-col items-start">
            <h3 className="text-2xl font-semibold">
              {promocionNormalizada.promocionOriginal.denominacion}
            </h3>
            <p className="text-xl font-bold text-yellow-300">
              ${promocionNormalizada.promocionOriginal.precioPromocional.toFixed(2)}
            </p>
          </div>{' '}
          {/* Botón "Agregar al carrito" para promociones */}
          <div className="absolute bottom-0 left-0 p-4">
            <BtnAgregarPromocion
              position="left"
              promocion={promocionNormalizada.promocionOriginal}
              onClose={() => {}}
            />
          </div>
        </SwiperSlide>
      ))}

      {/* Slides de productos regulares */}
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

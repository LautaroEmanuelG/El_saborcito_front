import React from "react";
import BtnCantidadProducto from "./btnCantidadProducto";

type Dishes = {
  id: number;
  image: string;
  title: string;
  price: number;
  description: string;
};

type Props = {
  dishes: Dishes;
  isOpen: boolean;
  onClose: () => void;
};

export const ModalProducto: React.FC<Props> = ({
  dishes,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full">
        <div className="flex">
          {/* Imagen del plato */}
          <div className="w-1/2">
            <img
              src={dishes.image}
              alt={dishes.title}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>

          {/* Detalles del plato */}
          <div className="w-1/2 pl-6">
            <h2 className="text-2xl font-semibold">{dishes.title}</h2>
            <p className="text-xl text-gray-500 mt-2">${dishes.price}</p>
            <p className="mt-4 text-gray-600">{dishes.description}</p>
          </div>
        </div>

        {/* Controles de cantidad */}
        <div className="absolute bottom-20 right-4">
          <BtnCantidadProducto />
        </div>

        {/* Botones de acción */}
        <div className="absolute bottom-4 right-4 flex space-x-4">
          <button
            className="px-4 py-2 bg-[#C2BCBC] text-black rounded-md"
            onClick={onClose}
          >
            Volver
          </button>
          <button
            className="px-4 py-2 bg-[#E11D48] text-white rounded-md"
            onClick={() => {
              onClose(); // Cerrar modal después de agregar al carrito
            }}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

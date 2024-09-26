import React from 'react';
import BtnCantidadProducto from './btnCantidadProducto';
import UbicacionLogo from './Location.svg'; // Importa el archivo SVG

const VistaCarrito = () => {
  const productos = [
    {
      id: 1,
      nombre: 'Pizza Fugazzeta',
      precio: 499.99,
      cantidad: 1,
      imagen: 'img/productos/pizzas/pizzaCuatroQuesos.webp', // Reemplazar con la ruta correcta
    },
    // Agregar más productos si es necesario
  ];

  const totalProductos = productos.reduce(
    (total, prod) => total + prod.precio * prod.cantidad,
    0
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Contenido del carrito */}
      <div className="container mx-auto px-4 py-6 flex">
        {/* Productos */}
        <div className="bg-[#F2F2F2] p-4 rounded-xl shadow-lg shadow-gray-300 w-[1068px] h-[812px] mr-4 flex flex-col justify-between">
          <div>
            <h2 className="text-[36px] font-semibold mb-4">Productos</h2>
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="flex items-center justify-between border-t border-gray-300 py-4"
              >
                <div className="flex items-center">
                  <img
                    src={producto.imagen}
                    alt={producto.nombre}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="ml-4">
                    <h3 className="text-[24px] font-semibold">{producto.nombre}</h3>
                    <button className="text-[24px] text-[#E11D48] hover:underline">
                      Eliminar
                    </button>
                    <button className="ml-4 text-[24px] font-semibold text-[#E11D48] hover:underline">
                      Guardar
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  {/* BtnCantidadProducto */}
                  <BtnCantidadProducto />
                  <p className="ml-6 text-xl font-semibold">
                    ${producto.precio.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Barra de Envío: Retiro en Local */}
          <div className="flex justify-between items-center py-2 text-[#E11D48] mt-4">
            <span className="font-semibold text-black text-[24px]">Envío</span>
            <div className="flex items-center w-full ml-4">
              <span className="mr-2 text-[24px] text-[#E11D48]">Retiro en Local</span>
              <div className="border-t-4 border-[#E11D48] flex-grow mx-2"></div>
              <img src={UbicacionLogo} alt="Logo de ubicación" className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Resumen de compra */}
        <div className="bg-[#F2F2F2] p-4 rounded-xl shadow-lg shadow-gray-300 w-[325px] h-[370px] flex flex-col">
          <h3 className="text-[24px] font-semibold">Resumen Compra</h3>
          <div className="flex-grow">
            <div className="flex justify-between mt-2 text-[20px]">
              <span>Productos ({productos.length})</span>
              <span>${totalProductos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mt-2 text-[20px]">
              <span>Envío</span>
              <span className="text-[#E11D48]">Gratis</span>
            </div>
          </div>
          <div className="flex justify-between mt-auto text-3xl font-bold">
            <span>Total</span>
            <span>${totalProductos.toFixed(2)}</span>
          </div>
          <button className="mt-4 w-full py-2 bg-[#E11D48] text-[24px] font-semibold text-white rounded-lg text-center">
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default VistaCarrito;

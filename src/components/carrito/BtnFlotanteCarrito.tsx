import React from 'react';
import { Link } from 'react-router-dom';
import IconoCarrito from '../iconos/IconoCarrito';

interface BtnFlotanteProps {
  productCount: number;
}

const BtnFlotanteCarrito: React.FC<BtnFlotanteProps> = ({ productCount }) => {
  return (
    <Link
      to="/carrito"
      className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer">
      <IconoCarrito color="white" />
      <span className="text-blanco font-semibold">
        {productCount} productos
      </span>
    </Link>
  );
};

export default BtnFlotanteCarrito;

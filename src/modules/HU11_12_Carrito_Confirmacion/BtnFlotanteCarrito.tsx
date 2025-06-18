import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import IconoCarrito from '../../assets/svgs/icons/IconoCarrito';
import { useUser } from '../../shared/providers/UserProvider';
import { useNotificacion } from '../../shared/hooks/useNotificacion';
import { LoginModal } from '../HU1_2_Registro_Login/components/loggin/LoginModal';
import { RegistroModal } from '../HU1_2_Registro_Login/components/registro/RegistroModal';

interface BtnFlotanteProps {
  productCount: number;
}

const BtnFlotanteCarrito: React.FC<BtnFlotanteProps> = ({ productCount }) => {
  const { user } = useUser();
  const { mostrarNotificacion } = useNotificacion();
  const navigate = useNavigate();
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [isRegistroModalOpen, setRegistroModalOpen] = useState(false);

  const handleCarritoClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // 🔐 **VALIDAR AUTENTICACIÓN DEL USUARIO**
    if (!user) {
      mostrarNotificacion('Debes iniciar sesión para acceder al carrito', 'warning', 4000);
      setLoginModalOpen(true);
      return;
    }

    // Si el usuario está logueado, navegar al carrito
    navigate('/carrito');
  };

  return (
    <>
      <button
        onClick={handleCarritoClick}
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer hover:bg-primary-dark transition-colors"
      >
        <IconoCarrito color="white" />
        <span className="text-blanco font-semibold">{productCount} productos</span>
      </button>

      {/* Modal de login */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onOpenRegistro={() => {
          setLoginModalOpen(false);
          setRegistroModalOpen(true);
        }}
      />

      {/* Modal de registro */}
      <RegistroModal isOpen={isRegistroModalOpen} onClose={() => setRegistroModalOpen(false)} />
    </>
  );
};

export default BtnFlotanteCarrito;

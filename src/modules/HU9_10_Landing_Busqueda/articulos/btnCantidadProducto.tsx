import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../../shared/providers/CarritoProvider';
import { useLocation } from 'react-router-dom';
import type { Articulo } from '../../../types/Articulo';
import ModalSiNo from '../../../shared/components/abmGenerica/components/modals/ModalSiNo';

interface BtnCantidadProductoProps {
  articulo: Articulo;
  cantidadProducto: number;
  setCantidadProducto: React.Dispatch<React.SetStateAction<number>>;
}

const BtnCantidadProducto: React.FC<BtnCantidadProductoProps> = ({
  articulo,
  cantidadProducto,
  setCantidadProducto,
}) => {
  const carritoContext = useContext(CarritoContext);
  const [quantity, setQuantity] = useState(cantidadProducto);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadProducto must be used within a CarritoProvider');
  }
  const {
    carrito,
    addToCarrito,
    decreaseFromCart,
    removeFromCart,
    isAnalyzing,
    canIncreaseProduct,
  } = carritoContext;

  // 🔄 **SINCRONIZACIÓN CON CARRITO**
  useEffect(() => {
    const productoEnCarrito = carrito.find((item) => item.id === articulo.id);
    if (productoEnCarrito) {
      setQuantity(productoEnCarrito.cantidad);
    } else {
      setQuantity(cantidadProducto);
    }
  }, [carrito, articulo.id, cantidadProducto]);
  // ➕ **MANEJAR INCREMENTO CON ANÁLISIS PREDICTIVO Y COOLDOWN**
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    // 🚫 **VERIFICAR COOLDOWN**
    if (isOnCooldown) {
      return;
    }

    if (location.pathname === '/carrito') {
      // 🚀 **ESTRATEGIA PREDICTIVA: Validar antes de agregar**
      if (!articulo.id) {
        return;
      }

      if (isAnalyzing) {
        return;
      }

      // 🕐 **ACTIVAR COOLDOWN**
      setIsOnCooldown(true);
      setTimeout(() => setIsOnCooldown(false), 500);

      try {
        // El addToCarrito ahora maneja internamente el análisis predictivo y auto-ajuste
        await addToCarrito(articulo, 1);
      } catch (error) {
        console.error('Error al agregar al carrito:', error);
      }
    } else {
      // Vista normal (no carrito)
      setCantidadProducto(cantidadProducto + 1);
    }
  };

  // ➖ **MANEJAR DECREMENTO CON MODAL DE CONFIRMACIÓN**
  const handleDecrease = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreaseFromCart({ id: articulo.id ?? 0 });
      } else {
        setCantidadProducto(quantity - 1);
      }
    } else {
      // Si la cantidad es 1, mostrar modal de confirmación para eliminar
      if (location.pathname === '/carrito') {
        setShowDeleteModal(true);
      } else {
        setCantidadProducto(1);
      }
    }
  };

  // 🗑️ **CONFIRMAR ELIMINACIÓN DEL PRODUCTO**
  const handleConfirmDelete = () => {
    removeFromCart(articulo);
    setShowDeleteModal(false);
  };

  // ❌ **CANCELAR ELIMINACIÓN**
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    // Mantener la cantidad en 1
  };

  // 📊 **OBTENER CANTIDAD ACTUAL**
  const cantProd = () => {
    if (location.pathname === '/carrito') {
      return quantity;
    } else {
      return cantidadProducto;
    }
  };
  // 🚫 **VERIFICAR SI EL BOTÓN + DEBE ESTAR DESHABILITADO (USANDO VALIDACIÓN CENTRALIZADA)**
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      // 🎯 **USAR VALIDACIÓN CENTRALIZADA DEL CONTEXTO**
      if (isAnalyzing || isOnCooldown) return true;

      if (articulo.id) {
        return !canIncreaseProduct(articulo.id);
      }
    }
    return false;
  };

  // 💡 **OBTENER TÍTULO DEL BOTÓN + (SIMPLIFICADO)**
  const getIncreaseButtonTitle = (): string | undefined => {
    if (!isIncreaseDisabled()) return undefined;

    if (isOnCooldown) {
      return 'Esperando...';
    }

    if (isAnalyzing) {
      return 'Analizando disponibilidad...';
    }

    return 'No se puede agregar más - limitaciones de stock';
  };

  return (
    <>
      <div className="flex items-center justify-between space-x-2 sm:space-x-4 rounded-3xl border-t-gray-300 border-2 sm:w-32">
        <button
          onClick={handleDecrease}
          className="px-3 py-2 bg-gray-300 text-black rounded-full hover:bg-gray-400"
        >
          -
        </button>

        <span className="sm:text-lg font-semibold">{cantProd()}</span>

        <button
          onClick={handleIncrease}
          disabled={isIncreaseDisabled()}
          className={`px-3 py-2 rounded-full ${
            isIncreaseDisabled()
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
              : 'bg-primary text-white hover:font-bold hover:bg-primary-dark'
          }`}
          title={getIncreaseButtonTitle()}
        >
          +
        </button>
      </div>

      {/* Modal de confirmación para eliminar producto */}
      <ModalSiNo
        open={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        description={`¿Estás seguro de que deseas eliminar "${articulo.denominacion}" del carrito?`}
        confirmText="Sí, eliminar"
        cancelText="No, mantener"
      />
    </>
  );
};

export default BtnCantidadProducto;

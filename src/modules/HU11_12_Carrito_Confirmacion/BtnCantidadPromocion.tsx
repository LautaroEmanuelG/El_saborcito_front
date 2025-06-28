import React, { useContext, useEffect, useState } from 'react';
import { CarritoContext } from '../../shared/providers/CarritoProvider';
import { useLocation } from 'react-router-dom';
import type { Promocion } from '../../types/Promocion';
import ModalSiNo from '../../shared/components/abmGenerica/components/modals/ModalSiNo';

interface BtnCantidadPromocionProps {
  promocion: Promocion;
  cantidadPromocion: number;
}

const BtnCantidadPromocion: React.FC<BtnCantidadPromocionProps> = ({
  promocion,
  cantidadPromocion,
}) => {
  const carritoContext = useContext(CarritoContext);
  const [quantity, setQuantity] = useState(cantidadPromocion);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [showAutoAdjustModal, setShowAutoAdjustModal] = useState(false);
  const [adjustmentInfo, setAdjustmentInfo] = useState<{
    cantidadAnterior: number;
    cantidadNueva: number;
    motivoAjuste: string;
  } | null>(null);
  const location = useLocation();

  if (!carritoContext) {
    throw new Error('BtnCantidadPromocion must be used within a CarritoProvider');
  }

  const {
    promocionesEnCarrito,
    addPromocionToCarrito,
    decreasePromocionFromCart,
    removePromocionFromCart,
    isAnalyzing,
    canIncreasePromocion,
    limitacionesProduccion,
    promocionesProblematicas,
  } = carritoContext;

  //  **SINCRONIZACIÓN CON CARRITO**
  useEffect(() => {
    const promocionEnCarrito = promocionesEnCarrito.find(
      (item) => item.promocion.id === promocion.id
    );
    if (promocionEnCarrito) {
      setQuantity(promocionEnCarrito.cantidad);
    } else {
      setQuantity(cantidadPromocion);
    }
  }, [promocionesEnCarrito, promocion.id, cantidadPromocion]);

  // ➕ **MANEJAR INCREMENTO CON VALIDACIÓN CENTRALIZADA Y COOLDOWN**
  const handleIncrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    // 🚫 **VERIFICAR COOLDOWN**
    if (isOnCooldown) {
      return;
    }

    if (location.pathname === '/carrito') {
      if (isAnalyzing) {
        return;
      }

      // 🎯 **USAR SOLO VALIDACIÓN CENTRALIZADA DEL CONTEXTO**
      // No hacer análisis predictivo aquí, usar la validación que ya está en el contexto
      const puedeAgregar = canIncreasePromocion(promocion.id);

      if (!puedeAgregar) {
        console.log('❌ VALIDACIÓN CENTRALIZADA: NO se puede agregar más cantidad a la promoción');
        return;
      }

      console.log('✅ VALIDACIÓN CENTRALIZADA: SÍ se puede agregar más cantidad');

      // 🕐 **ACTIVAR COOLDOWN**
      setIsOnCooldown(true);
      setTimeout(() => setIsOnCooldown(false), 500);

      try {
        // 🚀 **AGREGAR AL CARRITO**
        await addPromocionToCarrito(promocion, 1);
      } catch (error) {
        console.error('Error al agregar promoción:', error);
      }
    }
  };

  // ➖ **MANEJAR DECREMENTO CON MODAL DE CONFIRMACIÓN**
  const handleDecrease = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (quantity > 1) {
      setQuantity(quantity - 1);
      if (location.pathname === '/carrito') {
        decreasePromocionFromCart(promocion.id);
      }
    } else {
      // Si la cantidad es 1, mostrar modal de confirmación para eliminar
      if (location.pathname === '/carrito') {
        setShowDeleteModal(true);
      }
    }
  };

  // 🗑️ **CONFIRMAR ELIMINACIÓN DE LA PROMOCIÓN**
  const handleConfirmDelete = () => {
    removePromocionFromCart(promocion.id);
    setShowDeleteModal(false);
  };

  // ❌ **CANCELAR ELIMINACIÓN**
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  // 🎯 **VERIFICAR SI EL BOTÓN + DEBE ESTAR DESHABILITADO (USANDO VALIDACIÓN CENTRALIZADA)**
  const isIncreaseDisabled = (): boolean => {
    if (location.pathname === '/carrito') {
      // 🎯 **USAR VALIDACIÓN CENTRALIZADA OPTIMIZADA**
      if (isAnalyzing || isOnCooldown) return true;

      // Usar la validación centralizada del contexto
      return !canIncreasePromocion(promocion.id);
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
      return 'Analizando disponibilidad de promoción...';
    }

    return 'No se puede agregar más promociones - limitaciones de stock';
  };

  // 📊 **OBTENER CANTIDAD ACTUAL**
  const cantProd = () => {
    if (location.pathname === '/carrito') {
      return quantity;
    } else {
      return cantidadPromocion;
    }
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

      {/* Modal de confirmación para eliminar promoción */}
      <ModalSiNo
        open={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="🎁 Eliminar Promoción"
        description={`¿Estás seguro de que deseas eliminar la promoción "${promocion.denominacion}" del carrito?`}
        confirmText="Sí, eliminar"
        cancelText="No, mantener"
      />
    </>
  );
};

export default BtnCantidadPromocion;

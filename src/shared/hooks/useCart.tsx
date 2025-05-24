import { useContext } from 'react';
import { CarritoContext } from '../providers/CarritoProvider';

export const useCart = () => {
  const context = useContext(CarritoContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CarritoProvider');
  }

  return context;
};

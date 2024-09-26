import { useState } from 'react';

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return {
    searchTerm,
    setSearchTerm,
  };
};
import { useState, useMemo } from 'react';
import { ButtonsTable } from '../ButtonsTable/ButtonsTable';

// Definimos la interfaz para cada columna de la tabla
interface ITableColumn<T> {
  label: string; // Etiqueta de la columna
  key: string; // Clave que corresponde a la propiedad del objeto en los datos
  render?: (item: T) => React.ReactNode; // Función opcional para personalizar la renderización del contenido de la celda
}

interface ITableFilters {
  search: string;
  categoryId: number | null;
}

export interface ITableProps<T> {
  columns: ITableColumn<T>[]; // Definición de las columnas de la tabla
  handleDelete: (id: number) => void; // Función para manejar la eliminación de un elemento
  setOpenModal: (state: boolean) => void;
  setSelectedItem: (item: T) => void;
  rows: T[];
  // Nuevas props para filtros y búsqueda
  showSearchBar?: boolean;
  showCategoryFilter?: boolean;
  categories?: Array<{ id?: number; denominacion: string }>;
  onToggleDeleted?: () => void;
  showDeleted?: boolean;
  searchPlaceholder?: string;
  // Filtro personalizado por categoría padre
  customCategoryFilter?: (row: T, categoriaPadreId: number) => boolean;
}

export const TableGeneric = <
  T extends { id: number; eliminado?: boolean; categoriaId?: number; denominacion?: string },
>({
  columns,
  handleDelete,
  setOpenModal,
  setSelectedItem,
  rows,
  showSearchBar = true,
  showCategoryFilter = true,
  categories = [],
  onToggleDeleted,
  showDeleted = false,
  searchPlaceholder = 'Buscar...',
  customCategoryFilter,
}: ITableProps<T>) => {
  const [filters, setFilters] = useState<ITableFilters>({
    search: '',
    categoryId: null,
  });

  // Funciones para manejar filtros
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, search: event.target.value }));
  };

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      categoryId: value === '' ? null : parseInt(value, 10),
    }));
  };

  // Filtrar datos en tiempo real
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Filtro por texto de búsqueda
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = (row.denominacion || '').toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Filtro por categoría (soporta filtro personalizado por categoría padre)
      if (filters.categoryId !== null) {
        if (customCategoryFilter) {
          if (!customCategoryFilter(row, filters.categoryId)) {
            return false;
          }
        } else if (row.categoriaId !== filters.categoryId) {
          return false;
        }
      }

      // Filtro por eliminados: usar showDeleted prop directamente
      if (!showDeleted && row.eliminado) {
        return false;
      }

      return true;
    });
  }, [rows, filters, showDeleted, customCategoryFilter]);

  return (
    <div className="w-full flex flex-col justify-center items-center space-y-2">
      {/* Barra de filtros */}
      <div className="w-full bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Buscador */}
          {showSearchBar && (
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder={searchPlaceholder}
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>
          )}

          {/* Selector de categoría */}
          {showCategoryFilter && categories.length > 0 && (
            <div className="flex-1 md:flex-none md:w-48">
              <select
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                value={filters.categoryId || ''}
                onChange={handleCategoryChange}
              >
                <option value="">Todas las categorías</option>
                {categories.map((category) => (
                  <option key={category.id || 0} value={category.id || ''}>
                    {category.denominacion}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toggle para elementos eliminados */}
          {onToggleDeleted && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  showDeleted ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                onClick={onToggleDeleted}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    showDeleted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {showDeleted ? 'Mostrar eliminados' : 'Ocultar eliminados'}
              </span>
            </div>
          )}
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-500">
          Mostrando {filteredRows.length} de {rows.length} elementos
        </div>
      </div>

      {/* Tabla */}
      <div className="w-full bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0">
              <tr>
                {columns.map((column, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b-2 border-gray-200"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className="h-12 w-12 text-gray-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2"
                        />
                      </svg>
                      <span className="text-lg font-medium">No se encontraron elementos</span>
                      <span className="text-sm">Intenta ajustar los filtros de búsqueda</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, index) => (
                  <tr
                    key={row.id ?? index}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      row.eliminado ? 'bg-red-50 opacity-75' : ''
                    }`}
                  >
                    {columns.map((column, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-center">
                        {
                          column.render ? ( // Si existe la función "render" se ejecuta
                            column.render(row)
                          ) : column.label === 'Acciones' ? ( // Si el label de la columna es "Acciones" se renderizan los botones de acción
                            <ButtonsTable
                              el={row}
                              handleDelete={handleDelete}
                              setOpenModal={setOpenModal}
                              setSelectedItem={setSelectedItem}
                            />
                          ) : (
                            (row[column.key as keyof T] as React.ReactNode)
                          ) // Si no hay una función personalizada, se renderiza el contenido de la celda tal cual
                        }
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { ButtonsTable } from '../ButtonsTable/ButtonsTable';

// Definimos la interfaz para cada columna de la tabla
interface ITableColumn<T> {
  label: string; // Etiqueta de la columna
  key: string; // Clave que corresponde a la propiedad del objeto en los datos
  render?: (item: T) => React.ReactNode; // Función opcional para personalizar la renderización del contenido de la celda
}

export interface ITableProps<T> {
  columns: ITableColumn<T>[]; // Definición de las columnas de la tabla
  handleDelete: (id: number) => void; // Función para manejar la eliminación de un elemento
  setOpenModal: (state: boolean) => void;
  setSelectedItem: (item: T) => void;
  rows: T[];
}

export const TableGeneric = <T extends { id: number }>({
  columns,
  handleDelete,
  setOpenModal,
  setSelectedItem,
  rows,
}: ITableProps<T>) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Función para cambiar de página
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Función para cambiar el número de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-11/12 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, i) => (
                <th
                  key={i}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <tr key={row.id ?? index}>
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
            ))}
          </tbody>
        </table>
        {/* Paginación simple */}
        <div className="flex justify-between items-center py-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Anterior
          </button>
          <span>Página {page + 1}</span>
          <button
            className="px-2 py-1 bg-gray-200 rounded disabled:opacity-50"
            onClick={() =>
              setPage((p) => (p + 1 < Math.ceil(rows.length / rowsPerPage) ? p + 1 : p))
            }
            disabled={page + 1 >= Math.ceil(rows.length / rowsPerPage)}
          >
            Siguiente
          </button>
          <select
            className="ml-2 border rounded px-2 py-1"
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
          >
            {[10, 25, 100].map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

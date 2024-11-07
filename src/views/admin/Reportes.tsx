import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { getAllCategorias } from '../../utils/services/axios/categoriaService';
import { getAllProductos } from '../../utils/services/axios/productoService';
import { getAllTickets } from '../../utils/services/axios/ticketService';
import {
  Ticket,
  type CategoriaVentas,
  type ProductoValor,
} from '../../utils/types';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const Reportes = () => {
  const [categorias, setCategorias] = useState<CategoriaVentas[]>([]);
  const [productos, setProductos] = useState<ProductoValor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    const categoriasData = await getAllCategorias();
    const productosData = await getAllProductos();
    const ticketsData = await getAllTickets();

    setCategorias(categoriasData);
    setProductos(productosData);
    setTickets(ticketsData);
  };

  const data = categorias.map(categoria => {
    const productCount = productos.filter(
      producto => producto.categoria.id === categoria.id
    ).length;
    return { name: categoria.nombre, value: productCount };
  });

  const barData = productos.map(producto => ({
    name: producto.nombre,
    costo: producto.valor.costo,
    ganancia: producto.valor.precio - producto.valor.costo,
  }));

  const totalGastos = productos.reduce(
    (acc, producto) => acc + producto.valor.costo * producto.stock,
    0
  );

  const totalGanancias = tickets.reduce((acc, ticket) => {
    if (ticket.total > 0) {
      const ticketTotal = ticket.ticketProductos.reduce(
        (acc, tp) => acc + tp.cantidad * tp.producto.valor.precio,
        0
      );
      return acc + ticketTotal;
    }
    return acc;
  }, 0);

  const categoriaMasVendida = categorias.reduce(
    (max, categoria) => {
      const ventas = tickets.reduce((acc, ticket) => {
        const ticketProductos = ticket.ticketProductos.filter(
          tp => tp.producto.categoria.id === categoria.id
        );
        const ventasCategoria = ticketProductos.reduce(
          (acc, tp) => acc + tp.cantidad,
          0
        );
        return acc + ventasCategoria;
      }, 0);
      return ventas > max.ventas ? { nombre: categoria.nombre, ventas } : max;
    },
    { nombre: '', ventas: 0 }
  );

  const totalProductos = productos.length;
  const totalCategorias = categorias.length;
  const totalTickets = tickets.length;

  return (
    <div className="bg-gray-100 w-full min-h-full p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-2 bg-white rounded-lg shadow-md">
          <ResponsiveContainer
            width="100%"
            height={300}>
            <PieChart>
              <Pie
                dataKey="value"
                data={data}
                fill="#8884d8"
                label>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-lg shadow-md p-2">
          <ResponsiveContainer
            width="100%"
            height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="costo"
                fill="#FF8042"
              />
              <Bar
                dataKey="ganancia"
                fill="#0088FE"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="p-2 flex flex-col gap-7">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Ingresos Totales</h2>
            <p className="text-4xl">{totalGanancias}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Patrimonio Total</h2>
            <p className="text-4xl">{totalGastos}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Categoría Más Vendida</h2>
          <p className="text-4xl">{categoriaMasVendida.nombre}</p>
          <p className="text-xl">Ventas: {categoriaMasVendida.ventas}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Total Productos</h2>
          <p className="text-4xl">{totalProductos}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Total Categorías</h2>
          <p className="text-4xl">{totalCategorias}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Total Tickets</h2>
          <p className="text-4xl">{totalTickets}</p>
        </div>
      </div>
    </div>
  );
};

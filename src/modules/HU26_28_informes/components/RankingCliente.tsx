// src/modules/HU26_28_informes/informes/components/RankingCliente.tsx

import { useEffect, useState } from 'react';
import { ClienteRanking } from '../model';
import {
  getRankingClientes,
  exportarRankingClientesExcel,
  getDetallePedidosCliente,
} from '../service/informesService';
import './RankingCliente.css';
import { format } from 'date-fns';
import { FaEye } from 'react-icons/fa';
import { DetallePedidoDTO } from '../model';

export const RankingCliente = () => {
  const [clientes, setClientes] = useState<ClienteRanking[]>([]);
  const [desde, setDesde] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [hasta, setHasta] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [ordenarPor, setOrdenarPor] = useState<'cantidad' | 'importe'>('cantidad');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteRanking | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detallePedidos, setDetallePedidos] = useState<DetallePedidoDTO[]>([]);

  useEffect(() => {
    fetchClientes();
  }, [desde, hasta, ordenarPor]);

  const fetchClientes = async () => {
    try {
      const data = await getRankingClientes(desde, hasta, ordenarPor);
      setClientes(data);
    } catch (error) {
      console.error('Error al obtener ranking de clientes', error);
    }
  };

  const handleExportar = async () => {
    try {
      await exportarRankingClientesExcel(desde, hasta, ordenarPor);
    } catch (err) {
      alert('Error al exportar Excel');
      console.error(err);
    }
  };

  return (
    <div className="ranking-container">
      <div className="ranking-header">
        <h2 className="ranking-title">Ranking de clientes</h2>
        <div className="ranking-fecha">
          <label>
            Desde: <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          </label>
          <label>
            Hasta: <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          </label>
        </div>
      </div>

      <table className="ranking-table">
        <thead>
          <tr>
            <th>Nombre Cliente</th>
            <th className="resaltado">Cant Pedidos</th>
            <th>Total Gastado</th>
            <th
              className="ordenar"
              onClick={() => setOrdenarPor(ordenarPor === 'cantidad' ? 'importe' : 'cantidad')}
            >
              Ordenar Por: {ordenarPor === 'cantidad' ? 'Pedidos' : 'Importe'}
            </th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c) => (
            <tr key={c.id}>
              <td>{c.nombreCompleto}</td>
              <td className="resaltado">{c.cantidadPedidos}</td>
              <td>${c.totalImporte.toLocaleString()}</td>
              <td>
                <FaEye
                  className="icono-ver"
                  onClick={async () => {
                    try {
                      const detalles = await getDetallePedidosCliente(c.id, desde, hasta);
                      setDetallePedidos(detalles);
                      setClienteSeleccionado(c);
                      setModalVisible(true);
                    } catch (error) {
                      console.error('Error al obtener detalle de pedidos', error);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="botones-ranking">
        <button className="boton-ver-mas">Ver Más</button>
        <button className="boton-exportar" onClick={handleExportar}>
          Exportar Excel
        </button>
      </div>

      {modalVisible && clienteSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-detalle">
            <div className="modal-header">
              <h2>{clienteSeleccionado.nombreCompleto}</h2>
              <span className="cerrar" onClick={() => setModalVisible(false)}>
                &times;
              </span>
            </div>
            <table className="modal-tabla">
              <thead>
                <tr>
                  <th className="resaltado">Producto</th>
                  <th>Precio Venta</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {detallePedidos.map((detalle) => (
                  <tr key={detalle.id}>
                    <td>{detalle.articulo.denominacion}</td>
                    <td>${detalle.articulo.precioVenta?.toLocaleString() ?? '-'}</td>
                    <td>{detalle.cantidad}</td>
                    <td>
                      $
                      {detalle.articulo.precioVenta
                        ? (detalle.articulo.precioVenta * detalle.cantidad).toLocaleString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="boton-cerrar" onClick={() => setModalVisible(false)}>
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

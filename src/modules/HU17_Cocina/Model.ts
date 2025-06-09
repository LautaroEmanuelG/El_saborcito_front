// Modelos y utilidades para el módulo de cocina

export type EstadoNombre = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'DEMORADO';

export interface Estado {
  nombre: EstadoNombre;
}

export interface DetallePedido {
  cantidad: number;
  articulo: {
    denominacion: string;
  };
}

export interface Pedido {
  id: number;
  estado: Estado;
  horasEstimadaFinalizacion: string;
  detalles: DetallePedido[];
}

// Constantes de estados y colores para el Kanban
export const ESTADOS: { id: EstadoNombre; title: string; color: string }[] = [
  { id: 'PENDIENTE', title: 'Pendiente', color: '#334FFF' },
  { id: 'EN_PREPARACION', title: 'En Proceso', color: '#EB9417' },
  { id: 'DEMORADO', title: 'Demorado', color: '#EB1741' },
  { id: 'LISTO', title: 'Listo', color: '#60AF29' },
];

// Hardcode temporal para pruebas de UI
// export async function fetchPedidos(): Promise<Pedido[]> {
//   // Simula un retardo de red
//   await new Promise(res => setTimeout(res, 300));
//   return [
//     {
//       id: 1,
//       estado: { nombre: 'PENDIENTE' },
//       horasEstimadaFinalizacion: '14:30',
//       detalles: [
//         { cantidad: 2, articulo: { denominacion: 'Pizza Muzzarella' } },
//         { cantidad: 1, articulo: { denominacion: 'Empanada de Carne' } }
//       ]
//     },
//     {
//       id: 2,
//       estado: { nombre: 'EN_PROCESO' },
//       horasEstimadaFinalizacion: '14:45',
//       detalles: [
//         { cantidad: 1, articulo: { denominacion: 'Hamburguesa Completa' } }
//       ]
//     },
//     {
//       id: 3,
//       estado: { nombre: 'DEMORADO' },
//       horasEstimadaFinalizacion: '15:00',
//       detalles: [
//         { cantidad: 3, articulo: { denominacion: 'Milanesa Napolitana' } }
//       ]
//     },
//     {
//       id: 4,
//       estado: { nombre: 'LISTO' },
//       horasEstimadaFinalizacion: '13:50',
//       detalles: [
//         { cantidad: 1, articulo: { denominacion: 'Pizza Fugazzeta' } }
//       ]
//     },
//     {
//         id: 5,
//         estado: { nombre: 'PENDIENTE' },
//         horasEstimadaFinalizacion: '14:50',
//         detalles: [
//           { cantidad: 1, articulo: { denominacion: 'Pizza Fugazzeta' } }
//         ]
//       },
//       {
//         id: 6,
//         estado: { nombre: 'PENDIENTE' },
//         horasEstimadaFinalizacion: '15:05',
//         detalles: [
//           { cantidad: 1, articulo: { denominacion: 'Pizza Fugazzeta' } }
//         ]
//       },
//       {
//         id: 7,
//         estado: { nombre: 'DEMORADO' },
//         horasEstimadaFinalizacion: '16:00',
//         detalles: [
//           { cantidad: 1, articulo: { denominacion: 'Pizza Fugazzeta' } }
//         ]
//       }
//   ];
// }

// Función real para obtener pedidos desde la API
export async function fetchPedidos(): Promise<Pedido[]> {
  const res = await fetch('http://localhost:5252/api/cocina/pedidos');
  if (!res.ok) throw new Error('Error al obtener pedidos');
  return res.json();
}

// 🌐 Configuración de rutas públicas y protegidas
export const PUBLIC_ROUTES = ['/', '/carrito', '/callback', '/pedido-exitoso'] as const;

export const isPublicRoute = (path: string): boolean => {
  return PUBLIC_ROUTES.includes(path as any);
};

export const isProtectedRoute = (path: string): boolean => {
  return !isPublicRoute(path);
};

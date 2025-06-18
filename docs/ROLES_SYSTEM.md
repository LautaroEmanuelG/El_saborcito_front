# 🔐 Sistema de Manejo de Roles - El Saborcito

## 📋 Descripción General

Este sistema implementa un manejo robusto de roles y permisos para la aplicación El Saborcito, permitiendo diferentes niveles de acceso según el rol del usuario autenticado.

## 🎭 Roles Disponibles

### 👨‍💼 ADMIN

- **Acceso completo** a todas las funcionalidades
- Gestión de empleados y clientes
- Informes estadísticos
- Configuración del sistema

### 👨‍🍳 COCINERO

- Gestión de contenido (artículos, insumos, promociones)
- Administración de cocina e historial
- Control de stock de insumos

### 💰 CAJERO

- Recepción de pedidos
- Gestión de ventas

### 🚚 DELIVERY

- Gestión de entregas
- Estado de pedidos en delivery

### 👤 CLIENTE

- Navegación pública
- Carrito de compras
- Perfil personal

## 🏗️ Arquitectura del Sistema

### 📁 Estructura de Archivos

```
src/
├── types/
│   └── Rol.ts                    # Definición de enums y tipos
├── shared/
│   ├── hooks/
│   │   └── useAuth.ts           # Hook personalizado para autenticación
│   ├── services/
│   │   └── authService.ts       # Servicios de autenticación
│   ├── components/
│   │   ├── UnauthorizedAccess.tsx
│   │   └── LoadingSpinner.tsx
│   └── config/
│       └── navigationConfig.ts  # Configuración de navegación por rol
├── app/
│   └── routes/
│       └── ProtectedRoute.tsx   # Componente de rutas protegidas
└── main.tsx                     # Configuración de rutas principales
```

### 🔄 Flujo de Autenticación

1. **Login**: Usuario se autentica y recibe JWT token
2. **Verificación de Rol**: Se consulta `/auth/rol` para obtener el rol
3. **Configuración de Navegación**: Se carga el menú según el rol
4. **Protección de Rutas**: Cada ruta valida permisos antes de mostrar contenido

## 🛠️ Componentes Principales

### `useAuth` Hook

```typescript
const { rol, isLoading, isAuthenticated, hasRole, logout, refreshRole } = useAuth();
```

**Funcionalidades:**

- ✅ Gestión de estado de autenticación
- ✅ Verificación de roles
- ✅ Refresh automático de permisos
- ✅ Logout seguro

### `ProtectedRoute` Component

```typescript
<ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.COCINERO]}>
  <ComponenteProtegido />
</ProtectedRoute>
```

**Funcionalidades:**

- ✅ Validación de roles antes de renderizar
- ✅ Redirección automática si no autorizado
- ✅ Pantalla de loading durante verificación
- ✅ Mensaje de error personalizado

### `AsideAdmin` Component

- ✅ Navegación dinámica según rol
- ✅ Indicador visual del rol actual
- ✅ Loading state durante verificación
- ✅ Responsive design

## 🔒 Seguridad Implementada

### 🛡️ Protección de Rutas

- **Frontend**: Validación inmediata de permisos
- **Backend**: Verificación del JWT en cada endpoint
- **Interceptors**: Manejo automático de tokens expirados

### 🔄 Manejo de Tokens

- **Almacenamiento**: localStorage con claves consistentes
- **Expiración**: Redirect automático al home si token inválido
- **Limpieza**: Clear automático en logout o error 401

### 🚫 Control de Acceso

- **Rutas**: Cada ruta especifica roles permitidos
- **Navegación**: Menús dinámicos según permisos
- **Feedback**: Mensajes claros de acceso denegado

## 🎨 UX/UI Mejoradas

### 🎯 Estados de Loading

- **Spinner centralizado** durante verificación
- **Skeleton screens** en navegación
- **Mensajes informativos** contextuales

### 📱 Responsive Design

- **Mobile-first** approach
- **Menú hamburguesa** para dispositivos móviles
- **Overlay** para mejor UX mobile

### 🎨 Feedback Visual

- **Indicador de rol** en el aside
- **Estados de error** bien diseñados
- **Transiciones suaves** entre estados

## 🔧 Configuración por Rol

### 📊 Matriz de Permisos

| Funcionalidad | ADMIN | COCINERO | CAJERO | DELIVERY |
| ------------- | ----- | -------- | ------ | -------- |
| Recepción     | ✅    | ❌       | ✅     | ❌       |
| Delivery      | ✅    | ❌       | ❌     | ✅       |
| Cocina        | ✅    | ✅       | ❌     | ❌       |
| Artículos     | ✅    | ✅       | ❌     | ❌       |
| Insumos       | ✅    | ✅       | ❌     | ❌       |
| Promociones   | ✅    | ✅       | ❌     | ❌       |
| Informes      | ✅    | ❌       | ❌     | ❌       |
| Personal      | ✅    | ❌       | ❌     | ❌       |

## 🚀 Uso del Sistema

### 🔐 Autenticación

```typescript
// Login automático con verificación de rol
const { rol, isAuthenticated } = useAuth();

// Verificar permisos específicos
if (hasRole([Rol.ADMIN, Rol.COCINERO])) {
  // Mostrar contenido autorizado
}
```

### 🛡️ Protección de Rutas

```typescript
// En main.tsx
<Route
  path="/admin/cocina"
  element={
    <ProtectedRoute allowedRoles={[Rol.ADMIN, Rol.COCINERO]}>
      <Cocina />
    </ProtectedRoute>
  }
/>
```

### 🧭 Navegación Dinámica

```typescript
// Configuración automática según rol
const navigation = getNavigationByRole(rol);
```

## 🐛 Manejo de Errores

### 📡 Estados de Red

- **401**: Token expirado → Logout automático
- **403**: Sin permisos → Pantalla de error
- **500**: Error servidor → Retry automático

### 🔄 Recuperación

- **Refresh token** automático
- **Retry logic** en requests fallidos
- **Fallback** a estados seguros

## 📈 Mejoras Futuras

### 🔮 Funcionalidades Planeadas

- [ ] Refresh tokens automático
- [ ] Permisos granulares por endpoint
- [ ] Audit log de accesos
- [ ] Roles temporales
- [ ] Multi-tenancy support

### 🎨 Mejoras UX

- [ ] Transiciones más suaves
- [ ] Notificaciones push
- [ ] Modo offline básico
- [ ] Temas personalizables

---

## 📞 Soporte

Para dudas o problemas con el sistema de roles, contactar al equipo de desarrollo.

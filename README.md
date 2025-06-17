# 🍔 El Saborcito - Frontend

<div align="center">
  <img src="./public/img/El-Saborcito-Logo.png" alt="El Saborcito Logo" width="200"/>
  
  ![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
  ![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.10-teal.svg)
  ![License](https://img.shields.io/badge/License-MIT-green.svg)
  
  **Sistema web moderno para gestión de restaurante con e-commerce integrado**
</div>

<p align="center">
  <img src="./docs/captura_landing.png" alt="Captura de pantalla de la landing de El Saborcito" width="80%"/>
</p>

---

## 📋 Descripción del Proyecto

**El Saborcito** es una aplicación web completa para la gestión integral de un restaurante que incluye un sistema de e-commerce para clientes y un panel administrativo avanzado. Permite a los clientes realizar pedidos online con múltiples métodos de pago (Mercado Pago, criptomonedas) y ofrece a los administradores herramientas completas para gestionar inventarios, cocina, delivery y finanzas.

### 🎯 Objetivos Principales

- **💳 E-commerce Integrado**: Carrito de compras, métodos de pago múltiples y confirmación de pedidos
- **👥 Gestión de Usuarios**: Sistema de autenticación con Auth0 para clientes y empleados
- **📊 Panel Administrativo**: Dashboard completo para gestión de inventarios, cocina.
- **🚚 Sistema de Delivery**: Gestión de entregas con tracking en tiempo real
- **📈 Analytics**: Reportes y estadísticas de ventas, productos más vendidos y finanzas

---

## 🏗️ Arquitectura del Proyecto

### 📁 Estructura de Carpetas

```
src/
├── app/                    # Configuración principal de la aplicación
│   ├── layout/             # Layouts para diferentes tipos de usuario
│   ├── routes/             # Rutas protegidas y configuración de navegación
│   └── styles/             # Estilos globales CSS
├── modules/                # Módulos organizados por Historia de Usuario (HU)
│   ├── HU1_2_Registro_Login/             # Autenticación de usuarios
│   ├── HU3_Perfil_Cliente/               # Perfil del cliente
│   ├── HU4_Registro_Empleado/            # Registro de empleados
│   ├── HU5_Login_Empleado/               # Login de empleados
│   ├── HU6_Perfil_Empleado/              # Perfil de empleados
│   ├── HU7_8_Modulo_Admin/               # Módulo de administración
│   ├── HU9_10_Landing_Busqueda/          # Página principal y búsqueda
│   ├── HU11_12_Carrito_Confirmacion/     # Carrito y proceso de compra
│   ├── HU13_MisPedidos/                  # Historial de pedidos
│   ├── HU14_Recepcion/                   # Recepción de pedidos
│   ├── HU16_Delivery/                    # Módulo de delivery
│   ├── HU17_Cocina/                      # Gestión de cocina (Kanban)
│   ├── HU18_Generacion_De_Factura/       # Generación de factura
│   ├── HU20_CRUD_CategoriasPadresInsumos/      # CRUD Categorías Padres Insumos
│   ├── HU20_CRUD_SubcategoriasInsumos/         # CRUD Subcategorías Insumos
│   ├── HU21_CRUD_CategoriasArticulos/          # CRUD Categorías Artículos
│   ├── HU21_CRUD_CategoriasPadresArticulos/    # CRUD Categorías Padres Artículos
│   ├── HU22_CRUDArticulos/               # CRUD Artículos
│   ├── HU23_CRUDInsumos/                 # CRUD Insumos
│   ├── HU24_CompraIngredientes/          # Compra de ingredientes
│   ├── HU25_ControlStockInsumos/         # Control de stock de insumos
│   ├── HU25_Promociones/                 # Promociones
│   └── HU26_28_informes/                 # Informes y reportes
├── shared/                # Componentes y servicios reutilizables
│   ├── components/        # Componentes UI genéricos
│   ├── hooks/             # Hooks personalizados
│   ├── providers/         # Context providers (Auth, Carrito, etc.)
│   └── services/          # Servicios de API
└── types/                 # Definiciones de tipos TypeScript
```

### 🧩 Patrones de Diseño

- **Modular por Historia de Usuario**: Cada funcionalidad está encapsulada en su propio módulo
- **Composition Pattern**: Componentes reutilizables y componibles
- **Custom Hooks**: Lógica de negocio separada de la presentación
- **Context API + Zustand**: Gestión de estado global eficiente
- **Service Layer**: Abstracción de llamadas a API

---

## 🛠️ Stack Tecnológico

### Frontend Framework

- **React 18.3.1** - Biblioteca principal para UI
- **TypeScript 5.5.3** - Tipado estático
- **Vite 5.4.1** - Build tool y dev server ultra rápido

### Styling & UI

- **TailwindCSS 3.4.10** - Framework CSS utility-first
- **Swiper 11.1.14** - Carruseles y sliders modernos
- **React DnD Kit** - Drag and drop para Kanban de cocina

### State Management

- **Zustand 5.0.5** - Estado global ligero y eficiente
- **React Context** - Estado local compartido

### Authentication & Security

- **Auth0 2.3.0** - Autenticación y autorización
- **JWT** - Tokens seguros para APIs

### Payment Integration

- **Mercado Pago SDK React** - Pagos con tarjeta y efectivo
- **OnchainKit (Coinbase)** - Pagos con criptomonedas

### Maps & Location

- **Leaflet 1.9.4** - Mapas interactivos
- **React Leaflet 4.2.1** - Integración con React

### Charts & Analytics

- **Chart.js 4.4.9** - Gráficos interactivos
- **React Chart.js 2** - Integración con React
- **Recharts 2.13.2** - Gráficos modernos adicionales

### Navigation

- **React Router Dom 6.26.2** - Routing SPA

### Development Tools

- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Husky** - Git hooks
- **Lint-staged** - Linting en pre-commit

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** 18.0.0 o superior
- **npm** o **yarn**
- **Git**

### 1️⃣ Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/el-saborcito-front.git
cd el-saborcito-front
```

### 2️⃣ Instalar Dependencias

```bash
npm install
```

### 3️⃣ Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Backend API
VITE_BACKEND_URL=http://localhost:8080/api

# Auth0 Configuration
VITE_AUTH0_DOMAIN=tu-dominio.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_AUTH0_AUDIENCE=https://saborcito/api
VITE_AUTH0_CALLBACK_URL=http://localhost:5173/callback

# Mercado Pago
VITE_MP_PUBLIC_KEY=tu-mp-public-key

# Coinbase/OnchainKit
VITE_PUBLIC_ONCHAINKIT_API_KEY=tu-onchainkit-api-key
PAYMASTER_AND_BUNDLER_ENDPOINT=https://api.developer.coinbase.com/rpc/v1/base-sepolia/tu-endpoint
PRODUCT_ID=tu-product-id
```

### 4️⃣ Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🌟 Funcionalidades por Rol

### 👤 Cliente

- Registro y login tradicional o con Google, validaciones avanzadas y recuperación de contraseña.
- Navegación de productos, categorías, buscador avanzado, promociones y detalles sin necesidad de login.
- Carrito de compras con agregado/modificación de productos y promociones, gestión de cantidades, feedback visual, control de stock y cálculo automático de totales y descuentos.
- Checkout guiado, selección de retiro en local o entrega a domicilio (con mapa), integración con Mercado Pago y criptomonedas, resumen y confirmación de pedido, cálculo de tiempo estimado de entrega.
- Historial de pedidos, visualización de detalles, descarga de facturas en PDF y seguimiento de estados en tiempo real.
- Gestión de perfil: edición de datos personales, direcciones (con mapa), cambio de contraseña y selección de dirección principal.

### 💵 Cajero

- Visualización y confirmación de pedidos pendientes, acceso a detalles completos, avance de estados (confirmado, en preparación, listo, en delivery, facturado), historial de cambios y filtros avanzados.
- Registro de pagos en efectivo, validación automática de pagos online, generación y reenvío de facturas, control de formas de pago y prevención de entrega de pedidos no pagados.

### 🍳 Cocinero

- Visualización de pedidos en preparación, acceso a detalles y observaciones, consulta de recetas e ingredientes, marcado de pedidos como listos y gestión de tiempos adicionales en caso de demoras.
- ABM de productos manufacturados, edición de composición por ingredientes, cálculo automático de costos y visualización de recetas.
- ABM de insumos, control de stock mínimo, alertas visuales, registro de compras y filtros por stock bajo o crítico.
- ABM de categorías de ingredientes y productos, asociación de productos e insumos a rubros.

### 🚚 Delivery

- Visualización de pedidos en delivery, acceso rápido a datos de contacto y ubicación, marcado de pedidos como entregados y actualización en tiempo real del estado.

### 🛡️ Administrador

- ABM de clientes y empleados, asignación y modificación de roles, búsqueda y filtrado avanzado, indicadores visuales de estado y acceso rápido a perfiles.
- Reportes y estadísticas: rankings de productos y clientes, reportes de ingresos, costos y ganancias, filtros por fecha y exportación a Excel.
- Control de stock: listado de insumos con stock bajo, alertas visuales, registro y visualización de compras de insumos.
- ABM de promociones, asociación de productos, definición de condiciones y descuentos, aplicación automática en el carrito y visualización de descuentos.
- Facturación automática al finalizar pedidos, descarga y envío por correo electrónico.

---

## ⚙️ Consideraciones Técnicas y de Seguridad

- Encriptación de contraseñas y manejo seguro de datos sensibles.
- Bajas lógicas para usuarios y productos, preservando la integridad de la información.
- Integración robusta con Mercado Pago y Coinbase para pagos online y en cripto.
- Restricción de pedidos fuera de horario y validación de horarios de atención.
- Control de acceso y permisos estrictos según el rol del usuario.
- Feedback visual y mensajes claros en todas las acciones críticas.

---

## 🚀 Deployment

### Despliegue en Vercel

1. **Conectar Repositorio**:
   - Importa el proyecto desde GitHub en Vercel
2. **Configurar Variables de Entorno**:
   - Agrega todas las variables del archivo `.env`
   - Actualiza `VITE_BACKEND_URL` con la URL de producción
3. **Deploy Automático**:
   - Cada push a `main` despliega automáticamente

### Variables de Entorno para Producción

```env
VITE_BACKEND_URL=https://tu-backend.onrender.com/api
VITE_AUTH0_CALLBACK_URL=https://tu-app.vercel.app/callback
# ... resto de variables
```

📖 **Guía Completa**: [docs/DEPLOY_VERCEL.md](./docs/DEPLOY_VERCEL.md)

---

## 🧪 Testing

```bash
# Ejecutar tests unitarios
npm run test
# Tests con coverage
npm run test:coverage
# Tests de integración
npm run test:integration
```

---

## 📖 Documentación Técnica

| Documento                                                 | Descripción                      |
| --------------------------------------------------------- | -------------------------------- |
| [🤝 Guía de Contribución](./docs/CONTRIBUTING.md)         | Cómo contribuir al proyecto      |
| [🏗️ Arquitectura](./docs/HowWork.md)                      | Organización y flujo de trabajo  |
| [🚀 Deploy en Vercel](./docs/DEPLOY_VERCEL.md)            | Guía de despliegue               |
| [📂 Gestión de Categorías](./docs/CATEGORY_MANAGEMENT.md) | Sistema jerárquico de categorías |
| [🔍 Búsqueda](./docs/SEARCH_FUNCTIONALITY.md)             | Arquitectura de búsqueda         |
| [🗑️ Soft Delete](./docs/SOFT_DELETE_IMPLEMENTATION.md)    | Implementación de borrado lógico |

---

### Convención de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bugs
- `docs:` Documentación
- `style:` Formateo, punto y coma faltante, etc.
- `refactor:` Refactoring de código
- `test:` Tests
- `chore:` Tareas de mantenimiento

---

## 👥 Equipo de Desarrollo

- **González**  
  Líder técnico y referente del equipo. Fue el motor que nos mantuvo enfocados, ordenados y con un estilo uniforme en todo el sistema. Su experiencia y visión permitieron que el proyecto avanzara siempre en la dirección correcta, resolviendo bloqueos y asegurando la calidad en cada entrega.

- **Mariotti**  
  Pilar fundamental en la organización y el avance del equipo. Se encargó de la parte de los reportes y estadísticas, y fue clave para mantenernos al día y coordinados, siempre dispuesto a ayudar y a compartir conocimiento. Su aporte en backend, frontend y base de datos fue esencial para el éxito del proyecto.

- **Araya**  
  Responsable de los ABM (CRUD) y de la lógica de manufacturados. Desarrolló la lógica de negocio relacionada a productos, insumos, operaciones administrativas y el control de stock e inventario, asegurando el correcto descuento y actualización de insumos y productos en cada operación, mostrando gran dedicación y detalle en cada módulo.

- **Contreras**  
  Encargada de la seguridad del sistema, el diseño y armado de la base de datos y las relaciones entre entidades. Desarrolló toda la gestión de usuarios, clientes y empleados (registro, login, perfiles y administración), sentando las bases sólidas sobre las que se construyó el resto del sistema.

- **Osorio**  
  Encargado de la estructuración del frontend, desarrollo de la cocina (Kanban), parte de reportes, generación de facturas e integración de Mercado Pago. Colaboró activamente en la arquitectura general del sistema, aportando ideas y soluciones en todos los frentes.

> **Todos los integrantes participaron activamente en backend, frontend y base de datos, demostrando un compromiso y una colaboración excepcionales.**

---

### 💬 Mensaje del equipo (por Osorio)

> “Quiero agradecer de corazón a cada uno de ustedes por el esfuerzo, la dedicación y la pasión que pusieron en este proyecto. No solo logramos construir un sistema robusto y profesional, sino que también formamos un equipo unido, donde cada aporte fue fundamental. Me siento muy orgulloso de lo que logramos juntos y de haber compartido este camino con personas tan talentosas y comprometidas. ¡Gracias por dejar su huella!”

---

## 📧 Contacto y Soporte

- **Email**: elsaborcito2024@gmail.com
- **Documentación**: [Docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/el-saborcito-front/issues)

## 📚 Recursos y enlaces útiles

- **Repositorio Backend:** [El_saborcito_back](https://github.com/LautaroEmanuelG/El_saborcito_back)
- **Repositorio Frontend:** [El_saborcito_front](https://github.com/LautaroEmanuelG/El_saborcito_front)
- **JIRA (Gestión de tareas):** [Tablero de tareas](https://erosmariotti401-1742469568399.atlassian.net/jira/core/projects/ES/board?selectedIssue=ES-16&atlOrigin=eyJpIjoiNjVjN2M3YTRjYTY4NDJmZDhlMDc2Zjc4YmQzYmMyZWIiLCJwIjoiaiJ9)
- **Google Drive (Documentación y recursos):** [Carpeta Drive](https://drive.google.com/drive/folders/1AidjC484Kk5kz4Sw-7hI5u736dp-7iz7)
- **Figma (Diseño UI/UX):** [Proyecto Figma](https://www.figma.com/design/h92Em0W6NbAVjUaHnliwJ5/Laboratorio-3-El-saborcito?node-id=0-1&p=f)

**Usuarios de GitHub del equipo:**

- [JenJen007](https://github.com/JenJen007)
- [ErosMariotti](https://github.com/ErosMariotti)
- [matias-araya-02](https://github.com/matias-araya-02)
- [matiasman1](https://github.com/matiasman1)
- [pabloosoor](https://github.com/pabloosoor)

**Contacto:** elsaborcito2024@gmail.com

<div align="center">
  
**🚀 ¡Gracias por usar El Saborcito! 🚀**

Si te gusta el proyecto, no olvides darle una ⭐

</div>

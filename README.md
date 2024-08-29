# 🍔🍟 Proyecto Web de E-commerce para Restaurante

## Descripción del Proyecto

Desarrollo de un sistema web para un restaurante que permita gestionar ventas y administrar finanzas de manera eficiente. Los clientes podrán realizar compras de comida utilizando diversos medios de pago como Mercado Pago y criptomonedas. Además, los administradores tendrán acceso a estadísticas y finanzas de la empresa, gestionando inventarios y realizando registros contables básicos.

## 🔍 Objetivos Principales

- **Venta de Comidas**: Permitir a los clientes comprar comidas a través de una interfaz intuitiva con un carrito de compras y opciones de pago diversificadas.
- **Gestión Administrativa**: Proveer a los administradores una plataforma para gestionar inventarios, visualizar estadísticas de ventas y finanzas, y recibir alertas de reposición.
- **Tecnologías Utilizadas**: HTML, CSS, JavaScript, React , Tailwind y TypeScript para el front-end. Integración de APIs de Mercado Pago y Binance para pagos.

## Perfiles de Usuario

- **Cliente**: Usuarios que navegan y realizan compras de comida en el sitio.
- **Administrador**: Usuarios con permisos para gestionar el inventario, revisar estadísticas, y administrar finanzas.

## Experiencia de Usuario Deseada

- **Navegación**: Simple, intuitiva y accesible con elementos visuales atractivos (colores, imágenes dinámicas).
- **Usabilidad**: Opciones de compra claras, carrito de compras accesible, descripciones detalladas de los productos, y categorías de comida visibles.

## Funcionalidades Críticas

1. **Sistema de Pagos**: Integración con Mercado Pago y Binance.
2. **Carrito de Compras**: Gestión fácil de productos, con confirmaciones visuales al añadir artículos.
3. **Buscador de Comidas**: Filtro y categorización de productos por tipo de comida.
4. **Estadísticas y Finanzas**: Visualización de estadísticas para administradores.

## Historias de Usuario Principales

1. **Carrusel de Más Vendidos**: Mostrar productos más vendidos en un carrusel fluido.
2. **Categorías de Comidas**: Presentar productos categorizados (hamburguesas, pizzas, etc.) para fácil acceso.
3. **Compra Inmediata**: Permitir a los clientes comprar con un solo clic desde la página principal.
4. **Descripción del Producto**: Mostrar detalles completos de cada producto (ingredientes, alérgenos, calorías).
5. **Gestión de Carrito de Compras**: Facilitar la adición, eliminación y modificación de productos en el carrito.
6. **Medios de Pago**: Ofrecer diversas opciones de pago.
7. **Retiro en Local**: Permitir al cliente seleccionar la opción de retiro en local y programar la hora de recogida.
8. **Generación de Ticket**: Emitir un ticket de compra con detalles al finalizar la transacción.
9. **Acceso Seguro (Admin)**: Proveer un acceso seguro exclusivo para administradores.
10. **Historial de Compras (Admin)**: Permitir a los administradores ver un historial detallado de las compras.
11. **Estadísticas Mensuales/Anuales (Admin)**: Mostrar gráficos y tablas de estadísticas de ventas y finanzas.
12. **Gestión de Inventario (CRUD) (Admin)**: Administrar el inventario de productos (crear, leer, actualizar, eliminar).
13. **Avisos de Reposición (Admin)**: Notificar al administrador cuando sea necesario reponer productos.

## 🚀 Guía para Colaboradores

¡Gracias por tu interés en colaborar con este proyecto! A continuación, se detallan los pasos que debes seguir para comenzar a trabajar en este proyecto de **React** con **TypeScript** y **Vite**.

### 1. Realiza un Fork del Proyecto

1. Ve al repositorio principal en GitHub.
2. Haz clic en el botón `Fork` en la esquina superior derecha de la página. Esto creará una copia de este repositorio en tu cuenta de GitHub.

### 2. Clona el Repositorio Forkeado

Clona el repositorio forkeado a tu máquina local utilizando el siguiente comando:

```bash
git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git
```

Reemplaza tu-usuario por tu nombre de usuario en GitHub y nombre-del-repo por el nombre del repositorio.

### 3. Instala las Dependencias

Navega al directorio del proyecto y ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
cd nombre-del-repo
npm install
```

### 4. Crea una Nueva Rama

Antes de comenzar a trabajar en tus cambios, crea una nueva rama con un nombre descriptivo:

```bash
git checkout -b feat/nombre-de-tu-rama
```

Reemplaza nombre-de-tu-rama por un nombre que describa la funcionalidad o el cambio que vas a implementar (por ejemplo, feat/agregar-carrusel o fix/correccion-bug).

### 5. Realiza tus Cambios

Haz los cambios necesarios en el código. Asegúrate de que tu código esté limpio y cumpla con las convenciones del proyecto.

### 6. Asegúrate de que Todo Funciona

Ejecuta el siguiente comando para iniciar el servidor de desarrollo y verificar que todo funciona correctamente:

```bash
npm run dev
```

### 7. Realiza Commits de tus Cambios

Realiza commits de tus cambios de forma organizada siguiendo la convención de commits del proyecto:

```bash
git add .
git commit -m "feat(component): agregar nueva funcionalidad"
```

### 8. Sube tus Cambios a GitHub

Envía tus cambios a tu repositorio remoto en GitHub:

```bash
git push origin feat/nombre-de-tu-rama
```

### 9. Crea un Pull Request

Ve al repositorio original en GitHub.
Haz clic en el botón Compare & pull request que aparecerá justo después de enviar los cambios.
Describe los cambios realizados, proporciona contexto y referencia cualquier issue relacionado.
Haz clic en Create pull request.

### 10. Espera la Revisión

Tu pull request será revisado por los mantenedores del proyecto. Puede que se te soliciten algunos cambios adicionales. Una vez que se apruebe, será fusionado en la rama principal.

### 📝 Notas Adicionales

Asegúrate de que tu código pase todas las pruebas antes de crear un pull request.
Sigue las convenciones de nomenclatura y formato del proyecto.
Asegúrate de mantener tu fork actualizado con la rama principal del repositorio original:

```bash
git remote add upstream https://github.com/original-repo/nombre-del-repo.git
git fetch upstream
git merge upstream/main

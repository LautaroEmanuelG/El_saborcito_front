# 🔍 Funcionalidad de Búsqueda y Filtrado

## Arquitectura

La funcionalidad de búsqueda y filtrado de productos está implementada siguiendo un patrón de "Provider Pattern" con Zustand como gestor de estado. Esta arquitectura proporciona:

1. **Estado Global Centralizado**: Todos los productos, categorías y estados de filtrado se mantienen en un único lugar
2. **Componentes Reactivos**: Los componentes se actualizan automáticamente cuando cambia el estado
3. **Separación de Responsabilidades**: La lógica de filtrado está separada de los componentes de UI

## 📁 Estructura de Archivos

- **ProductProvider.tsx**: Provider principal que contiene toda la lógica y estado con Zustand
- **useProductSearch.tsx**: Hook personalizado para interactuar con el Provider
- **useSearch.tsx**: Hook obsoleto mantenido por compatibilidad (redirige a useProductSearch)

## 🔄 Flujo de datos

```
ProductProvider (Zustand Store)
      ⬆️ ⬇️
useProductSearch Hook
      ⬆️ ⬇️
Componentes (Web, Buscador, PaginaPrincipalClientes, etc.)
```

## 📊 Estado Global

El estado global de productos incluye:

- Lista completa de productos (`allProducts`)
- Lista filtrada de productos (`filteredProducts`)
- Categorías disponibles (`allCategorias`)
- Término de búsqueda actual (`searchTerm`)
- Categoría activa (`activeCategory`) - Separada del searchTerm
- Estado de carga (`isLoading`)
- Posibles errores (`error`)

## 🛠️ Funciones Principales

1. **fetchAllData()**: Carga productos y categorías del backend
2. **handleSearch(query)**: Filtra productos por texto y actualiza el searchTerm
3. **handleCategoryFilter(category)**: Filtra productos por categoría sin afectar el searchTerm
4. **resetFilters()**: Restaura los filtros a su estado original
5. **getArticuloCategoriaId()**: Extrae el ID de categoría de un producto

## 🧩 Integración de Componentes

- **Web.tsx**: Componente principal que usa `useProductSearch`
- **Header.tsx**: Contiene el componente de búsqueda
- **Buscador.tsx**: Implementa la UI de búsqueda usando `handleSearchInputChange`
- **PaginaPrincipalClientes.tsx**: Muestra productos filtrados y pasa handleCategoryFilter a ListaCategorias
- **ListaCategorias.tsx**: Muestra categorías filtradas y pasa onCategoryFilter a BtnCategoria
- **BtnCategoria.tsx**: Usa onCategoryFilter para filtrar por categoría sin afectar el campo de búsqueda

## 📝 Recomendaciones para Desarrolladores

1. Para acceder al estado de productos y categorías, utilice el hook `useProductSearch`
2. Para modificar la lógica de filtrado, editar `ProductProvider.tsx`
3. Para añadir nuevas funcionalidades relativas a productos, considere extender el ProductProvider
4. No utilice `useSearch.tsx` en componentes nuevos, ya que está obsoleto

## 📈 Mejoras Futuras

- Implementar caché de resultados para mejorar rendimiento
- Añadir filtros adicionales (precio, popularidad, etc.)
- Mejorar la lógica de búsqueda con opciones avanzadas
- Integrar con un sistema de analytics para tracking de búsquedas populares

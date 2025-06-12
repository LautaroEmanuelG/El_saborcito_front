# 🔄 Cambios Recientes - junio 2025

## 🚀 Mejora en la Experiencia de Usuario con Categorías

### 📋 Problema Original

Anteriormente, cuando un usuario hacía clic en una categoría (por ejemplo, "Hamburguesas"), el sistema:

1. Filtraba los productos para mostrar solo las hamburguesas
2. Escribía "Hamburguesas" en el campo de búsqueda

Esto causaba confusión porque:

- Si el usuario quería buscar otro producto después, debía borrar manualmente el texto de la categoría
- No existía una distinción clara entre búsqueda por texto y filtrado por categoría
- Visualmente no quedaba claro cuál era el estado actual del filtro

### 💡 Solución Implementada

Hemos implementado un sistema separado para manejar la selección de categorías:

1. **Estado separado para categorías**: Ahora usamos `activeCategory` en el ProductProvider
2. **Nueva función `handleCategoryFilter`**: Filtra productos por categoría sin modificar el campo de búsqueda
3. **Componentes actualizados**:
   - `BtnCategoria`: Ahora utiliza `onCategoryFilter` si está disponible
   - `ListaCategorias`: Pasa el nuevo handler a cada botón de categoría
   - `PaginaPrincipalClientes`: Conecta todo con el Provider

### 🧹 Limpieza de Código

Como parte de esta mejora, se eliminaron archivos obsoletos:

- `src/shared/hooks/useSearch.tsx` (reemplazado por stub de compatibilidad)
- `src/shared/hooks/useSearch.tsx.new`
- `src/shared/hooks/useCategoriesDebug.ts`
- `src/shared/store/useProductStore.ts` (migrado a `ProductProvider.tsx`)

## 🧪 Pruebas

- Se ha verificado que ahora al hacer clic en una categoría los productos se filtran correctamente
- El campo de búsqueda permanece vacío cuando se selecciona una categoría
- Se pueden realizar búsquedas de texto mientras hay una categoría seleccionada
- Se mantiene la compatibilidad con componentes que usan la API anterior

## 🔄 Próximos Pasos

- Implementar indicadores visuales más claros de la categoría activa
- Revisar la UX de la barra de búsqueda para reflejar mejor el estado actual del filtro
- Considerar añadir un botón "Limpiar filtros" más visible

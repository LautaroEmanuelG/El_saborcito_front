# Implementación de Verificación de Stock para Insumos

## Resumen de Cambios Realizados

Se implementó la funcionalidad para verificar el stock de artículos insumo (bebidas, etc.) y mostrar el cartel "Sin stock de insumos" cuando no hay stock suficiente.

## Backend

### 1. ArticuloInsumoService.java

- **Método agregado**: `puedeVenderse(Long id)`
  - Verifica si un insumo tiene stock suficiente (stockActual > 0)
  - Ubicación: Al final de la clase, antes del cierre

### 2. ArticuloInsumoController.java

- **Endpoint agregado**: `GET /api/insumos/{id}/can-be-sold`
  - Retorna `boolean` indicando si el insumo puede venderse
  - Ubicación: Junto a los otros métodos `@GetMapping`

## Frontend

### 1. articuloInsumoService.ts

- **Función agregada**: `canBeSold(id: number): Promise<boolean>`
  - Consulta el endpoint `/api/insumos/{id}/can-be-sold`
  - Maneja errores retornando `false` por defecto

### 2. ProductProvider.tsx

- **Función modificada**: `checkSingleProductAvailability`
  - Ahora detecta si es insumo o manufacturado
  - Usa `canBeSold` para insumos y `canBeManufactured` para manufacturados
- **Función modificada**: `fetchAllData`
  - Ahora verifica stock inicial tanto de manufacturados como de insumos

### 3. CardProducto.tsx

- **Cartel mejorado**: Ahora muestra "Sin stock de insumos" para cualquier artículo sin disponibilidad
- **Botón deshabilitado**: Se deshabilita para cualquier artículo sin stock (no solo manufacturados)

### 4. ModalProducto.tsx

- **Mismos cambios** que CardProducto.tsx para consistencia

## Comportamiento Esperado

1. **Insumos con stock > 0**: Se muestran normales, botón habilitado
2. **Insumos con stock = 0**:

   - Aparece cartel "Sin stock de insumos"
   - Botón "Agregar al carrito" deshabilitado en gris
   - Tooltip indica que no hay stock

3. **Manufacturados sin insumos suficientes**:
   - Misma lógica que antes (sin cambios)

## Verificación

Para probar la funcionalidad:

1. Crear un insumo "no para elaborar" (ej: bebida) con stock 0
2. El insumo debe aparecer en el landing con el cartel "Sin stock de insumos"
3. El botón debe estar deshabilitado y en gris

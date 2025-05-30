# 🗑️ Implementación de Eliminación Lógica (Soft Delete)

## 📋 Resumen

Se ha adaptado completamente el frontend para manejar eliminación lógica según los endpoints del backend. Los servicios ahora coinciden exactamente con la estructura del controller `ArticuloController`.

**🚨 IMPORTANTE: Solo eliminación lógica y restauración. NO hay eliminación permanente en la base de datos.**

## 🔧 Servicios Actualizados

### 1. articuloManufacturadoService.ts ✅

- **Eliminación lógica**: `DELETE /manufacturados/{id}`
- **Restaurar**: `POST /manufacturados/deleted/{id}/restore`
- **Consulta eliminados**: `GET /manufacturados/deleted`
- **Consulta eliminado específico**: `GET /manufacturados/deleted/{id}`

### 2. articuloInsumoService.ts ✅

- **Eliminación lógica**: `DELETE /insumos/{id}`
- **Restaurar**: `POST /insumos/deleted/{id}/restore`
- **Consulta eliminados**: `GET /insumos/deleted`
- **Consulta eliminado específico**: `GET /insumos/deleted/{id}`

### 3. articuloService.ts ✅

- **Eliminación lógica**: `DELETE /articulos/{id}`
- **Restaurar**: `POST /articulos/deleted/{id}/restore`
- **Consulta eliminados**: `GET /articulos/deleted`
- **Consulta eliminado específico**: `GET /articulos/deleted/{id}`

## 🏪 Store Actualizado

### articuloManufacturadoStore.ts ✅

- ✅ **Eliminado** `permanentDeleteArticulo` (no existe en BD)
- ✅ **Actualizado** `toggleShowDeleted` para trabajar con listas separadas
- ✅ **Mejorada** lógica de refrescado después de operaciones

## 🎯 Funcionalidades Implementadas

### Para Artículos Activos:

- ✅ Crear nuevos artículos
- ✅ Actualizar artículos existentes
- ✅ Eliminar artículos (soft delete)
- ✅ Listar artículos activos

### Para Artículos Eliminados:

- ✅ Listar artículos eliminados
- ✅ Restaurar artículos eliminados
- ✅ Ver detalles de artículos eliminados

## 🔄 Flujo de Trabajo

### Eliminación Normal:

1. Usuario hace clic en "Eliminar"
2. Se ejecuta eliminación lógica (`DELETE /{id}`)
3. El artículo se mueve a la lista de eliminados
4. Se refresca la lista de activos

### Restauración:

1. Usuario ve lista de eliminados
2. Hace clic en "Restaurar"
3. Se ejecuta restauración (`POST /deleted/{id}/restore`)
4. Se refrescan ambas listas (activos y eliminados)

## 🚨 Notas Importantes

### Endpoints Backend Requeridos:

Los siguientes endpoints deben estar implementados en cada controller:

```java
@DeleteMapping("/{id}")
public void delete(@PathVariable Long id)

@GetMapping("/deleted")
public List<DTO> getAllDeleted()

@GetMapping("/deleted/{id}")
public Entity getOneDeleted(@PathVariable Long id)

@PostMapping("/deleted/{id}/restore")
public void restore(@PathVariable Long id)
```

### Consideraciones:

- **NO HAY eliminación permanente** - Los datos solo se marcan como eliminados
- Los endpoints adicionales como `/es-para-elaborar/with-deleted` pueden no existir
- El filtrado por categoría se mantiene client-side para compatibilidad
- Todos los servicios mantienen retrocompatibilidad con código existente

## ✅ Estado Actual

- **Servicios**: Completamente adaptados (solo soft delete)
- **Store**: Actualizado y sin errores
- **Componentes**: UI simplificada (sin eliminación permanente)
- **Tipos**: Compatibles
- **Endpoints**: Alineados con backend

¡La implementación de eliminación lógica está completa y lista para testing! 🎉

# Validación de Restauración: Categorías y Artículos Manufacturados

## Problema

Cuando se elimina una categoría padre (baja lógica), las subcategorías y artículos que dependen de ella también se eliminan automáticamente. Sin embargo, el sistema permitía restaurar subcategorías y artículos aunque su categoría padre siguiera eliminada, lo cual genera inconsistencias en la base de datos.

## Solución Implementada

### Frontend

Se agregaron validaciones en los stores y servicios para verificar antes de restaurar:

1. **Servicios (`categoriaService.ts` y `articuloManufacturadoService.ts`)**:

   - `canRestoreCategoria(id)`: Verifica si una subcategoría puede ser restaurada
   - `canRestoreArticuloManufacturado(id)`: Verifica si un artículo puede ser restaurado

2. **Stores**:
   - Los métodos `restoreCategoria` y `restoreArticulo` ahora validan antes de restaurar
   - Muestran mensajes de error específicos cuando no se puede restaurar

### Backend (Implementación Requerida)

#### 1. CategoriaController.java

Agregar este método al controlador existente:

```java
// NUEVO: Validar si una categoría puede ser restaurada
@GetMapping("/{id}/can-restore")
public Map<String, Object> canRestoreCategoria(@PathVariable Long id) {
    return service.canRestoreCategoria(id);
}
```

#### 2. CategoriaService.java

Agregar este método al servicio existente:

```java
public Map<String, Object> canRestoreCategoria(Long id) {
    Map<String, Object> result = new HashMap<>();

    // Buscar la categoría eliminada
    Optional<Categoria> categoriaOpt = categoriaRepository.findByIdAndEliminadoTrue(id);
    if (!categoriaOpt.isPresent()) {
        result.put("canRestore", false);
        result.put("message", "Categoría no encontrada o no está eliminada");
        return result;
    }

    Categoria categoria = categoriaOpt.get();

    // Si es una categoría padre (tipoCategoria == null), siempre se puede restaurar
    if (categoria.getTipoCategoria() == null) {
        result.put("canRestore", true);
        return result;
    }

    // Si es una subcategoría, verificar que su padre no esté eliminado
    Categoria categoriaPadre = categoria.getTipoCategoria();
    if (categoriaPadre.getEliminado()) {
        result.put("canRestore", false);
        result.put("message", "No se puede restaurar esta subcategoría porque su categoría padre está eliminada");
        return result;
    }

    result.put("canRestore", true);
    return result;
}
```

#### 3. CategoriaRepository.java

```java
@Query("SELECT c FROM Categoria c WHERE c.id = :id AND c.eliminado = true")
Optional<Categoria> findByIdAndEliminadoTrue(@Param("id") Long id);
```

#### 4. ArticuloManufacturadoController.java

```java
@GetMapping("/{id}/can-restore")
public ResponseEntity<Map<String, Object>> canRestoreArticulo(@PathVariable Long id) {
    Map<String, Object> response = articuloManufacturadoService.canRestoreArticulo(id);
    return ResponseEntity.ok(response);
}
```

#### 5. ArticuloManufacturadoService.java

```java
public Map<String, Object> canRestoreArticulo(Long id) {
    Map<String, Object> result = new HashMap<>();

    // Buscar el artículo eliminado
    Optional<ArticuloManufacturado> articuloOpt = articuloManufacturadoRepository.findByIdAndEliminadoTrue(id);
    if (!articuloOpt.isPresent()) {
        result.put("canRestore", false);
        result.put("message", "Artículo no encontrado o no está eliminado");
        return result;
    }

    ArticuloManufacturado articulo = articuloOpt.get();

    // Verificar que la categoría del artículo no esté eliminada
    Categoria categoria = categoriaRepository.findById(articulo.getCategoriaId()).orElse(null);
    if (categoria == null || categoria.getEliminado()) {
        result.put("canRestore", false);
        result.put("message", "No se puede restaurar este artículo porque su categoría está eliminada");
        return result;
    }

    // Si es una subcategoría, verificar también su padre
    if (categoria.getTipoCategoria() != null && categoria.getTipoCategoria().getEliminado()) {
        result.put("canRestore", false);
        result.put("message", "No se puede restaurar este artículo porque la categoría padre está eliminada");
        return result;
    }

    result.put("canRestore", true);
    return result;
}
```

#### 6. ArticuloManufacturadoRepository.java

```java
@Query("SELECT a FROM ArticuloManufacturado a WHERE a.id = :id AND a.eliminado = true")
Optional<ArticuloManufacturado> findByIdAndEliminadoTrue(@Param("id") Long id);
```

## Beneficios

1. **Consistencia de datos**: Evita que se restauren elementos huérfanos
2. **Mejor UX**: Mensajes de error claros y descriptivos
3. **Integridad referencial**: Mantiene la coherencia de la jerarquía de categorías
4. **Prevención de errores**: Evita estados inconsistentes en el sistema

## Archivos Modificados (Frontend)

- `src/shared/services/categoriaService.ts`
- `src/shared/services/articuloManufacturadoService.ts`
- `src/modules/HU21_CRUD_CategoriasArticulos/services/categoriaArticuloStore.ts`
- `src/modules/HU22_CRUDArticulos/services/articuloManufacturadoStore.ts`

## Commit Message

```
feat: Implementar validación de restauración para categorías y artículos

- Agregar endpoints de validación para verificar si se puede restaurar
- Validar que categorías padre no estén eliminadas antes de restaurar subcategorías
- Validar que categorías no estén eliminadas antes de restaurar artículos
- Mostrar mensajes de error específicos cuando no se puede restaurar
- Mantener integridad referencial en la jerarquía de categorías

Fixes: Previene restauración de elementos huérfanos
```

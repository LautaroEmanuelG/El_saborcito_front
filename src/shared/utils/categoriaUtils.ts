/**
 * Utilidades para trabajar con categorías en El Saborcito
 */

import { Categoria } from '../../types/Categoria';

/**
 * Verifica si una categoría es padre (no tiene tipoCategoria)
 * @param categoria La categoría a comprobar
 * @returns true si la categoría es padre
 */
export const esCategoriaRaiz = (categoria: Categoria): boolean => {
  return !categoria.tipoCategoria || categoria.tipoCategoria === null;
};

/**
 * Verifica si una categoría es hija de otra
 * @param categoria La categoría hijo potencial
 * @param categoriaId ID de la categoría padre potencial
 * @returns true si la categoría es hija de la categoría con el ID proporcionado
 */
export const esCategoriaHija = (categoria: Categoria, categoriaId: number): boolean => {
  return (
    categoria.tipoCategoria !== null &&
    categoria.tipoCategoria?.id !== undefined &&
    categoria.tipoCategoria.id === categoriaId
  );
};

/**
 * Encuentra todas las categorías hijas de una categoría padre
 * @param padre La categoría padre
 * @param todasCategorias Todas las categorías disponibles
 * @returns Un array con las categorías hijas
 */
export const obtenerCategoriasHijas = (
  padre: Categoria,
  todasCategorias: Categoria[]
): Categoria[] => {
  if (padre.id === undefined) return [];

  return todasCategorias.filter((cat) => esCategoriaHija(cat, padre.id!));
};

/**
 * Comprueba si dos arrays de categorías son iguales (mismo contenido)
 * @param array1 Primer array de categorías
 * @param array2 Segundo array de categorías
 * @returns true si los arrays contienen las mismas categorías
 */
export const sonArraysDeCategoriasIguales = (array1: Categoria[], array2: Categoria[]): boolean => {
  if (array1.length !== array2.length) return false;

  // Mapear arrays a IDs para comparación más sencilla
  const ids1 = array1
    .map((cat) => cat.id)
    .filter((id): id is number => id !== undefined)
    .sort((a, b) => a - b);
  const ids2 = array2
    .map((cat) => cat.id)
    .filter((id): id is number => id !== undefined)
    .sort((a, b) => a - b);

  return ids1.every((val, index) => val === ids2[index]);
};

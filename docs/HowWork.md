# 📄 Documento de Organización de Trabajo

**Proyecto:** Sistema de E-commerce – El Buen Sabor

**👥 Integrantes:**

- Contreras
- Araya
- González
- Mariotti
- Osorio

---

## 🛜 Link a Excalidraw

[Excalidraw](Excalidraw)

---

## 🧭 Propósito del documento

Este documento establece la forma de trabajo que vamos a llevar a cabo a lo largo del desarrollo del sistema. No es un instructivo paso a paso, pero sí marca puntos clave para que todos sepamos cómo organizarnos y trabajar de forma eficiente, manteniendo un código limpio, modular y profesional.

---

## 📁 Estructura del proyecto

La organización del repositorio está basada en **historias de usuario (HU)**. Cada grupo funcional del sistema está mapeado a un módulo dentro de `src/modules`, bajo un nombre como `HU12_13_pedidos`, `HU22_abmIngredientes`, etc.

Cada módulo tiene su propia estructura interna con:

- `components/`: componentes de UI específicos del módulo
- `services/`: llamadas a la API del backend
- `logic.ts`: casos de uso, funciones principales del módulo
- `model.ts`: tipado local del módulo

Además, existen carpetas globales compartidas:

- `shared/`: componentes reutilizables (ui/), hooks, contextos, constantes, utilidades y ABM genérico
- `types/`: tipados globales compartidos
- `app/`: layout general, rutas, store
- `assets/`: imágenes y recursos gráficos

---

## 🧠 Flujo de trabajo

### Antes de comenzar a codear

1. **Abrir este documento.**
   - Debe ser lo primero que abramos. Siempre verificar qué HU se va a trabajar y en qué carpeta/módulo lo vamos a hacer.
2. **Revisar el Excalidraw (diagrama de estructura).**
   - Para visualizar cómo se relacionan los módulos, rutas, y qué contexto tenés alrededor de tu HU.
3. **Revisar si ya existe tu módulo (lo dudo).**
   - Si no, se crea con la estructura estándar (`components/`, `services/`, `logic.ts`, `model.ts`).

### 󰳕 Al momento de programar

- El código debe mantenerse **modular** y encapsulado en el módulo correspondiente.
- Evitar crear lógica o componentes duplicados si ya existen en `shared/`.
- Si algo puede ser reutilizable en más de un módulo, se mueve a `shared/`.

---

## 📬 Comunicación de tareas

- Cada vez que se asigne una HU, se debe identificar qué módulo le corresponde (por nombre y carpeta).
- Los nombres de funciones, archivos y variables deben ser **claros y semánticos**.
- Los PR deben estar correctamente titulados y referenciar la HU que resuelven.

---

## 🤖 Prompts y asistencia (**¡IMPORTANTE!**)

Cuando utilicemos herramientas como ChatGPT u otras IA:

- Siempre incluir en el prompt:
  1. Qué módulo estás trabajando
  2. Qué archivo estás tocando
  3. Qué funcionalidad estás resolviendo
  4. Opcional: Lenguaje y stack correspondiente (React, TypeScript, Java, etc.)

**Ejemplo:**

> Estoy trabajando en el módulo `HU12_13_pedidos`, archivo `logic.ts`. Necesito una función para calcular el tiempo estimado de entrega de un pedido en base al tiempo de preparación total.

---

## 📌 Buenas prácticas

- Todos los componentes deben tener **tipado explícito**.
- Las rutas van organizadas por tipo de usuario en `app/routes`.
- Los contextos deben estar en `shared/context/` y **no deben duplicarse**.
- Los servicios deben **separar responsabilidades**: no combinar lógica y llamadas a API.
- Cualquier cambio en estructura debe ser **comunicado y acordado**.

---

## ✔️ En resumen

- Siempre arrancar abriendo este documento.
- Seguir la estructura ya establecida.
- No improvisar carpetas nuevas sin revisar si ya existe.
- Priorizar código **claro, mantenible y reutilizable**.

# 🚀 Guía para Colaboradores

¡Gracias por tu interés en colaborar con este proyecto! A continuación, se detallan los pasos que debes seguir para comenzar a trabajar en este proyecto de **React** con **TypeScript** y **Vite**.

## 1. Realiza un Fork del Proyecto

1. Ve al repositorio principal en GitHub.
2. Haz clic en el botón `Fork` en la esquina superior derecha de la página. Esto creará una copia de este repositorio en tu cuenta de GitHub.

## 2. Clona el Repositorio Forkeado

Clona el repositorio forkeado a tu máquina local utilizando el siguiente comando:

```bash
git clone https://github.com/<tu-usuario>/<nombre-del-repo>.git
```

Reemplaza tu-usuario por tu nombre de usuario en GitHub y nombre-del-repo por el nombre del repositorio.

## 3. Instala las Dependencias

Navega al directorio del proyecto y ejecuta el siguiente comando para instalar todas las dependencias necesarias:

```bash
cd nombre-del-repo
npm install
```

## 4. Crea una Nueva Rama

Antes de comenzar a trabajar en tus cambios, crea una nueva rama con un nombre descriptivo:

```bash
git checkout -b feat/nombre-de-tu-rama
```

Reemplaza nombre-de-tu-rama por un nombre que describa la funcionalidad o el cambio que vas a implementar (por ejemplo, feat/agregar-carrusel o fix/correccion-bug).

## 5. Realiza tus Cambios

Haz los cambios necesarios en el código. Asegúrate de que tu código esté limpio y cumpla con las convenciones del proyecto.

## 6. Asegúrate de que Todo Funciona

Ejecuta el siguiente comando para iniciar el servidor de desarrollo y verificar que todo funciona correctamente:

```bash
npm run dev
```

## 7. Realiza Commits de tus Cambios

Realiza commits de tus cambios de forma organizada siguiendo la convención de commits del proyecto:

```bash
git add .
git commit -m "feat(component): agregar nueva funcionalidad"
```

## 8. Sube tus Cambios a GitHub

Envía tus cambios a tu repositorio remoto en GitHub:

```bash
git push origin feat/nombre-de-tu-rama
```

## 9. Crea un Pull Request

Ve al repositorio original en GitHub.
Haz clic en el botón Compare & pull request que aparecerá justo después de enviar los cambios.
Describe los cambios realizados, proporciona contexto y referencia cualquier issue relacionado.
Haz clic en Create pull request.

## 10. Espera la Revisión

Tu pull request será revisado por los mantenedores del proyecto. Puede que se te soliciten algunos cambios adicionales. Una vez que se apruebe, será fusionado en la rama principal.

## 📝 Notas Adicionales

Asegúrate de que tu código pase todas las pruebas antes de crear un pull request.
Sigue las convenciones de nomenclatura y formato del proyecto.
Asegúrate de mantener tu fork actualizado con la rama principal del repositorio original:

```bash
git remote add upstream https://github.com/original-repo/nombre-del-repo.git
git fetch upstream
git merge upstream/main
```

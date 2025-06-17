# 🚀 Guía de Despliegue en Vercel

## 📋 **Pre-requisitos**

✅ Backend funcionando en Render  
✅ Base de datos en Railway  
✅ Cuentas configuradas:

- Auth0
- MercadoPago
- Coinbase/OnchainKit

## 🔧 **Pasos para Desplegar**

### 1️⃣ **Preparar el Repositorio**

```bash
# Asegurarse de que .env no esté en el repo
echo ".env" >> .gitignore

# Hacer commit de los cambios
git add .
git commit -m "🚀 Preparar para deploy en Vercel"
git push origin main
```

### 2️⃣ **Configurar Vercel**

1. Ve a [https://vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las **Environment Variables** en Vercel:

#### Variables para Producción:

```bash
VITE_BACKEND_URL=https://TU_BACKEND_EN_RENDER.onrender.com/api
VITE_AUTH0_DOMAIN=dev-hedh862x53dvjz66.us.auth0.com
VITE_AUTH0_CLIENT_ID=yp7XW2BgUPuTebvUsZPwXyAYPBUpQGW8
VITE_AUTH0_AUDIENCE=https://saborcito/api
VITE_AUTH0_CALLBACK_URL=https://TU_DOMINIO_DE_VERCEL.vercel.app/callback
VITE_MP_PUBLIC_KEY=APP_USR-77def03b-80d9-41b7-a33c-5b258315f729
PAYMASTER_AND_BUNDLER_ENDPOINT=https://api.developer.coinbase.com/rpc/v1/base-sepolia/UlYBnMHViIFNA20QIQrBSzAFwa60ZYEi
VITE_PUBLIC_ONCHAINKIT_API_KEY=UlYBnMHViIFNA20QIQrBSzAFwa60ZYEi
PRODUCT_ID=6a003d54-e95f-413f-b78b-27e759349e1
```

### 3️⃣ **Configurar CORS en Backend**

En tu backend de Render, asegúrate de agregar tu dominio de Vercel:

```java
// En tu configuración de CORS
@CrossOrigin(origins = {
    "http://localhost:5173",
    "https://tu-dominio.vercel.app"
})
```

### 4️⃣ **Configurar Auth0**

1. Ve a tu dashboard de Auth0
2. En **Applications** → **Settings**
3. Actualiza:
   - **Allowed Callback URLs**: `https://tu-dominio.vercel.app/callback`
   - **Allowed Web Origins**: `https://tu-dominio.vercel.app`
   - **Allowed Origins (CORS)**: `https://tu-dominio.vercel.app`

### 5️⃣ **Verificar Despliegue**

Después del deploy, verifica:

- ✅ La aplicación carga correctamente
- ✅ Auth0 redirige correctamente después del login
- ✅ Las llamadas a la API del backend funcionan
- ✅ MercadoPago se inicializa sin errores
- ✅ No hay errores de CORS en la consola

## 🐛 **Solución de Problemas**

### Error de CORS

```
Access to XMLHttpRequest at 'https://backend.onrender.com' from origin 'https://app.vercel.app' has been blocked by CORS policy
```

**Solución**: Agregar el dominio de Vercel a la configuración de CORS del backend.

### Error de Auth0 Callback

```
Callback URL mismatch
```

**Solución**: Verificar que `VITE_AUTH0_CALLBACK_URL` coincida con la configuración en Auth0.

### Variables de entorno no definidas

```
import.meta.env.VITE_BACKEND_URL is undefined
```

**Solución**: Verificar que todas las variables tengan el prefijo `VITE_` y estén configuradas en Vercel.

## 📱 **URLs de Ejemplo**

- **Frontend**: https://el-saborcito.vercel.app
- **Backend**: https://el-saborcito-backend.onrender.com
- **Callback**: https://el-saborcito.vercel.app/callback

## 🔄 **Actualizaciones**

Para hacer cambios:

1. Edita el código localmente
2. `git commit` y `git push`
3. Vercel redesplegará automáticamente

---

📝 **Notas importantes:**

- Nunca commitear el archivo `.env` al repositorio
- Usar siempre HTTPS en producción
- Verificar que todas las integraciones (Auth0, MP, Coinbase) funcionen después del deploy

<!-- fdf32dab-a034-44b6-b010-6c9ac274581e e3ffa0cd-eb99-48a7-971b-bdc6cc37da7b -->
# Plan: Configurar Sistema para APIs Reales

## Objetivo

Asegurar que el sistema funcione correctamente con las APIs reales del backend cuando el modo de pruebas esté desactivado, verificando endpoints, autenticación, y manejo de errores.

## Pasos de Implementación

### 1. Verificar Configuración del Backend URL

**Archivo:** `js/api.js`

- Verificar que `getBackendUrl()` retorne la URL correcta según el entorno:
- Producción HTTPS: `/api/` (funciones serverless de Vercel)
- Localhost: `http://localhost:3000/api/`
- Fallback: `https://api.beecy.app/`
- Verificar que el meta tag `backend-url` en `login.html` y `verify.html` tenga la URL correcta del backend real
- Si es necesario, actualizar el fallback con la URL real de producción

**Ubicación:** Líneas 1-32 en `js/api.js`

### 2. Asegurar que el Modo de Pruebas Esté Desactivado por Defecto

**Archivo:** `js/testing.js`

- Verificar que `isTestMode()` retorne `false` por defecto
- Asegurar que no se active automáticamente al cargar la página
- Verificar que `localStorage.getItem('test_mode')` no esté configurado como `'true'` por defecto

**Ubicación:** Función `isTestMode()` en `js/testing.js` (líneas 17-24)

### 3. Verificar que la Intercepción de Pruebas Solo Funcione en Modo de Pruebas

**Archivo:** `js/api.js`

- Confirmar que la intercepción en `apiRequest()` solo ocurra cuando `interceptTestRequest()` retorne un valor (modo de pruebas activo)
- Cuando el modo de pruebas esté desactivado, todas las llamadas deben ir directamente al backend real
- Verificar el flujo: si `testResponse === null`, continuar con la llamada real

**Ubicación:** Líneas 36-42 en `js/api.js`

### 4. Verificar Endpoints de Administración

**Archivo:** `js/users.js`

- Confirmar que los endpoints coincidan con la documentación:
- `POST /admin/user/by-phone` (línea 15)
- `POST /admin/user/update` (línea ~140)
- `POST /admin/user/deactivate` (línea ~180)
- `POST /admin/user/activate` (línea ~210)
- `POST /admin/user/delete` (línea ~245)
- Verificar que los formatos de request body coincidan con la documentación en `datos_prueba/datosDePrueba.txt`
- Verificar que el manejo de respuestas de error sea correcto (error, details, status codes)

### 5. Verificar Autenticación Real

**Archivos:** `js/auth.js`, `login.html`, `verify.html`

- Confirmar que `sendOtp()` llame a `POST /auth/request-otp` con formato form-data (contentType: 'form')
- Confirmar que `verifyOtp()` llame a `POST /auth/verify-otp` con formato form-data
- Verificar que los tokens se guarden correctamente en localStorage (`accesstoken`, `refreshToken`, `id`)
- Verificar que el header `Authorization: Bearer {token}` se incluya en todas las llamadas autenticadas

**Ubicaciones:**

- `sendOtp()`: Líneas 1-16 en `js/auth.js`
- `verifyOtp()`: Líneas 18-46 en `js/auth.js`
- Header Authorization: Línea 70 en `js/api.js`

### 6. Agregar Validación de Entorno en Dashboard

**Archivo:** `js/dashboard.js`

- Agregar verificación al inicio para confirmar que el modo de pruebas esté desactivado en producción
- Opcional: Agregar mensaje informativo si el modo de pruebas está activo en producción
- Verificar que las llamadas a funciones de usuario (getUserByPhone, updateUser, etc.) no dependan del modo de pruebas

### 7. Manejo de Errores con APIs Reales

**Archivo:** `js/api.js`

- Verificar que los errores del backend se manejen correctamente:
- Errores con formato `{error: "mensaje"}`
- Errores con formato `{error: "mensaje", details: {...}}`
- Errores con formato `{message: "mensaje"}`
- Confirmar que los códigos de estado HTTP se propaguen correctamente (401, 404, 422, 409, etc.)
- Verificar que `error.details` se incluya cuando esté disponible

**Ubicación:** Líneas 92-104 en `js/api.js`

### 8. Documentar Configuración de Producción

**Archivo:** Crear o actualizar `README.md`

- Agregar sección sobre cómo desactivar el modo de pruebas
- Documentar la URL del backend para diferentes entornos
- Incluir instrucciones para verificar que las APIs reales funcionen
- Agregar troubleshooting para problemas comunes con APIs reales (CORS, autenticación, etc.)

### 9. Testing y Verificación

**Verificar:**

1. **Autenticación:**

- Login con número real debería enviar OTP real
- Verificación de OTP debería funcionar con código real del backend
- Token debería guardarse y usarse en llamadas posteriores

2. **Endpoints de Administración:**

- Buscar usuario debería funcionar con API real
- Actualizar usuario debería funcionar con API real
- Inactivar/Reactivar debería funcionar con API real
- Eliminar usuario debería funcionar con API real

3. **Errores:**

- Errores 401 deberían redirigir a login
- Errores 404 deberían mostrar mensaje apropiado
- Errores de validación (422) deberían mostrar detalles

### 10. Limpieza (Opcional)

**Si se desea eliminar referencias al modo de pruebas:**

- NO eliminar el sistema de pruebas, solo asegurarse de que esté desactivado por defecto
- El sistema de pruebas es útil para desarrollo y testing
- Si se requiere, agregar flag de entorno para habilitar/deshabilitar completamente

## Archivos a Modificar

1. `js/api.js` - Verificar URL del backend y manejo de errores
2. `js/testing.js` - Asegurar modo desactivado por defecto
3. `login.html` / `verify.html` - Verificar meta tag backend-url
4. `js/users.js` - Verificar endpoints (ya deberían estar correctos)
5. `js/auth.js` - Verificar autenticación (ya debería estar correcto)
6. `README.md` - Documentar configuración de producción

## Consideraciones Importantes

- El sistema ya está configurado para usar APIs reales cuando el modo de pruebas está desactivado
- Los endpoints ya coinciden con la documentación
- La principal tarea es verificar configuración y asegurar que el modo de pruebas esté desactivado por defecto
- No es necesario cambiar la lógica de las llamadas API si ya funcionan en modo de pruebas

### To-dos

- [ ] Verificar y actualizar configuración de URL del backend en js/api.js y meta tags
- [ ] Asegurar que el modo de pruebas esté desactivado por defecto en js/testing.js
- [ ] Verificar que la intercepción de pruebas solo funcione cuando está activada en js/api.js
- [ ] Verificar que los endpoints de administración en js/users.js coincidan con la documentación
- [ ] Verificar autenticación real (sendOtp, verifyOtp) en js/auth.js
- [ ] Verificar manejo de errores con APIs reales en js/api.js
- [ ] Documentar configuración de producción en README.md
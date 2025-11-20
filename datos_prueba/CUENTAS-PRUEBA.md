# Cuentas de Prueba para Administradores

## 🔐 Cuenta de Administrador de Prueba

Para usar en modo de pruebas, utiliza las siguientes credenciales:

### Credenciales

- **Teléfono:** `+573001234567`
- **Código OTP:** `123456`
- **Rol:** Administrador
- **Nombre:** Admin de Prueba
- **Email:** admin@test.beecy.app

## 🚀 Cómo Iniciar Sesión en Modo de Pruebas

### Opción 1: Login Manual con OTP Fijo

1. Activa el modo de pruebas (botón 🧪 en el dashboard si ya estás logueado, o ve a login.html)
2. En la página de login, ingresa el teléfono: `+573001234567`
3. Haz clic en "Continuar"
4. En la página de verificación, ingresa el código OTP: `123456`
5. ¡Listo! Serás redirigido al dashboard como administrador

### Opción 2: Login Directo (Modo de Pruebas)

Si el modo de pruebas está activo, el sistema automáticamente aceptará:

- Cualquier número de teléfono que termine en `...4567`
- El código OTP: `123456`

## 📝 Notas Importantes

- **Solo funciona en modo de pruebas:** Estas credenciales solo funcionan cuando el modo de pruebas está activo
- **No requiere OTP real:** No se envía ningún SMS, el código `123456` siempre funciona en modo de pruebas
- **Token simulado:** El token de autenticación es simulado y no tiene validez en el backend real

## 🔧 Activar Modo de Pruebas

### Opción 1: Desde la página de Login (Recomendado)

1. Abre `login.html` en el navegador
2. En la parte inferior del formulario, haz clic en el botón **"🧪 Activar Modo de Pruebas"**
3. Verás un banner amarillo con las credenciales de prueba
4. Ingresa el teléfono: `+573001234567`
5. Haz clic en "Continuar"
6. En la página de verificación, ingresa el OTP: `123456`
7. ¡Listo! Serás redirigido al dashboard

### Opción 2: Si ya estás logueado

1. Haz clic en el botón 🧪 (ciencia) en la barra superior del dashboard
2. Verás el indicador "🧪 MODO DE PRUEBAS ACTIVO"

## 📱 Otros Números de Prueba

También puedes usar estos números de teléfono en modo de pruebas:

- `+573001234567` - Admin principal (recomendado)
- `+573009876543` - Usuario regular
- `+573004567890` - Usuario inactivo

**Todos aceptan el código OTP:** `123456`

## ⚠️ Advertencia

Estas credenciales **NO** funcionan en producción ni cuando el modo de pruebas está desactivado. Son únicamente para desarrollo y pruebas locales.

## 🔄 Desactivar Modo de Pruebas

Para volver al modo normal:

1. Haz clic nuevamente en el botón 🧪
2. O ejecuta en consola: `localStorage.setItem('test_mode', 'false')`
3. Recarga la página

---

**¡Listo para probar!** 🎉

# Beecy Admin - Panel de Moderación Web

Panel de moderación web para la plataforma Beecy. Permite a los administradores gestionar y moderar posts mediante un sistema de autenticación OTP.

## 🚀 Características

- **Autenticación OTP**: Login seguro mediante código OTP enviado por SMS
- **Moderación de Posts**: Aprobar o rechazar posts pendientes de moderación
- **Interfaz Moderna**: Diseño limpio, responsive y fácil de usar
- **Gestión de Imágenes**: Visualización de imágenes de los posts
- **Información de Usuario**: Detalles del autor de cada post

## 📁 Estructura del Proyecto

```
beecy-admin-web/
├── index.html          # Página principal (lista de posts)
├── login.html          # Página de login OTP
├── verify.html         # Página de verificación OTP
├── js/
│   ├── auth.js         # Funciones de autenticación OTP
│   ├── api.js          # Cliente API para comunicarse con backend
│   ├── posts.js        # Funciones para obtener y moderar posts
│   └── utils.js        # Utilidades (localStorage, helpers)
├── css/
│   └── styles.css      # Estilos de la aplicación
├── vercel.json         # Configuración de Vercel
└── README.md           # Documentación del proyecto
```

## 🛠️ Tecnologías Utilizadas

- HTML5
- CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript (ES6+)
- Fetch API
- LocalStorage API

## 📋 Requisitos Previos

- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Acceso a internet para comunicarse con el backend
- Número de teléfono válido para recibir códigos OTP

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza la siguiente variable de entorno:

- `BASE_URL`: URL base del backend (por defecto: `http://15.235.44.199/`)

Para configurar en Vercel:

1. Ve a la configuración del proyecto en Vercel
2. Agrega la variable de entorno `BASE_URL` con la URL de tu backend
3. O modifica directamente en `js/api.js` si es necesario

### Configuración Local

1. Clona o descarga el repositorio
2. Abre `index.html` en un navegador o usa un servidor local:

   ```bash
   # Con Python
   python -m http.server 8000

   # Con Node.js (http-server)
   npx http-server
   ```

3. Asegúrate de que la variable `BASE_URL` en `js/api.js` apunte a tu backend

## 🔌 Endpoints del Backend

### Autenticación

#### POST /auth/request-otp

Envia un código OTP al número de teléfono.

**Body:**

```json
{
  "phone": "+573001234567"
}
```

**Response:**

```json
{
  "message": "Código enviado"
}
```

#### POST /auth/verify-otp

Verifica el código OTP y retorna los tokens de autenticación.

**Body:**

```json
{
  "phone": "+573001234567",
  "otp": "123456"
}
```

**Response:**

```json
{
  "accesstoken": "token_de_acceso",
  "refreshToken": "token_de_refresh",
  "id": "user_id",
  "registerStatus": "status"
}
```

### Posts

#### POST /feed/get-home

Obtiene la lista de posts (requiere autenticación).

**Headers:**

```
Authorization: Bearer {token}
```

**Body:**

```json
{
  "lat": "string",
  "lon": "string",
  "area": 0
}
```

**Response:**

```json
[
  {
    "id": "post_id",
    "content": "Contenido del post",
    "images": ["url1", "url2"],
    "userId": "user_id",
    "user": {
      "id": "user_id",
      "name": "Nombre del usuario"
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### Moderación (Pendiente)

Los siguientes endpoints aún no están definidos por el backend:

#### POST /admin/posts/{id}/approve

Aprueba un post (pendiente de implementación).

#### POST /admin/posts/{id}/reject

Rechaza un post (pendiente de implementación).

**Nota:** Estos endpoints están implementados en el código con manejo de errores apropiado. Cuando el backend los implemente, funcionarán automáticamente.

## 🚀 Despliegue en Vercel

1. **Instalar Vercel CLI** (opcional):

   ```bash
   npm i -g vercel
   ```

2. **Desplegar**:

   ```bash
   vercel
   ```

3. **Configurar variables de entorno**:

   - Ve a la configuración del proyecto en Vercel
   - Agrega la variable `BASE_URL` con la URL de tu backend

4. **Configurar dominio** (opcional):
   - Ve a la configuración de dominios en Vercel
   - Agrega tu dominio personalizado

## 📱 Flujo de Usuario

1. El usuario accede a `login.html`
2. Ingresa su número de teléfono en formato internacional
3. Se envía un código OTP al backend
4. El usuario es redirigido a `verify.html` con el número de teléfono
5. El usuario ingresa el código OTP de 6 dígitos
6. Se verifica el código y se guarda el token en localStorage
7. El usuario es redirigido a `index.html` (panel principal)
8. Se cargan los posts desde el backend
9. El usuario puede aprobar o rechazar posts
10. Al hacer logout, se limpia el token y redirige a login

## 🔒 Seguridad

- Tokens de autenticación almacenados en localStorage
- Validación de formato de teléfono y OTP
- Protección contra XSS (escape de HTML)
- Headers de seguridad configurados en Vercel
- Validación de autenticación en páginas protegidas

## 🐛 Solución de Problemas

### Error de CORS

Si experimentas errores de CORS, asegúrate de que:

- El backend tenga configurado CORS correctamente
- O configura un proxy en Vercel

### Error de conexión

- Verifica que la URL del backend sea correcta
- Verifica tu conexión a internet
- Verifica que el backend esté disponible

### Error de autenticación

- Verifica que el token se esté guardando correctamente en localStorage
- Verifica que el formato del token sea correcto
- Intenta cerrar sesión y volver a iniciar sesión

## 📝 Notas Importantes

- Los endpoints de moderación (approve/reject) aún no están implementados en el backend
- El código incluye manejo de errores apropiado para cuando estos endpoints estén disponibles
- Si los endpoints tienen rutas diferentes, se pueden ajustar fácilmente en `js/posts.js`

## 🤝 Contribuciones

Este es un proyecto privado. Para sugerencias o reportes de errores, contacta al equipo de desarrollo.

## 📄 Licencia

Este proyecto es privado y propiedad de Beecy.

## 👨‍💻 Desarrollo

Para desarrollo local:

1. Clona el repositorio
2. Abre el proyecto en tu editor de código
3. Usa un servidor local para probar
4. Modifica los archivos según sea necesario
5. Prueba en diferentes navegadores y dispositivos

## 📞 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Beecy.

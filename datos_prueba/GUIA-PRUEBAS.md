# Guía de Uso del Sistema de Pruebas - Dashboard de Administración

## 📋 Descripción

Este sistema permite probar el dashboard de administración de usuarios sin necesidad de conectarse al backend real. Utiliza archivos JSON de prueba para simular las respuestas de la API.

## 🚀 Cómo Activar el Modo de Pruebas

1. Abre el dashboard (`index.html`)
2. Haz clic en el botón de **ciencia** (🧪) en la barra superior
3. Verás un indicador amarillo en la esquina superior derecha que dice "🧪 MODO DE PRUEBAS ACTIVO"
4. El botón cambiará de color para indicar que está activo

## ✨ Funcionalidades Disponibles

### 1. Buscar Usuario por Teléfono

- Selecciona un país del dropdown
- Ingresa el número de teléfono (con o sin prefijo)
- Presiona Enter o busca manualmente
- En modo de pruebas, devolverá el usuario de ejemplo del JSON

**Archivo de prueba:** `datos_prueba/responses/buscar-usuario-exito.json`

### 2. Editar Usuario

- Busca un usuario primero
- Haz clic en el botón "Editar" en la tabla
- Se abrirá un modal con todos los campos editables:
  - Nombre
  - Email
  - Edad
  - Género
  - Biografía
  - Fecha de Nacimiento
  - URL de Imagen
  - Estado de Verificación
- Completa los campos y haz clic en "Actualizar"

**Archivo de prueba:** `datos_prueba/responses/actualizar-usuario-exito.json`

### 3. Inactivar Usuario

- Busca un usuario activo
- Haz clic en el botón "Inactivar"
- Ingresa una razón (opcional) y notas (opcional)
- El usuario cambiará su estado a inactivo

**Archivo de prueba:** `datos_prueba/responses/inactivar-usuario-exito.json`

### 4. Reactivar Usuario

- Busca un usuario inactivo
- Haz clic en el botón "Reactivar"
- Ingresa notas sobre la reactivación (opcional)
- El usuario cambiará su estado a activo

**Archivo de prueba:** `datos_prueba/responses/reactivar-usuario-exito.json`

### 5. Eliminar Usuario

- Busca un usuario
- Haz clic en el botón "Eliminar" (rojo)
- Ingresa una razón obligatoria
- Confirma la eliminación
- El usuario será eliminado permanentemente

**Archivo de prueba:** `datos_prueba/responses/eliminar-usuario-exito.json`

## 📁 Estructura de Archivos de Prueba

```
datos_prueba/
├── requests/          # Bodies de peticiones HTTP
├── responses/         # Respuestas de la API
├── escenarios/        # Flujos completos
├── headers/           # Headers HTTP
└── usuarios-ejemplo/  # Datos de usuarios
```

## 🔧 Personalizar Respuestas de Prueba

Puedes modificar los archivos JSON en `datos_prueba/responses/` para cambiar las respuestas simuladas:

1. Edita el archivo JSON correspondiente
2. Recarga la página
3. El modo de pruebas usará los nuevos datos

## 📝 Ejemplos de Uso

### Ejemplo 1: Buscar y Editar Usuario

1. Activa el modo de pruebas
2. Busca el usuario con teléfono `+573001234567`
3. Haz clic en "Editar"
4. Modifica el nombre y email
5. Haz clic en "Actualizar"
6. Verás el mensaje de éxito

### Ejemplo 2: Inactivar y Reactivar

1. Busca un usuario activo
2. Haz clic en "Inactivar"
3. Ingresa razón: "Prueba de sistema"
4. El usuario se inactivará
5. Haz clic en "Reactivar"
6. El usuario volverá a estar activo

### Ejemplo 3: Eliminar Usuario

1. Busca un usuario
2. Haz clic en "Eliminar"
3. Ingresa razón: "Prueba de eliminación"
4. Confirma la acción
5. El usuario será eliminado

## ⚠️ Notas Importantes

- El modo de pruebas **NO** hace llamadas reales al backend
- Todos los datos son simulados desde archivos JSON
- Los cambios no se guardan realmente
- Para probar con el backend real, desactiva el modo de pruebas

## 🐛 Solución de Problemas

### El modo de pruebas no funciona

1. Verifica que los archivos JSON estén en la carpeta correcta
2. Abre la consola del navegador (F12) para ver errores
3. Asegúrate de que el botón esté activado (debe verse amarillo)

### No se cargan los datos de prueba

1. Verifica la ruta de los archivos JSON
2. Asegúrate de que los archivos existan
3. Revisa la consola del navegador para errores de carga

### El modal no se abre

1. Verifica que hayas buscado un usuario primero
2. Asegúrate de que el usuario esté seleccionado
3. Revisa la consola para errores de JavaScript

## 📚 Archivos Relacionados

- `js/testing.js` - Lógica del sistema de pruebas
- `js/api.js` - Interceptación de llamadas API
- `js/users.js` - Funciones de gestión de usuarios
- `js/dashboard.js` - Lógica del dashboard

## 🎯 Próximos Pasos

Para agregar más escenarios de prueba:

1. Crea nuevos archivos JSON en `datos_prueba/responses/`
2. Regístralos en `js/testing.js` en la función `loadAllTestData()`
3. Recarga la página y prueba

---

**¡Listo para probar!** 🎉

# Archivos JSON de Prueba - Panel de Administración de Usuarios

Esta carpeta contiene archivos JSON de prueba organizados por categoría para facilitar las pruebas de la API de administración de usuarios.

## Estructura de Carpetas

```
datos_prueba/
├── requests/          # Bodies de peticiones HTTP
├── responses/         # Respuestas de la API (éxito y errores)
├── escenarios/        # Flujos completos de operaciones
├── headers/           # Headers HTTP de ejemplo
└── usuarios-ejemplo/  # Datos de usuarios de ejemplo
```

## Requests (Peticiones)

### Buscar Usuario

- `buscar-usuario-por-telefono.json` - Request para buscar usuario por teléfono

### Actualizar Usuario

- `actualizar-usuario-completo.json` - Actualización con todos los campos
- `actualizar-usuario-parcial.json` - Actualización parcial (solo algunos campos)

### Inactivar Usuario

- `inactivar-usuario.json` - Inactivación básica
- `inactivar-usuario-violacion.json` - Inactivación por violación de términos
- `inactivar-usuario-temporal.json` - Inactivación temporal con fecha de reactivación

### Reactivar Usuario

- `reactivar-usuario.json` - Reactivación básica
- `reactivar-usuario-problema-resuelto.json` - Reactivación después de resolver problema

### Eliminar Usuario

- `eliminar-usuario.json` - Eliminación con datos relacionados
- `eliminar-usuario-sin-datos-relacionados.json` - Eliminación sin borrar datos relacionados

## Responses (Respuestas)

### Buscar Usuario

- `buscar-usuario-exito.json` - Respuesta exitosa (200)
- `buscar-usuario-no-encontrado-404.json` - Usuario no encontrado (404)
- `buscar-usuario-no-autorizado-401.json` - Sin autorización (401)
- `buscar-usuario-datos-invalidos-400.json` - Datos inválidos (400)

### Actualizar Usuario

- `actualizar-usuario-exito.json` - Actualización exitosa (200)
- `actualizar-usuario-no-encontrado-404.json` - Usuario no encontrado (404)
- `actualizar-usuario-datos-invalidos-422.json` - Datos inválidos (422)

### Inactivar Usuario

- `inactivar-usuario-exito.json` - Inactivación exitosa (200)
- `inactivar-usuario-ya-inactivo-400.json` - Usuario ya inactivo (400)

### Reactivar Usuario

- `reactivar-usuario-exito.json` - Reactivación exitosa (200)
- `reactivar-usuario-ya-activo-400.json` - Usuario ya activo (400)

### Eliminar Usuario

- `eliminar-usuario-exito.json` - Eliminación exitosa (200)
- `eliminar-usuario-sin-confirmacion-400.json` - Falta confirmación (400)
- `eliminar-usuario-conflicto-409.json` - Conflicto con datos asociados (409)

## Escenarios Completos

### Escenario 1: Buscar y Actualizar Usuario

`escenario-1-buscar-y-actualizar.json`

- Busca un usuario por teléfono
- Actualiza sus datos

### Escenario 2: Inactivar y Reactivar Usuario

`escenario-2-inactivar-y-reactivar.json`

- Busca un usuario
- Lo inactiva
- Lo reactiva

### Escenario 3: Eliminar Usuario

`escenario-3-eliminar-usuario.json`

- Busca un usuario
- Lo elimina permanentemente

## Headers

- `headers-autenticacion.json` - Headers requeridos para autenticación

## Usuarios de Ejemplo

- `usuario-completo.json` - Usuario activo y verificado completo
- `usuario-inactivo.json` - Usuario inactivo con datos de desactivación
- `usuario-no-verificado.json` - Usuario activo pero no verificado

## Uso

Estos archivos pueden ser utilizados para:

- Pruebas manuales en Postman/Insomnia
- Pruebas automatizadas
- Documentación de ejemplos
- Desarrollo frontend (mocks)

## Notas

- Todos los IDs, teléfonos y emails son ejemplos
- Las fechas están en formato ISO 8601
- Los tokens de autenticación deben ser reemplazados por tokens reales
- Los números de teléfono siguen el formato internacional (+57 para Colombia)

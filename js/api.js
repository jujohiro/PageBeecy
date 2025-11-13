let BASE_URL;

try {
    if (typeof window !== 'undefined' && window.location) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        
        // Si es HTTPS (producción en Vercel), SIEMPRE usar proxy /api
        if (protocol === 'https:') {
            BASE_URL = '/api/';
            console.log('[API] ✅ Modo producción (HTTPS) - usando proxy /api/');
        } 
        // Desarrollo local: usar backend directo (solo en localhost)
        else if (hostname === 'localhost' || hostname === '127.0.0.1') {
            BASE_URL = 'http://15.235.44.199/';
            console.log('[API] 🔧 Modo desarrollo (localhost) - usando backend directo:', BASE_URL);
        }
        // Cualquier otro caso (producción HTTP, etc.): usar proxy por seguridad
        else {
            BASE_URL = '/api/';
            console.log('[API] ✅ Modo producción (hostname:', hostname, ') - usando proxy /api/');
        }
    } else {
        // Fallback: si no se puede detectar, usar proxy por seguridad
        BASE_URL = '/api/';
        console.log('[API] ⚠️ No se pudo detectar el entorno - usando proxy /api/ por defecto');
    }
} catch (error) {
    // Si hay algún error, usar proxy por seguridad
    BASE_URL = '/api/';
    console.error('[API] Error al detectar entorno:', error, '- usando proxy /api/ por defecto');
}
BASE_URL = BASE_URL.replace(/\/+$/, '') + '/';

/**
 * Realiza una petición HTTP al backend
 * @param {string} endpoint - Endpoint de la API (ej: '/auth/verify-otp')
 * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
 * @param {Object|null} data - Datos a enviar en el body (null para GET)
 * @param {boolean} requiresAuth - Si requiere autenticación (default: false)
 * @param {string} contentType - Tipo de contenido: 'json' o 'form' (default: 'json')
 * @returns {Promise<Object>} Respuesta de la API
 */
async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false, contentType = 'json') {
    try {
        // Construir la URL completa
        let url;
        if (endpoint.startsWith('http')) {
            url = endpoint;
        } else {
            // Asegurar que BASE_URL termine con / y endpoint no empiece con /
            const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
            url = `${BASE_URL}${cleanEndpoint}`;
        }
        
        // Configurar headers según el tipo de contenido
        const headers = {};
        
        // Determinar Content-Type y formatear body
        let body = null;
        if (data && method.toUpperCase() !== 'GET') {
            if (contentType === 'form') {
                // Usar application/x-www-form-urlencoded
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                // Convertir objeto a formato form-urlencoded
                const formData = new URLSearchParams();
                // Usar Object.entries para mayor compatibilidad
                if (Object.entries && typeof data === 'object' && data !== null) {
                    for (const [key, value] of Object.entries(data)) {
                        if (value !== undefined && value !== null) {
                            formData.append(key, String(value));
                        }
                    }
                } else if (typeof data === 'object' && data !== null) {
                    // Fallback: usar Object.keys
                    const keys = Object.keys(data);
                    for (const key of keys) {
                        const value = data[key];
                        if (value !== undefined && value !== null) {
                            formData.append(key, String(value));
                        }
                    }
                }
                body = formData.toString();
            } else {
                // Usar application/json (por defecto)
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(data);
            }
        }
        
        // Añadir token de autenticación si es necesario
        if (requiresAuth) {
            const token = getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Configurar opciones de la petición
        const options = {
            method: method.toUpperCase(),
            headers: headers,
        };
        
        // Añadir body si existe
        if (body) {
            options.body = body;
        }
        
        // Log de la petición
        console.log(`[API] ${method.toUpperCase()} ${url}`, {
            contentType: contentType === 'form' ? 'application/x-www-form-urlencoded' : 'application/json',
            body: data || 'N/A',
            requiresAuth: requiresAuth,
            baseUrl: BASE_URL,
            isProduction: window.location?.protocol === 'https:',
            hostname: window.location?.hostname
        });
        
        // Realizar la petición
        let response;
        try {
            response = await fetch(url, options);
        } catch (fetchError) {
            // Error antes de recibir respuesta (CORS, red, etc.)
            console.error('[API] Error en fetch:', fetchError);
            
            // Detectar errores de CORS específicamente
            if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
                // Esto generalmente es CORS o el backend no está disponible
                const corsError = new Error('Error de CORS o conexión: El backend no permite solicitudes desde http://localhost:8000. Verifica: 1) Que el backend esté disponible, 2) Que CORS esté configurado para permitir localhost, 3) O despliega en Vercel.');
                corsError.name = 'CORSError';
                throw corsError;
            }
            
            throw new Error(`Error de conexión: ${fetchError.message}. Verifica tu conexión a internet y que el backend esté disponible.`);
        }
        
        // Leer la respuesta
        let responseData;
        try {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
        } catch (parseError) {
            console.error('[API] Error al parsear respuesta:', parseError);
            throw new Error('Error al procesar la respuesta del servidor.');
        }
        
        // Log de la respuesta
        console.log(`[API] Respuesta ${response.status}:`, responseData);
        
        // Manejar errores HTTP
        if (!response.ok) {
            let errorMessage = `Error ${response.status}: ${response.statusText}`;
            
            // Intentar extraer mensaje de error del cuerpo de la respuesta
            if (typeof responseData === 'object' && responseData !== null) {
                errorMessage = responseData.message || responseData.error || responseData.msg || errorMessage;
            } else if (typeof responseData === 'string' && responseData) {
                errorMessage = responseData;
            }
            
            // Si es un error 401, puede ser problema de autenticación
            if (response.status === 401) {
                errorMessage = 'No autorizado. Verifica tus credenciales.';
            }
            
            // Si es un error 403, puede ser problema de permisos o CORS
            if (response.status === 403) {
                errorMessage = 'Acceso denegado. Puede ser un problema de CORS o permisos.';
            }
            
            // Si es un error 404, puede ser que el endpoint no existe o que el backend no maneje OPTIONS (CORS)
            if (response.status === 404) {
                // Verificar si es una petición OPTIONS (preflight de CORS)
                if (method.toUpperCase() === 'OPTIONS' || response.headers.get('access-control-allow-origin') === null) {
                    errorMessage = 'Error de CORS: El backend no está configurado para manejar peticiones OPTIONS (preflight). El backend necesita configurar CORS para permitir solicitudes desde http://localhost:8000. Solución: Despliega la aplicación en Vercel o configura CORS en el backend.';
                } else {
                    errorMessage = 'Endpoint no encontrado. Verifica que la URL del backend sea correcta.';
                }
            }
            
            // Si es un error 500, es un error del servidor
            if (response.status >= 500) {
                errorMessage = 'Error del servidor. Intenta más tarde.';
            }
            
            const httpError = new Error(errorMessage);
            httpError.status = response.status;
            throw httpError;
        }
        
        return responseData;
        
    } catch (error) {
        // Si ya tiene un mensaje personalizado, usarlo
        if (error.message && !error.message.includes('TypeError')) {
            throw error;
        }
        
        // Manejar errores de CORS específicamente
        if (error.name === 'CORSError') {
            throw error;
        }
        
        // Manejar errores de red
        if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
            throw new Error('Error de conexión o CORS. El backend no permite solicitudes desde http://localhost:8000. Verifica que CORS esté configurado en el backend o despliega en Vercel.');
        }
        
        // Re-lanzar errores conocidos
        throw error;
    }
}

/**
 * Realiza una petición GET
 * @param {string} endpoint - Endpoint de la API
 * @param {boolean} requiresAuth - Si requiere autenticación
 * @returns {Promise<Object>} Respuesta de la API
 */
async function apiGet(endpoint, requiresAuth = false) {
    return apiRequest(endpoint, 'GET', null, requiresAuth);
}

/**
 * Realiza una petición POST
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @param {boolean} requiresAuth - Si requiere autenticación
 * @param {string} contentType - Tipo de contenido: 'json' o 'form' (default: 'json')
 * @returns {Promise<Object>} Respuesta de la API
 */
async function apiPost(endpoint, data, requiresAuth = false, contentType = 'json') {
    return apiRequest(endpoint, 'POST', data, requiresAuth, contentType);
}

/**
 * Realiza una petición PUT
 * @param {string} endpoint - Endpoint de la API
 * @param {Object} data - Datos a enviar
 * @param {boolean} requiresAuth - Si requiere autenticación
 * @returns {Promise<Object>} Respuesta de la API
 */
async function apiPut(endpoint, data, requiresAuth = false) {
    return apiRequest(endpoint, 'PUT', data, requiresAuth);
}

/**
 * Realiza una petición DELETE
 * @param {string} endpoint - Endpoint de la API
 * @param {boolean} requiresAuth - Si requiere autenticación
 * @returns {Promise<Object>} Respuesta de la API
 */
async function apiDelete(endpoint, requiresAuth = false) {
    return apiRequest(endpoint, 'DELETE', null, requiresAuth);
}


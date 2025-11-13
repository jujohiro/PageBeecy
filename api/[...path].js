/**
 * Proxy catch-all para todas las rutas de API
 * Reenvía peticiones al backend para evitar Mixed Content
 * 
 * Rutas soportadas:
 * - /api/auth/request-otp -> http://15.235.44.199/auth/request-otp
 * - /api/auth/verify-otp -> http://15.235.44.199/auth/verify-otp
 * - /api/feed/get-home -> http://15.235.44.199/feed/get-home
 */

export default async function handler(req, res) {
    // Log inicial para debugging
    console.log('[Proxy] === INICIO DE PETICIÓN ===');
    console.log('[Proxy] Method:', req.method);
    console.log('[Proxy] URL:', req.url);
    console.log('[Proxy] Headers:', req.headers);
    console.log('[Proxy] Query:', req.query);
    console.log('[Proxy] Body type:', typeof req.body);
    
    try {
        // Manejar peticiones OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            console.log('[Proxy] Respondiendo a OPTIONS (preflight)');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Max-Age', '86400');
            return res.status(200).end();
        }
        
        // Obtener la ruta desde req.query.path o desde req.url
        // En Vercel, las rutas catch-all como [...path] vienen en req.query.path como array
        let path = '';
        
        // Primero intentar desde req.query.path (método estándar de Vercel)
        if (req.query && req.query.path) {
            console.log('[Proxy] Path encontrado en req.query.path:', req.query.path);
            // Si path viene en query, puede ser array o string
            if (Array.isArray(req.query.path)) {
                path = req.query.path.join('/');
            } else {
                path = req.query.path;
            }
        } 
        // Si no está en query, extraer desde la URL
        else if (req.url) {
            console.log('[Proxy] Path no encontrado en req.query.path, extrayendo desde req.url:', req.url);
            try {
                // Crear URL object para parsear
                const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                const urlPath = urlObj.pathname;
                console.log('[Proxy] Pathname extraído:', urlPath);
                
                // Remover /api/ del inicio
                const match = urlPath.match(/^\/api\/(.*)$/);
                if (match && match[1]) {
                    path = match[1];
                    console.log('[Proxy] Path extraído desde URL:', path);
                } else {
                    // Si no empieza con /api/, intentar sin el primer /
                    path = urlPath.replace(/^\//, '');
                    console.log('[Proxy] Path extraído (sin /api/):', path);
                }
            } catch (urlError) {
                console.error('[Proxy] Error al parsear URL:', urlError);
                // Fallback: intentar extraer manualmente
                const match = req.url.match(/\/api\/(.+)/);
                if (match && match[1]) {
                    path = match[1].split('?')[0]; // Remover query string si existe
                    console.log('[Proxy] Path extraído manualmente:', path);
                }
            }
        }
        
        // Si no hay path, retornar error
        if (!path) {
            console.error('[Proxy] ❌ No se pudo determinar la ruta');
            console.error('[Proxy] req.url:', req.url);
            console.error('[Proxy] req.query:', req.query);
            console.error('[Proxy] req.headers.host:', req.headers.host);
            
            return res.status(400).json({
                error: 'Ruta no válida',
                message: 'No se pudo determinar la ruta desde la petición',
                url: req.url,
                query: req.query,
                host: req.headers.host
            });
        }
        
        console.log('[Proxy] ✅ Path determinado:', path);
        
        // Construir URL del backend
        const backendUrl = `http://15.235.44.199/${path}`;
        
        console.log('[Proxy] Petición recibida:', {
            method: req.method,
            path: path,
            url: req.url,
            backendUrl: backendUrl,
            contentType: req.headers['content-type'],
            query: req.query
        });
        
        // Preparar headers para el backend
        const headers = {};
        
        // Copiar Content-Type si existe
        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        
        // Copiar Authorization si existe
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        // Preparar body
        let body = null;
        const contentType = req.headers['content-type'] || '';
        const isFormUrlEncoded = contentType.includes('application/x-www-form-urlencoded');
        const isJson = contentType.includes('application/json');
        
        // Log para debugging
        console.log('[Proxy] Body info:', {
            bodyType: typeof req.body,
            bodyValue: req.body,
            contentType: contentType,
            isFormUrlEncoded: isFormUrlEncoded,
            isJson: isJson,
            method: req.method
        });
        
        // Solo procesar body para métodos que lo requieren
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
            try {
                // Si req.body es undefined o null, no hay body
                if (req.body === undefined || req.body === null) {
                    body = null;
                    console.log('[Proxy] Body es undefined o null');
                }
                // Si es string (ya viene como form-urlencoded o texto)
                else if (typeof req.body === 'string') {
                    body = req.body;
                    console.log('[Proxy] Body es string:', body);
                }
                // Si es Buffer
                else if (Buffer.isBuffer && Buffer.isBuffer(req.body)) {
                    body = req.body.toString('utf-8');
                    console.log('[Proxy] Body es Buffer, convertido a string:', body);
                }
                // Si es objeto
                else if (typeof req.body === 'object') {
                    // Verificar si es un objeto simple (no array, no Date, etc.)
                    const isPlainObject = req.body.constructor === Object || 
                                         Object.getPrototypeOf(req.body) === Object.prototype || 
                                         Object.getPrototypeOf(req.body) === null;
                    
                    if (isPlainObject) {
                        // Si es application/x-www-form-urlencoded, convertir a form-urlencoded
                        if (isFormUrlEncoded) {
                            try {
                                const formData = new URLSearchParams();
                                // Usar Object.entries para iterar sobre las propiedades
                                const entries = Object.entries(req.body);
                                for (const [key, value] of entries) {
                                    if (value !== undefined && value !== null) {
                                        formData.append(key, String(value));
                                    }
                                }
                                body = formData.toString();
                                console.log('[Proxy] Body objeto convertido a form-urlencoded:', body);
                            } catch (parseError) {
                                console.error('[Proxy] Error convirtiendo objeto a form-urlencoded:', parseError);
                                console.error('[Proxy] req.body:', req.body);
                                // Fallback: intentar convertir manualmente
                                try {
                                    const pairs = [];
                                    for (const [key, value] of Object.entries(req.body)) {
                                        if (value !== undefined && value !== null) {
                                            pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                                        }
                                    }
                                    body = pairs.join('&');
                                    console.log('[Proxy] Body objeto convertido a form-urlencoded (fallback):', body);
                                } catch (fallbackError) {
                                    console.error('[Proxy] Error en fallback:', fallbackError);
                                    body = JSON.stringify(req.body);
                                    headers['Content-Type'] = 'application/json';
                                }
                            }
                        }
                        // Si es application/json, convertir a JSON
                        else if (isJson) {
                            body = JSON.stringify(req.body);
                            console.log('[Proxy] Body objeto convertido a JSON:', body);
                        }
                        // Si no tiene Content-Type específico, asumir JSON
                        else {
                            body = JSON.stringify(req.body);
                            headers['Content-Type'] = 'application/json';
                            console.log('[Proxy] Body objeto convertido a JSON (sin Content-Type):', body);
                        }
                    } else {
                        // No es un objeto simple, convertir a string
                        body = String(req.body);
                        console.log('[Proxy] Body objeto complejo, convertido a string:', body);
                    }
                }
                // Otro tipo (number, boolean, etc.)
                else {
                    body = String(req.body);
                    console.log('[Proxy] Body otro tipo, convertido a string:', body);
                }
            } catch (bodyError) {
                console.error('[Proxy] Error procesando body:', bodyError);
                console.error('[Proxy] Error stack:', bodyError.stack);
                // Si hay error, retornar error
                return res.status(400).json({
                    error: 'Error procesando el body',
                    message: bodyError.message
                });
            }
        }
        
        // Preparar opciones para fetch
        const fetchOptions = {
            method: req.method,
            headers: headers
        };
        
        // Agregar body si existe
        if (body !== null) {
            fetchOptions.body = body;
        }
        
        console.log('[Proxy] Enviando al backend:', {
            url: backendUrl,
            method: req.method,
            headers: headers,
            bodyLength: body ? body.length : 0,
            bodyPreview: body ? (body.length > 100 ? body.substring(0, 100) + '...' : body) : null
        });
        
        // Realizar petición al backend
        const backendResponse = await fetch(backendUrl, fetchOptions);
        
        // Obtener respuesta
        const responseContentType = backendResponse.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await backendResponse.json();
        } else {
            responseData = await backendResponse.text();
        }
        
        console.log('[Proxy] Respuesta del backend:', {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            contentType: responseContentType,
            dataPreview: typeof responseData === 'object' ? JSON.stringify(responseData).substring(0, 200) : String(responseData).substring(0, 200)
        });
        
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Copiar headers de respuesta del backend (excepto CORS que ya configuramos)
        backendResponse.headers.forEach((value, key) => {
            // No copiar headers CORS ni de control
            if (!key.toLowerCase().startsWith('access-control-') && 
                key.toLowerCase() !== 'content-encoding' &&
                key.toLowerCase() !== 'transfer-encoding') {
                res.setHeader(key, value);
            }
        });
        
        // Retornar respuesta del backend con el mismo status code
        res.status(backendResponse.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        console.error('[Proxy] Error stack:', error.stack);
        console.error('[Proxy] Request details:', {
            method: req.method,
            url: req.url,
            headers: req.headers,
            body: req.body
        });
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}


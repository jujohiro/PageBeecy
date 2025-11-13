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
    try {
        // Manejar peticiones OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }
        
        // Obtener la ruta desde req.query.path
        // En Vercel, las rutas catch-all como [...path] vienen en req.query.path como array
        const pathArray = req.query.path || [];
        const path = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
        
        console.log('[Proxy] Petición recibida:', {
            method: req.method,
            path: path,
            url: req.url,
            query: req.query
        });
        
        // Construir URL del backend
        const backendUrl = `http://15.235.44.199/${path}`;
        console.log('[Proxy] URL del backend:', backendUrl);
        
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
        let body = '';
        
        try {
            // Log para debugging
            console.log('[Proxy] Raw req.body:', req.body);
            console.log('[Proxy] req.body type:', typeof req.body);
            console.log('[Proxy] Content-Type:', req.headers['content-type']);
            
            // Determinar cómo procesar el body según el Content-Type
            const contentType = req.headers['content-type'] || '';
            
            if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
                // Caso 1: Body es string (ya viene como form-urlencoded)
                if (typeof req.body === 'string') {
                    body = req.body;
                    console.log('[Proxy] Body es string:', body);
                }
                // Caso 2: Body es Buffer
                else if (Buffer.isBuffer && Buffer.isBuffer(req.body)) {
                    body = req.body.toString('utf-8');
                    console.log('[Proxy] Body es Buffer, convertido a string:', body);
                }
                // Caso 3: Body es objeto
                else if (req.body && typeof req.body === 'object') {
                    // Si es application/x-www-form-urlencoded, convertir a form-urlencoded
                    if (contentType.includes('application/x-www-form-urlencoded')) {
                        const formData = new URLSearchParams();
                        try {
                            // Usar Object.entries para mayor compatibilidad
                            const entries = Object.entries(req.body);
                            for (const [key, value] of entries) {
                                if (value !== undefined && value !== null) {
                                    formData.append(key, String(value));
                                }
                            }
                            body = formData.toString();
                            console.log('[Proxy] Body es objeto, convertido a form-urlencoded:', body);
                        } catch (parseError) {
                            console.error('[Proxy] Error parsing body as object:', parseError);
                            body = String(req.body);
                        }
                    }
                    // Si es application/json, convertir a JSON
                    else if (contentType.includes('application/json')) {
                        body = JSON.stringify(req.body);
                        console.log('[Proxy] Body es objeto, convertido a JSON:', body);
                    }
                    // Otro tipo de objeto, intentar convertir a string
                    else {
                        body = String(req.body);
                        console.log('[Proxy] Body es objeto, convertido a string:', body);
                    }
                }
                // Caso 4: Body es null o undefined
                else if (req.body === null || req.body === undefined) {
                    console.warn('[Proxy] Body es null o undefined');
                    body = '';
                }
                // Caso 5: Otro tipo (number, boolean, etc.)
                else {
                    body = String(req.body);
                    console.log('[Proxy] Body es otro tipo, convertido a string:', body);
                }
            }
        } catch (bodyError) {
            console.error('[Proxy] Error procesando body:', bodyError);
            console.error('[Proxy] Error stack:', bodyError.stack);
            // Si hay error, intentar convertir a string como último recurso
            try {
                body = String(req.body || '');
            } catch (stringError) {
                console.error('[Proxy] Error convirtiendo body a string:', stringError);
                body = '';
            }
        }
        
        // Preparar opciones para fetch
        const fetchOptions = {
            method: req.method,
            headers: headers
        };
        
        // Agregar body si existe y no es GET
        if (body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
            fetchOptions.body = body;
        }
        
        console.log('[Proxy] Enviando al backend:', {
            url: backendUrl,
            method: req.method,
            body: body,
            headers: headers
        });
        
        // Realizar petición al backend
        const response = await fetch(backendUrl, fetchOptions);
        
        // Obtener respuesta
        const responseContentType = response.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        console.log('[Proxy] Respuesta del backend:', {
            status: response.status,
            contentType: responseContentType,
            data: responseData
        });
        
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Retornar respuesta del backend con el mismo status code
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.setHeader('Content-Type', responseContentType || 'text/plain');
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        console.error('[Proxy] Error stack:', error.stack);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}


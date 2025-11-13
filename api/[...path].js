/**
 * Proxy serverless function para reenviar peticiones al backend
 * Soluciona el problema de Mixed Content (HTTPS -> HTTP)
 */

export default async function handler(req, res) {
    try {
        // Obtener la ruta desde req.url o req.query
        let pathString = '';
        
        // Intentar obtener desde req.query.path (rutas dinámicas de Vercel)
        if (req.query && req.query.path) {
            pathString = Array.isArray(req.query.path) 
                ? req.query.path.join('/') 
                : req.query.path;
        }
        
        // Si no está en query, extraer desde req.url
        if (!pathString && req.url) {
            const urlMatch = req.url.match(/^\/api\/(.+?)(?:\?|$)/);
            if (urlMatch) {
                pathString = urlMatch[1];
            }
        }
        
        console.log('[Proxy] Request:', {
            method: req.method,
            url: req.url,
            query: req.query,
            path: pathString,
            headers: req.headers
        });

        // Manejar peticiones OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }
        
        if (!pathString) {
            console.error('[Proxy] No se pudo determinar el path');
            return res.status(404).json({
                error: 'Path no encontrado',
                url: req.url,
                query: req.query
            });
        }
        
        // Construir la URL del backend
        const queryString = req.url && req.url.includes('?') 
            ? req.url.split('?')[1] 
            : '';
        const backendUrl = `http://15.235.44.199/${pathString}${queryString ? '?' + queryString : ''}`;
        
        console.log('[Proxy] Backend URL:', backendUrl);
        
        // Preparar headers para la petición al backend
        const headers = {};
        
        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        // Preparar las opciones para la petición al backend
        const fetchOptions = {
            method: req.method,
            headers: headers,
        };
        
        // Agregar el body si existe (para POST, PUT, etc.)
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
            const contentType = req.headers['content-type'] || '';
            
            if (contentType.includes('application/x-www-form-urlencoded')) {
                if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
                    const formData = new URLSearchParams();
                    for (const key in req.body) {
                        if (req.body.hasOwnProperty(key)) {
                            formData.append(key, String(req.body[key]));
                        }
                    }
                    fetchOptions.body = formData.toString();
                } else if (typeof req.body === 'string') {
                    fetchOptions.body = req.body;
                }
            } else if (contentType.includes('application/json')) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            } else if (req.body) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : String(req.body);
            }
        }
        
        console.log('[Proxy] Fetch options:', {
            method: fetchOptions.method,
            headers: fetchOptions.headers,
            hasBody: !!fetchOptions.body
        });
        
        // Realizar la petición al backend
        const backendResponse = await fetch(backendUrl, fetchOptions);
        
        // Obtener el contenido de la respuesta
        const responseContentType = backendResponse.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await backendResponse.json();
        } else {
            responseData = await backendResponse.text();
        }
        
        // Configurar headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Retornar la respuesta del backend con el mismo status code
        res.status(backendResponse.status);
        
        // Retornar JSON o texto según el tipo de contenido
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.setHeader('Content-Type', responseContentType || 'text/plain');
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            stack: error.stack
        });
    }
}

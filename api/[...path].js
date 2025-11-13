/**
 * Proxy serverless function para reenviar peticiones al backend
 * Soluciona el problema de Mixed Content (HTTPS -> HTTP)
 */

export default async function handler(req, res) {
    console.log('[Proxy] Petición recibida:', {
        method: req.method,
        url: req.url,
        path: req.query?.path,
        headers: req.headers,
        body: req.body
    });

    // Manejar peticiones OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
        console.log('[Proxy] Respondiendo a OPTIONS (preflight)');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }
    
    // Obtener la ruta del endpoint desde req.query.path
    // En Vercel, las rutas dinámicas como [...path] vienen en req.query.path como array
    const pathArray = req.query?.path || [];
    const pathString = Array.isArray(pathArray) ? pathArray.join('/') : (pathArray || '');
    
    console.log('[Proxy] Path procesado:', pathString);
    
    // Construir la URL del backend
    const backendUrl = `http://15.235.44.199/${pathString}`;
    console.log('[Proxy] URL del backend:', backendUrl);
    
    // Preparar headers para la petición al backend
    const headers = {};
    
    // Copiar Content-Type si existe
    if (req.headers['content-type']) {
        headers['Content-Type'] = req.headers['content-type'];
    }
    
    // Copiar el header de autorización si existe
    if (req.headers.authorization) {
        headers['Authorization'] = req.headers.authorization;
    }
    
    console.log('[Proxy] Headers para backend:', headers);
    
    // Preparar las opciones para la petición al backend
    const fetchOptions = {
        method: req.method,
        headers: headers,
    };
    
    // Agregar el body si existe (para POST, PUT, etc.)
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
        const contentType = req.headers['content-type'] || '';
        console.log('[Proxy] Content-Type:', contentType);
        console.log('[Proxy] Body recibido (tipo):', typeof req.body);
        console.log('[Proxy] Body recibido (valor):', req.body);
        
        if (contentType.includes('application/x-www-form-urlencoded')) {
            // Si es form-urlencoded, el body puede venir como string o objeto parseado
            if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
                // Convertir objeto a formato form-urlencoded
                const formData = new URLSearchParams();
                for (const key in req.body) {
                    if (req.body.hasOwnProperty(key) && key !== 'path') {
                        formData.append(key, String(req.body[key]));
                    }
                }
                fetchOptions.body = formData.toString();
                console.log('[Proxy] Body convertido (objeto -> form-urlencoded):', fetchOptions.body);
            } else if (typeof req.body === 'string') {
                // Si ya es string (form-urlencoded), usarlo directamente
                fetchOptions.body = req.body;
                console.log('[Proxy] Body usado directamente (string):', fetchOptions.body);
            } else if (req.body) {
                // Si hay body pero no es string ni objeto, convertirlo a string
                fetchOptions.body = String(req.body);
                console.log('[Proxy] Body convertido a string:', fetchOptions.body);
            }
        } else if (contentType.includes('application/json')) {
            // Si es JSON, enviarlo como JSON
            if (req.body) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
                console.log('[Proxy] Body JSON:', fetchOptions.body);
            }
        } else if (req.body) {
            // Otros tipos, enviar como string
            fetchOptions.body = typeof req.body === 'string' ? req.body : String(req.body);
            console.log('[Proxy] Body como string:', fetchOptions.body);
        }
    }
    
    try {
        console.log('[Proxy] Realizando petición al backend:', {
            url: backendUrl,
            method: fetchOptions.method,
            headers: fetchOptions.headers,
            body: fetchOptions.body
        });
        
        // Realizar la petición al backend
        const backendResponse = await fetch(backendUrl, fetchOptions);
        
        console.log('[Proxy] Respuesta del backend:', {
            status: backendResponse.status,
            statusText: backendResponse.statusText,
            headers: Object.fromEntries(backendResponse.headers.entries())
        });
        
        // Obtener el contenido de la respuesta
        const responseContentType = backendResponse.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await backendResponse.json();
        } else {
            responseData = await backendResponse.text();
        }
        
        console.log('[Proxy] Datos de respuesta:', responseData);
        
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
        
        console.log('[Proxy] Respuesta enviada al cliente');
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        console.error('[Proxy] URL intentada:', backendUrl);
        console.error('[Proxy] Method:', req.method);
        console.error('[Proxy] Path:', pathString);
        console.error('[Proxy] Body recibido:', req.body);
        console.error('[Proxy] Headers recibidos:', req.headers);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            url: backendUrl
        });
    }
}

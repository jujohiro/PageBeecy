/**
 * Proxy serverless function para reenviar peticiones al backend
 * Soluciona el problema de Mixed Content (HTTPS -> HTTP)
 */

export default async function handler(req, res) {
    // Manejar peticiones OPTIONS (preflight CORS)
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return res.status(200).end();
    }
    
    // Obtener la ruta del endpoint desde req.query.path
    // En Vercel, las rutas dinámicas como [...path] vienen en req.query.path como array
    const pathArray = req.query.path || [];
    const pathString = Array.isArray(pathArray) ? pathArray.join('/') : (pathArray || '');
    
    // Construir la URL del backend
    const backendUrl = `http://15.235.44.199/${pathString}`;
    
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
    
    // Preparar las opciones para la petición al backend
    const fetchOptions = {
        method: req.method,
        headers: headers,
    };
    
    // Agregar el body si existe (para POST, PUT, etc.)
    if ((req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
        const contentType = req.headers['content-type'] || '';
        
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
            } else if (typeof req.body === 'string') {
                // Si ya es string (form-urlencoded), usarlo directamente
                fetchOptions.body = req.body;
            } else if (req.body) {
                // Si hay body pero no es string ni objeto, convertirlo a string
                fetchOptions.body = String(req.body);
            }
        } else if (contentType.includes('application/json')) {
            // Si es JSON, enviarlo como JSON
            if (req.body) {
                fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
            }
        } else if (req.body) {
            // Otros tipos, enviar como string
            fetchOptions.body = typeof req.body === 'string' ? req.body : String(req.body);
        }
    }
    
    try {
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
        console.error('Error en proxy:', error);
        console.error('URL intentada:', backendUrl);
        console.error('Method:', req.method);
        console.error('Path:', pathString);
        console.error('Body recibido:', req.body);
        console.error('Headers recibidos:', req.headers);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            url: backendUrl
        });
    }
}

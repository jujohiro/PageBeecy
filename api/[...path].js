/**
 * Proxy simple para todas las rutas de API
 * Reenvía peticiones al backend http://15.235.44.199
 */

export default async function handler(req, res) {
    try {
        // Manejar OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }
        
        // Extraer path desde req.query.path (Vercel catch-all)
        const pathArray = req.query.path || [];
        const path = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
        
        if (!path) {
            return res.status(400).json({ error: 'Ruta no válida' });
        }
        
        // URL del backend
        const backendUrl = `http://15.235.44.199/${path}`;
        
        // Headers para el backend
        const headers = {};
        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        // Preparar body
        let body = null;
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const contentType = req.headers['content-type'] || '';
            
            // Si es form-urlencoded y viene como objeto, convertirlo
            if (contentType.includes('application/x-www-form-urlencoded') && typeof req.body === 'object') {
                const formData = new URLSearchParams();
                for (const [key, value] of Object.entries(req.body)) {
                    if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                }
                body = formData.toString();
            }
            // Si es string, usarlo directamente
            else if (typeof req.body === 'string') {
                body = req.body;
            }
            // Si es objeto y es JSON, convertirlo
            else if (typeof req.body === 'object') {
                body = JSON.stringify(req.body);
                headers['Content-Type'] = 'application/json';
            }
        }
        
        // Opciones para fetch
        const fetchOptions = {
            method: req.method,
            headers: headers
        };
        
        if (body) {
            fetchOptions.body = body;
        }
        
        // Enviar petición al backend
        const response = await fetch(backendUrl, fetchOptions);
        
        // Leer respuesta
        const responseContentType = response.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        // Retornar respuesta
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy] Error:', error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message
        });
    }
}

/**
 * Proxy para /feed/get-home
 */

export default async function handler(req, res) {
    try {
        // Manejar peticiones OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }
        
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const backendUrl = 'http://15.235.44.199/feed/get-home';
        
        // Preparar headers
        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json'
        };
        
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        // Preparar body
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        
        // Realizar petición al backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });
        
        const responseContentType = response.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        res.status(response.status);
        
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
            message: error.message
        });
    }
}


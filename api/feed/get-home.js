export default async function handler(req, res) {
    try {
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
        const headers = {
            'Content-Type': req.headers['content-type'] || 'application/json'
        };
        
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        
        const fetchOptions = {
            method: 'POST',
            headers: headers
        };
        
        if (body) {
            fetchOptions.body = body;
        }
        
        const response = await fetch(backendUrl, fetchOptions);
        const responseContentType = response.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('Error en get-home:', {
            message: error.message,
            code: error.code,
            cause: error.cause,
            stack: error.stack
        });
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message || 'Error desconocido',
            details: error.code || 'Sin código de error'
        });
    }
}

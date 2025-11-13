export default async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            return res.status(200).end();
        }
        
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const backendBaseUrl = process.env.BACKEND_URL || 'https://api.beecy.app';
        const backendUrl = `${backendBaseUrl}/auth/logout`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        let body = '';
        if (req.body && typeof req.body === 'object') {
            const formData = new URLSearchParams();
            for (const [key, value] of Object.entries(req.body)) {
                if (value !== undefined && value !== null) {
                    formData.append(key, String(value));
                }
            }
            body = formData.toString();
        } else if (typeof req.body === 'string') {
            body = req.body;
        }
        
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
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('Error en logout:', {
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


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
        
        const postId = req.query.id;
        if (!postId) {
            return res.status(400).json({ error: 'Post ID is required' });
        }
        
        const backendBaseUrl = process.env.BACKEND_URL || 'https://api.beecy.app';
        const backendUrl = `${backendBaseUrl}/admin/posts/${postId}/approve`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Pasar el token de autorización al backend
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        const fetchOptions = {
            method: 'POST',
            headers: headers
        };
        
        // Si hay body, enviarlo
        if (req.body && Object.keys(req.body).length > 0) {
            fetchOptions.body = JSON.stringify(req.body);
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
        console.error('Error en approve post:', {
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


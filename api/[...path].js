export default async function handler(req, res) {
    try {
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return res.status(200).end();
        }
        
        const pathArray = req.query.path || [];
        const path = Array.isArray(pathArray) ? pathArray.join('/') : pathArray;
        
        if (!path) {
            return res.status(400).json({ error: 'Ruta no válida' });
        }
        
        const backendUrl = `https://15.235.44.199/${path}`;
        const headers = {};
        
        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
        
        let body = null;
        if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
            const contentType = req.headers['content-type'] || '';
            
            if (contentType.includes('application/x-www-form-urlencoded') && typeof req.body === 'object') {
                const formData = new URLSearchParams();
                for (const [key, value] of Object.entries(req.body)) {
                    if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                }
                body = formData.toString();
            } else if (typeof req.body === 'string') {
                body = req.body;
            } else if (typeof req.body === 'object') {
                body = JSON.stringify(req.body);
                headers['Content-Type'] = 'application/json';
            }
        }
        
        const fetchOptions = {
            method: req.method,
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
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.send(responseData);
        }
        
    } catch (error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message
        });
    }
}

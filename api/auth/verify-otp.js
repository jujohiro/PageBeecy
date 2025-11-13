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
        
        const backendUrl = 'https://15.235.44.199/auth/verify-otp';
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
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message
        });
    }
}


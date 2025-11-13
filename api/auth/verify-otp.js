/**
 * Proxy para /auth/verify-otp
 * Reenvía peticiones POST al backend para evitar Mixed Content
 */

export default async function handler(req, res) {
    try {
        // Manejar peticiones OPTIONS (preflight CORS)
        if (req.method === 'OPTIONS') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            return res.status(200).end();
        }
        
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }
        
        const backendUrl = 'http://15.235.44.199/auth/verify-otp';
        
        // Preparar headers para el backend
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        // Preparar body como form-urlencoded
        // En Vercel, req.body puede venir como objeto parseado o como string
        let body = '';
        
        if (typeof req.body === 'string') {
            // Si ya es string, usarlo directamente
            body = req.body;
        } else if (typeof req.body === 'object' && req.body !== null) {
            // Si es objeto, convertirlo a form-urlencoded
            const formData = new URLSearchParams();
            for (const key in req.body) {
                if (req.body.hasOwnProperty(key)) {
                    formData.append(key, String(req.body[key]));
                }
            }
            body = formData.toString();
        } else if (req.body) {
            // Cualquier otro tipo, convertir a string
            body = String(req.body);
        }
        
        console.log('[Proxy verify-otp] Sending to backend:', {
            url: backendUrl,
            method: 'POST',
            body: body,
            headers: headers
        });
        
        // Realizar petición al backend
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });
        
        // Obtener respuesta
        const responseContentType = response.headers.get('content-type') || '';
        let responseData;
        
        if (responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        console.log('[Proxy verify-otp] Backend response:', {
            status: response.status,
            data: responseData
        });
        
        // Headers CORS
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        
        // Retornar respuesta del backend
        res.status(response.status);
        
        if (responseContentType.includes('application/json')) {
            res.json(responseData);
        } else {
            res.setHeader('Content-Type', responseContentType || 'text/plain');
            res.send(responseData);
        }
        
    } catch (error) {
        console.error('[Proxy verify-otp] Error:', error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message
        });
    }
}

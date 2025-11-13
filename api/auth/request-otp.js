/**
 * Proxy para /auth/request-otp
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
        
        const backendUrl = 'http://15.235.44.199/auth/request-otp';
        
        // Preparar body como form-urlencoded
        // En Vercel, el body puede venir parseado o como string/Buffer
        let body = '';
        
        // Log para debugging
        console.log('[Proxy request-otp] Raw req.body:', req.body);
        console.log('[Proxy request-otp] req.body type:', typeof req.body);
        console.log('[Proxy request-otp] Content-Type:', req.headers['content-type']);
        
        try {
            // Caso 1: Body es string (ya viene como form-urlencoded)
            if (typeof req.body === 'string') {
                body = req.body;
                console.log('[Proxy request-otp] Body es string:', body);
            }
            // Caso 2: Body es Buffer
            else if (Buffer.isBuffer && Buffer.isBuffer(req.body)) {
                body = req.body.toString('utf-8');
                console.log('[Proxy request-otp] Body es Buffer, convertido a string:', body);
            }
            // Caso 3: Body es objeto (parseado por Vercel)
            else if (req.body && typeof req.body === 'object') {
                // Verificar si es un objeto simple (no array, no Date, etc.)
                if (req.body.constructor === Object || Object.getPrototypeOf(req.body) === Object.prototype || Object.getPrototypeOf(req.body) === null) {
                    // Convertir objeto a form-urlencoded usando URLSearchParams
                    const formData = new URLSearchParams();
                    
                    // Usar Object.entries que es más seguro que hasOwnProperty
                    const entries = Object.entries(req.body);
                    for (const [key, value] of entries) {
                        if (value !== undefined && value !== null) {
                            formData.append(key, String(value));
                        }
                    }
                    body = formData.toString();
                    console.log('[Proxy request-otp] Body es objeto, convertido a form-urlencoded:', body);
                } else {
                    // Si no es un objeto simple, intentar convertir a string
                    body = String(req.body);
                    console.log('[Proxy request-otp] Body es objeto complejo, convertido a string:', body);
                }
            }
            // Caso 4: Body es null o undefined
            else if (req.body === null || req.body === undefined) {
                console.warn('[Proxy request-otp] Body es null o undefined');
                body = '';
            }
            // Caso 5: Otro tipo (number, boolean, etc.)
            else {
                body = String(req.body);
                console.log('[Proxy request-otp] Body es otro tipo, convertido a string:', body);
            }
        } catch (bodyError) {
            console.error('[Proxy request-otp] Error procesando body:', bodyError);
            console.error('[Proxy request-otp] Error stack:', bodyError.stack);
            // Si hay error, intentar convertir a string como último recurso
            try {
                body = String(req.body || '');
            } catch (stringError) {
                console.error('[Proxy request-otp] Error convirtiendo body a string:', stringError);
                body = '';
            }
        }
        
        // Validar que tenemos body
        if (!body || body.trim() === '') {
            console.error('[Proxy request-otp] Body vacío o inválido');
            console.error('[Proxy request-otp] req.body original:', req.body);
            console.error('[Proxy request-otp] Content-Length:', req.headers['content-length']);
            
            return res.status(400).json({
                error: 'Body vacío o inválido',
                bodyType: typeof req.body,
                bodyValue: req.body,
                contentLength: req.headers['content-length']
            });
        }
        
        // Preparar headers para el backend
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        
        console.log('[Proxy request-otp] Enviando al backend:', {
            url: backendUrl,
            body: body,
            bodyLength: body.length
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
        console.error('[Proxy request-otp] Error:', error);
        console.error('[Proxy request-otp] Error stack:', error.stack);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(500).json({
            error: 'Error al conectar con el backend',
            message: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

/**
 * Función de prueba para verificar que Vercel detecta las funciones serverless
 */

export default async function handler(req, res) {
    return res.json({
        message: 'Función serverless funcionando',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
}


// Obtener la URL del backend desde meta tag o usar valor por defecto
const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const isHttps = window.location.protocol === 'https:';
        const isTestPage = window.location.pathname.includes('/test/');
        
        // En producción HTTPS (Vercel), usar las funciones serverless
        if (isHttps && !isTestPage) {
            return '/api/';
        }
        
        // En localhost, usar el proxy local en puerto 3000 para evitar CORS
        if (isLocalhost) {
            return 'http://localhost:3000/api/';
        }
    }
    
    // En otros casos (como tests en otros entornos), obtener desde meta tag o usar valor por defecto
    if (typeof document !== 'undefined') {
        const metaTag = document.querySelector('meta[name="backend-url"]');
        if (metaTag && metaTag.getAttribute('content')) {
            const url = metaTag.getAttribute('content');
            return url.endsWith('/') ? url : `${url}/`;
        }
    }
    
    // Fallback al valor por defecto (URL real del backend)
    return 'https://api.beecy.app/';
};

const BASE_URL = getBackendUrl();

async function apiRequest(endpoint, method = 'GET', data = null, requiresAuth = false, contentType = 'json') {
    try {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${cleanEndpoint}`;
        const headers = {};
        
        let body = null;
        if (data && method.toUpperCase() !== 'GET') {
            if (contentType === 'form') {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                const formData = new URLSearchParams();
                for (const [key, value] of Object.entries(data)) {
                    if (value !== undefined && value !== null) {
                        formData.append(key, String(value));
                    }
                }
                body = formData.toString();
            } else {
                headers['Content-Type'] = 'application/json';
                body = JSON.stringify(data);
            }
        }
        
        if (requiresAuth) {
            const token = getToken();
            if (!token) {
                throw new Error('No se encontró token de autenticación');
            }
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const options = {
            method: method.toUpperCase(),
            headers: headers
        };
        
        if (body) {
            options.body = body;
        }
        
        const response = await fetch(url, options);
        const responseContentType = response.headers.get('content-type');
        let responseData;
        
        if (responseContentType && responseContentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }
        
        if (!response.ok) {
            const errorMessage = typeof responseData === 'object' && responseData?.message
                ? responseData.message
                : `Error ${response.status}: ${response.statusText}`;
            
            const error = new Error(errorMessage);
            error.status = response.status;
            throw error;
        }
        
        return responseData;
        
    } catch (error) {
        if (error.status) {
            throw error;
        }
        throw new Error(error.message || 'Error de conexión');
    }
}

async function apiGet(endpoint, requiresAuth = false) {
    return apiRequest(endpoint, 'GET', null, requiresAuth);
}

async function apiPost(endpoint, data, requiresAuth = false, contentType = 'json') {
    return apiRequest(endpoint, 'POST', data, requiresAuth, contentType);
}

async function apiPut(endpoint, data, requiresAuth = false) {
    return apiRequest(endpoint, 'PUT', data, requiresAuth);
}

async function apiDelete(endpoint, requiresAuth = false) {
    return apiRequest(endpoint, 'DELETE', null, requiresAuth);
}

const BASE_URL = typeof window !== 'undefined' && window.location.protocol === 'https:' 
    ? '/api/' 
    : 'https://15.235.44.199/';

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

/**
 * Funciones de autenticación OTP
 * Gestión de login, verificación y logout
 */

/**
 * Envía un código OTP al número de teléfono especificado
 * @param {string} phoneNumber - Número de teléfono en formato internacional
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function sendOtp(phoneNumber) {
    try {
        // Validar formato del teléfono
        const formattedPhone = formatPhone(phoneNumber);
        if (!validatePhone(formattedPhone)) {
            throw new Error('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)');
        }
        
        // Enviar solicitud OTP usando form-urlencoded (como requiere el backend)
        console.log('[Auth] Enviando OTP para:', formattedPhone);
        const response = await apiPost('/auth/request-otp', {
            phone: formattedPhone
        }, false, 'form'); // Usar 'form' para application/x-www-form-urlencoded
        
        console.log('[Auth] Respuesta del servidor:', response);
        
        // Verificar que la respuesta sea válida
        if (!response) {
            throw new Error('No se recibió respuesta del servidor.');
        }
        
        // Si la respuesta tiene un mensaje de éxito, es buena señal
        if (response.message || response.success !== false) {
            console.log('[Auth] OTP enviado correctamente');
        }
        
        return response;
    } catch (error) {
        console.error('[Auth] Error al enviar OTP:', error);
        
        // Mejorar mensajes de error
        if (error.message && error.message.includes('CORS')) {
            throw new Error('Error de CORS: El backend no permite solicitudes desde localhost. Contacta al equipo del backend para configurar CORS o despliega la aplicación en Vercel.');
        }
        
        if (error.message && error.message.includes('conexión')) {
            throw new Error('Error de conexión: No se pudo conectar con el backend. Verifica que el backend esté disponible y tu conexión a internet.');
        }
        
        // Re-lanzar el error con su mensaje original
        throw error;
    }
}

/**
 * Verifica el código OTP y guarda el token de autenticación
 * @param {string} phoneNumber - Número de teléfono
 * @param {string} otp - Código OTP de 6 dígitos
 * @returns {Promise<Object>} Respuesta del servidor con tokens
 */
async function verifyOtp(phoneNumber, otp) {
    try {
        // Validar formato del teléfono
        const formattedPhone = formatPhone(phoneNumber);
        if (!validatePhone(formattedPhone)) {
            throw new Error('Formato de teléfono inválido');
        }
        
        // Validar formato del OTP
        if (!validateOTP(otp)) {
            throw new Error('El código OTP debe tener 6 dígitos');
        }
        
        // Verificar OTP usando form-urlencoded (como requiere el backend)
        const response = await apiPost('/auth/verify-otp', {
            phone: formattedPhone,
            otp: otp
        }, false, 'form'); // Usar 'form' para application/x-www-form-urlencoded
        
        // Guardar token si se recibió
        if (response.accesstoken) {
            saveToken(response.accesstoken);
        }
        
        // Guardar refresh token si existe
        if (response.refreshToken) {
            try {
                localStorage.setItem('refresh_token', response.refreshToken);
            } catch (error) {
                console.error('Error al guardar refresh token:', error);
            }
        }
        
        // Guardar ID de usuario si existe
        if (response.id) {
            try {
                localStorage.setItem('user_id', response.id);
            } catch (error) {
                console.error('Error al guardar user ID:', error);
            }
        }
        
        return response;
    } catch (error) {
        console.error('Error al verificar OTP:', error);
        throw error;
    }
}

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} Token de autenticación o null
 */
function getAuthToken() {
    return getToken();
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} true si hay un token válido
 */
function isAuthenticated() {
    const token = getToken();
    return token !== null && token !== undefined && token !== '';
}

/**
 * Cierra la sesión del usuario
 * Limpia el token y redirige a la página de login
 */
function logout() {
    try {
        // Eliminar token
        removeToken();
        
        // Eliminar otros datos de sesión
        try {
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user_id');
        } catch (error) {
            console.error('Error al limpiar datos de sesión:', error);
        }
        
        // Redirigir a login
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Intentar redirigir de todas formas
        window.location.href = 'login.html';
    }
}

/**
 * Verifica si el usuario está autenticado y redirige si no lo está
 * Útil para proteger páginas que requieren autenticación
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}


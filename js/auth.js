async function sendOtp(phoneNumber) {
    const formattedPhone = formatPhone(phoneNumber);
    if (!validatePhone(formattedPhone)) {
        throw new Error('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)');
    }
    
    const response = await apiPost('/auth/request-otp', {
        phone: formattedPhone
    }, false, 'form');
    
    if (!response) {
        throw new Error('No se recibió respuesta del servidor.');
    }
    
    return response;
}

async function verifyOtp(phoneNumber, otp) {
    const formattedPhone = formatPhone(phoneNumber);
    if (!validatePhone(formattedPhone)) {
        throw new Error('Formato de teléfono inválido');
    }
    
    if (!validateOTP(otp)) {
        throw new Error('El código OTP debe tener 6 dígitos');
    }
    
    const response = await apiPost('/auth/verify-otp', {
        phone: formattedPhone,
        otp: otp
    }, false, 'form');
    
    if (response.accesstoken) {
        saveToken(response.accesstoken);
    }
    
    if (response.refreshToken) {
        localStorage.setItem('refresh_token', response.refreshToken);
    }
    
    if (response.id) {
        localStorage.setItem('user_id', response.id);
    }
    
    return response;
}

function isAuthenticated() {
    const token = getToken();
    return token !== null && token !== undefined && token !== '';
}

async function logout() {
    try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            // Intentar hacer logout en el backend
            try {
                await apiPost('/auth/logout', { id: userId }, false, 'form');
            } catch (error) {
                // Si falla el logout en el backend, continuar con el logout local
                console.warn('Error al hacer logout en el backend:', error);
            }
        }
    } catch (error) {
        console.warn('Error durante logout:', error);
    } finally {
        // Siempre limpiar el localStorage y redirigir
        removeToken();
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_id');
        // Usar ruta absoluta para evitar problemas con rutas relativas
        // Si estamos en /test/, usar ruta absoluta, sino usar relativa
        const loginPath = window.location.pathname.includes('/test/') 
            ? '/login.html' 
            : 'login.html';
        window.location.href = loginPath;
    }
}

function requireAuth() {
    if (!isAuthenticated()) {
        // Usar ruta absoluta para evitar problemas con rutas relativas
        // Si estamos en /test/, usar ruta absoluta, sino usar relativa
        const loginPath = window.location.pathname.includes('/test/') 
            ? '/login.html' 
            : 'login.html';
        window.location.href = loginPath;
    }
}

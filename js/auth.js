async function sendOtp(phoneNumber) {
    try {
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
    } catch (error) {
        throw error;
    }
}

async function verifyOtp(phoneNumber, otp) {
    try {
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
    } catch (error) {
        throw error;
    }
}

function getAuthToken() {
    return getToken();
}

function isAuthenticated() {
    const token = getToken();
    return token !== null && token !== undefined && token !== '';
}

function logout() {
    removeToken();
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_id');
    window.location.href = 'login.html';
}

function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
    }
}

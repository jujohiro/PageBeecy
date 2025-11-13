function saveToken(token) {
    try {
        localStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error al guardar token:', error);
    }
}

function getToken() {
    try {
        return localStorage.getItem('auth_token');
    } catch (error) {
        return null;
    }
}

function removeToken() {
    try {
        localStorage.removeItem('auth_token');
    } catch (error) {
        console.error('Error al eliminar token:', error);
    }
}

function validatePhone(phone) {
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
}

function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/[\s-]/g, '');
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

function formatDate(date) {
    if (!date) return '';
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(dateObj);
    } catch (error) {
        return '';
    }
}

function validateOTP(otp) {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
}

function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function redirectTo(page, params = {}) {
    let url = page;
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url = `${page}?${queryString}`;
    }
    window.location.href = url;
}

function showError(message, container) {
    if (!container) return;
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
    container.style.display = 'block';
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

function showSuccess(message, container) {
    if (!container) return;
    container.innerHTML = `<div class="success-message"><p>${message}</p></div>`;
    container.style.display = 'block';
    setTimeout(() => {
        container.style.display = 'none';
    }, 3000);
}

function clearMessage(container) {
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'none';
}

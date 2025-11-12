/**
 * Utilidades generales para la aplicación
 * Funciones para localStorage, validaciones y formateo
 */

/**
 * Guarda un token en localStorage
 * @param {string} token - Token de autenticación
 */
function saveToken(token) {
    try {
        localStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error al guardar token:', error);
    }
}

/**
 * Obtiene el token del localStorage
 * @returns {string|null} Token de autenticación o null si no existe
 */
function getToken() {
    try {
        return localStorage.getItem('auth_token');
    } catch (error) {
        console.error('Error al obtener token:', error);
        return null;
    }
}

/**
 * Elimina el token del localStorage
 */
function removeToken() {
    try {
        localStorage.removeItem('auth_token');
    } catch (error) {
        console.error('Error al eliminar token:', error);
    }
}

/**
 * Valida el formato de un número de teléfono internacional
 * @param {string} phone - Número de teléfono a validar
 * @returns {boolean} true si el formato es válido
 */
function validatePhone(phone) {
    // Formato: + seguido de 10-15 dígitos
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
}

/**
 * Formatea un número de teléfono añadiendo el prefijo + si no lo tiene
 * @param {string} phone - Número de teléfono
 * @returns {string} Número de teléfono formateado
 */
function formatPhone(phone) {
    if (!phone) return '';
    // Elimina espacios y guiones
    const cleaned = phone.replace(/[\s-]/g, '');
    // Si no empieza con +, añádelo
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
}

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
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
        console.error('Error al formatear fecha:', error);
        return '';
    }
}

/**
 * Valida un código OTP (6 dígitos)
 * @param {string} otp - Código OTP a validar
 * @returns {boolean} true si el formato es válido
 */
function validateOTP(otp) {
    const otpRegex = /^\d{6}$/;
    return otpRegex.test(otp);
}

/**
 * Obtiene un parámetro de la URL
 * @param {string} name - Nombre del parámetro
 * @returns {string|null} Valor del parámetro o null
 */
function getURLParameter(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * Redirige a una página con parámetros opcionales
 * @param {string} page - Página a la que redirigir
 * @param {Object} params - Parámetros opcionales como objeto
 */
function redirectTo(page, params = {}) {
    let url = page;
    if (Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url = `${page}?${queryString}`;
    }
    window.location.href = url;
}

/**
 * Muestra un mensaje de error al usuario
 * @param {string} message - Mensaje de error
 * @param {HTMLElement} container - Contenedor donde mostrar el error
 */
function showError(message, container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
        </div>
    `;
    container.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        container.style.display = 'none';
    }, 5000);
}

/**
 * Muestra un mensaje de éxito al usuario
 * @param {string} message - Mensaje de éxito
 * @param {HTMLElement} container - Contenedor donde mostrar el mensaje
 */
function showSuccess(message, container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="success-message">
            <p>${message}</p>
        </div>
    `;
    container.style.display = 'block';
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
        container.style.display = 'none';
    }, 3000);
}

/**
 * Limpia un mensaje del contenedor
 * @param {HTMLElement} container - Contenedor a limpiar
 */
function clearMessage(container) {
    if (!container) return;
    container.innerHTML = '';
    container.style.display = 'none';
}


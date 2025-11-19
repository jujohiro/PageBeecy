// Funciones para gestión de usuarios

/**
 * Obtiene un usuario por número de teléfono
 * @param {string} phoneNumber - Número de teléfono del usuario
 * @returns {Promise<Object>} - Información del usuario
 */
async function getUserByPhone(phoneNumber) {
    const formattedPhone = formatPhone(phoneNumber);
    if (!validatePhone(formattedPhone)) {
        throw new Error('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)');
    }
    
    const response = await apiGet(`/auth/get-user?phone=${encodeURIComponent(formattedPhone)}`, true);
    
    if (!response) {
        throw new Error('No se recibió respuesta del servidor.');
    }
    
    return response;
}

/**
 * Crea un nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @param {string} userData.username - Nombre de usuario
 * @param {string} userData.email - Email del usuario
 * @param {string} userData.phone - Teléfono del usuario
 * @param {string} userData.role - Rol del usuario (user, editor, administrator)
 * @param {string} userData.password - Contraseña del usuario
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function createUser(userData) {
    try {
        // Validar datos requeridos
        if (!userData.username || !userData.email || !userData.phone || !userData.password) {
            throw new Error('Todos los campos son requeridos');
        }

        const formattedPhone = formatPhone(userData.phone);
        if (!validatePhone(formattedPhone)) {
            throw new Error('Formato de teléfono inválido');
        }

        // Intentar crear el usuario mediante el flujo de registro OTP
        // Primero enviamos el OTP al número de teléfono
        try {
            await sendOtp(formattedPhone);
            
            // Para crear un usuario completamente, normalmente se requiere:
            // 1. Enviar OTP (ya hecho)
            // 2. Verificar OTP con los datos adicionales (username, email, role, password)
            // Como el backend actual solo soporta verify-otp básico, 
            // lanzamos un mensaje informativo
            
            return {
                success: true,
                message: 'Código OTP enviado. El usuario debe verificar el código para completar el registro.',
                phone: formattedPhone,
                requiresOtp: true
            };
        } catch (error) {
            // Si el usuario ya existe, intentamos obtener su información
            if (error.message && error.message.includes('ya existe') || error.status === 409) {
                const existingUser = await getUserByPhone(formattedPhone);
                throw new Error(`El usuario con el teléfono ${formattedPhone} ya existe`);
            }
            throw error;
        }
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al crear usuario: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Crea un usuario completo después de verificar OTP
 * @param {string} phone - Número de teléfono
 * @param {string} otp - Código OTP
 * @param {Object} additionalData - Datos adicionales (username, email, role, password)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function createUserWithOtp(phone, otp, additionalData = {}) {
    try {
        const formattedPhone = formatPhone(phone);
        if (!validatePhone(formattedPhone)) {
            throw new Error('Formato de teléfono inválido');
        }

        if (!validateOTP(otp)) {
            throw new Error('El código OTP debe tener 6 dígitos');
        }

        // Verificar OTP primero
        const verifyResponse = await verifyOtp(formattedPhone, otp);
        
        // Si la verificación es exitosa, intentar actualizar el perfil con los datos adicionales
        const userId = verifyResponse.id || verifyResponse.userId;
        if (userId && (additionalData.username || additionalData.email)) {
            try {
                await updateProfile(userId, {
                    name: additionalData.username,
                    email: additionalData.email,
                    role: additionalData.role || 'user'
                });
            } catch (updateError) {
                console.warn('Error al actualizar perfil después de crear usuario:', updateError);
                // No lanzamos error, ya que el usuario fue creado exitosamente
            }
        }

        return {
            success: true,
            message: 'Usuario creado exitosamente',
            user: verifyResponse
        };
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al crear usuario con OTP: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Elimina un usuario
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function deleteUser(userId) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        // Intentar eliminar usando el endpoint de administración
        const response = await apiDelete(`/admin/users/${userId}`, true);
        return response;
    } catch (error) {
        // Si el endpoint no existe, mostrar mensaje informativo
        if (error.status === 404 || error.message.includes('not found')) {
            throw new Error('El endpoint para eliminar usuarios no está disponible en el backend');
        }
        if (error.message) {
            throw error;
        }
        throw new Error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Actualiza información de un usuario
 * @param {string} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function updateUser(userId, userData) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        const response = await updateProfile(userId, userData);
        return response;
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al actualizar usuario: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Obtiene una lista de usuarios (si el backend lo soporta)
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Array>} - Lista de usuarios
 */
async function getUsersList(filters = {}) {
    try {
        const queryParams = new URLSearchParams();
        if (filters.role) queryParams.append('role', filters.role);
        if (filters.status) queryParams.append('status', filters.status);
        if (filters.search) queryParams.append('search', filters.search);

        const queryString = queryParams.toString();
        const endpoint = `/admin/users${queryString ? '?' + queryString : ''}`;
        
        const response = await apiGet(endpoint, true);
        return Array.isArray(response) ? response : (response.users || []);
    } catch (error) {
        // Si el endpoint no existe, retornar array vacío
        if (error.status === 404) {
            console.warn('El endpoint para listar usuarios no está disponible');
            return [];
        }
        if (error.message) {
            throw error;
        }
        throw new Error('Error al obtener lista de usuarios: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Cambia el estado de un usuario (activar/suspender)
 * @param {string} userId - ID del usuario
 * @param {string} status - Nuevo estado (active, suspended, etc.)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function changeUserStatus(userId, status) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    if (!status) {
        throw new Error('Estado requerido');
    }

    try {
        const response = await apiPut(`/admin/users/${userId}/status`, { status }, true);
        return response;
    } catch (error) {
        // Si el endpoint no existe, intentar actualizar el perfil
        if (error.status === 404) {
            try {
                return await updateProfile(userId, { status });
            } catch (updateError) {
                throw new Error('El endpoint para cambiar el estado de usuarios no está disponible');
            }
        }
        if (error.message) {
            throw error;
        }
        throw new Error('Error al cambiar estado del usuario: ' + (error.message || 'Error desconocido'));
    }
}

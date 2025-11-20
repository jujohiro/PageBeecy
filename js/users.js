// Funciones para gestión de usuarios

/**
 * Obtiene un usuario por número de teléfono (endpoint de administración)
 * @param {string} phoneNumber - Número de teléfono del usuario
 * @returns {Promise<Object>} - Información del usuario
 */
async function getUserByPhone(phoneNumber) {
    const formattedPhone = formatPhone(phoneNumber);
    if (!validatePhone(formattedPhone)) {
        throw new Error('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)');
    }
    
    // Usar endpoint de administración según documentación
    const response = await apiPost('/admin/user/by-phone', {
        phone: formattedPhone
    }, true);
    
    if (!response) {
        throw new Error('No se recibió respuesta del servidor.');
    }
    
    // Si la respuesta tiene un error, lanzarlo
    if (response.error) {
        const error = new Error(response.error);
        error.status = 404;
        throw error;
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
 * Elimina un usuario permanentemente (endpoint de administración)
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la eliminación
 * @param {boolean} deleteRelatedData - Si eliminar datos relacionados
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function deleteUser(userId, reason = 'Eliminación solicitada por administrador', deleteRelatedData = true) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        // Usar endpoint de administración según documentación
        const response = await apiPost('/admin/user/delete', {
            userId: userId,
            reason: reason,
            confirmDelete: true,
            deleteRelatedData: deleteRelatedData
        }, true);
        
        if (response.error) {
            const error = new Error(response.error);
            error.status = error.message.includes('confirmación') ? 400 : 409;
            throw error;
        }
        
        return response;
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al eliminar usuario: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Actualiza información de un usuario (endpoint de administración)
 * @param {string} userId - ID del usuario
 * @param {Object} userData - Datos a actualizar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function updateUser(userId, userData) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        // Usar endpoint de administración según documentación
        const requestData = {
            userId: userId,
            ...userData
        };
        
        const response = await apiPost('/admin/user/update', requestData, true);
        
        if (response.error) {
            const error = new Error(response.error);
            error.status = response.details ? 422 : 404;
            error.details = response.details;
            throw error;
        }
        
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
 * Inactiva un usuario (endpoint de administración)
 * @param {string} userId - ID del usuario
 * @param {string} reason - Razón de la inactivación
 * @param {string} notes - Notas adicionales
 * @param {string} deactivateUntil - Fecha de reactivación automática (ISO 8601)
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function deactivateUser(userId, reason = '', notes = '', deactivateUntil = null) {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        const response = await apiPost('/admin/user/deactivate', {
            userId: userId,
            reason: reason,
            notes: notes,
            deactivateUntil: deactivateUntil
        }, true);
        
        if (response.error) {
            const error = new Error(response.error);
            error.status = 400;
            throw error;
        }
        
        return response;
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al inactivar usuario: ' + (error.message || 'Error desconocido'));
    }
}

/**
 * Reactiva un usuario (endpoint de administración)
 * @param {string} userId - ID del usuario
 * @param {string} notes - Notas sobre la reactivación
 * @returns {Promise<Object>} - Respuesta del servidor
 */
async function activateUser(userId, notes = '') {
    if (!userId) {
        throw new Error('ID de usuario requerido');
    }

    try {
        const response = await apiPost('/admin/user/activate', {
            userId: userId,
            notes: notes
        }, true);
        
        if (response.error) {
            const error = new Error(response.error);
            error.status = 400;
            throw error;
        }
        
        return response;
    } catch (error) {
        if (error.message) {
            throw error;
        }
        throw new Error('Error al reactivar usuario: ' + (error.message || 'Error desconocido'));
    }
}

// Sistema de pruebas para el dashboard de administración
// Permite cargar JSONs de prueba y simular respuestas de la API

let TEST_MODE = false;
let TEST_RESPONSES = {};

/**
 * Activa o desactiva el modo de pruebas
 * @param {boolean} enabled - Si activar el modo de pruebas
 */
function setTestMode(enabled) {
    TEST_MODE = enabled;
    localStorage.setItem('test_mode', enabled ? 'true' : 'false');
    console.log(`Modo de pruebas: ${enabled ? 'ACTIVADO' : 'DESACTIVADO'}`);
}

/**
 * Verifica si el modo de pruebas está activo
 * @returns {boolean}
 */
function isTestMode() {
    const stored = localStorage.getItem('test_mode');
    return stored === 'true' || TEST_MODE;
}

/**
 * Carga un archivo JSON de prueba
 * @param {string} filePath - Ruta del archivo JSON
 * @returns {Promise<Object>}
 */
async function loadTestJSON(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`Error al cargar ${filePath}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al cargar JSON de prueba:', error);
        throw error;
    }
}

/**
 * Registra una respuesta de prueba para un endpoint
 * @param {string} endpoint - Endpoint a mockear
 * @param {string} method - Método HTTP
 * @param {Object} response - Respuesta a devolver
 * @param {number} statusCode - Código de estado HTTP
 */
function registerTestResponse(endpoint, method, response, statusCode = 200) {
    const key = `${method.toUpperCase()}:${endpoint}`;
    TEST_RESPONSES[key] = {
        response: response,
        status: statusCode
    };
}

/**
 * Carga todos los JSONs de prueba y registra las respuestas
 */
async function loadAllTestData() {
    if (!isTestMode()) return;

    try {
        // Cargar respuestas de éxito
        const buscarExito = await loadTestJSON('datos_prueba/responses/buscar-usuario-exito.json');
        registerTestResponse('/admin/user/by-phone', 'POST', buscarExito, 200);

        const actualizarExito = await loadTestJSON('datos_prueba/responses/actualizar-usuario-exito.json');
        registerTestResponse('/admin/user/update', 'POST', actualizarExito, 200);

        const inactivarExito = await loadTestJSON('datos_prueba/responses/inactivar-usuario-exito.json');
        registerTestResponse('/admin/user/deactivate', 'POST', inactivarExito, 200);

        const reactivarExito = await loadTestJSON('datos_prueba/responses/reactivar-usuario-exito.json');
        registerTestResponse('/admin/user/activate', 'POST', reactivarExito, 200);

        const eliminarExito = await loadTestJSON('datos_prueba/responses/eliminar-usuario-exito.json');
        registerTestResponse('/admin/user/delete', 'POST', eliminarExito, 200);

        console.log('Datos de prueba cargados correctamente');
    } catch (error) {
        console.warn('Error al cargar datos de prueba:', error);
    }
}

/**
 * Intercepta las llamadas a la API en modo de pruebas
 * @param {string} endpoint - Endpoint de la API
 * @param {string} method - Método HTTP
 * @param {Object} requestData - Datos de la petición
 * @returns {Promise<Object>} - Respuesta mockeada o null si no hay mock
 */
async function interceptTestRequest(endpoint, method, requestData) {
    if (!isTestMode()) return null;

    // Manejar autenticación en modo de pruebas
    if (endpoint === '/auth/request-otp' && method.toUpperCase() === 'POST') {
        // Cualquier número de teléfono funciona en modo de pruebas
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            message: "Código OTP enviado correctamente (Modo de Pruebas)",
            otp: "123456",
            phone: requestData?.phone || '',
            expiresIn: 300,
            testMode: true
        };
    }

    if (endpoint === '/auth/verify-otp' && method.toUpperCase() === 'POST') {
        const phone = requestData?.phone || '';
        const otp = requestData?.otp || '';
        
        // En modo de pruebas, aceptar OTP 123456 para cualquier número
        if (otp === '123456' || otp === '000000') {
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Determinar si es admin por teléfono
            const isAdmin = phone === '+573001234567' || phone.endsWith('4567');
            
            return {
                accesstoken: `test_token_${Date.now()}`,
                refreshToken: `test_refresh_${Date.now()}`,
                id: isAdmin ? 'admin_test_001' : 'user_test_001',
                registerStatus: "verified",
                user: {
                    id: isAdmin ? 'admin_test_001' : 'user_test_001',
                    name: isAdmin ? 'Admin de Prueba' : 'Usuario de Prueba',
                    email: isAdmin ? 'admin@test.beecy.app' : 'user@test.beecy.app',
                    phone: phone,
                    role: isAdmin ? 'administrator' : 'user',
                    isVerified: true,
                    isActive: true
                }
            };
        } else {
            // OTP incorrecto
            const error = new Error('Código OTP inválido. En modo de pruebas usa: 123456');
            error.status = 400;
            throw error;
        }
    }

    const key = `${method.toUpperCase()}:${endpoint}`;
    const mockResponse = TEST_RESPONSES[key];

    if (mockResponse) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Si el status no es 200, lanzar error
        if (mockResponse.status !== 200) {
            const error = new Error(mockResponse.response.error || 'Error de prueba');
            error.status = mockResponse.status;
            throw error;
        }
        
        return mockResponse.response;
    }

    return null;
}

/**
 * Carga un escenario completo de prueba
 * @param {string} scenarioPath - Ruta del archivo de escenario
 * @returns {Promise<Object>}
 */
async function loadTestScenario(scenarioPath) {
    try {
        const scenario = await loadTestJSON(scenarioPath);
        return scenario;
    } catch (error) {
        console.error('Error al cargar escenario de prueba:', error);
        throw error;
    }
}

/**
 * Ejecuta un escenario de prueba completo
 * @param {Object} scenario - Escenario cargado
 * @returns {Promise<Array>} - Resultados de cada paso
 */
async function runTestScenario(scenario) {
    const results = [];
    
    for (const paso of scenario.pasos) {
        try {
            // Registrar la respuesta del paso
            registerTestResponse(paso.endpoint, 'POST', paso.response.body, paso.response.status);
            
            // Simular la ejecución
            await new Promise(resolve => setTimeout(resolve, 500));
            
            results.push({
                paso: paso.paso,
                endpoint: paso.endpoint,
                success: true,
                response: paso.response.body
            });
        } catch (error) {
            results.push({
                paso: paso.paso,
                endpoint: paso.endpoint,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// Inicializar modo de pruebas al cargar
document.addEventListener('DOMContentLoaded', function() {
    const testMode = localStorage.getItem('test_mode') === 'true';
    if (testMode) {
        setTestMode(true);
        // Solo cargar datos de prueba si estamos en el dashboard
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
            loadAllTestData();
        }
    }
});


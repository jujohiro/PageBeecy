// Dashboard principal - Lógica completa

// Lista completa de países con indicativos telefónicos
const countryCodes = [
    { code: 'CO', name: 'Colombia', prefix: '+57' },
    { code: 'US', name: 'Estados Unidos', prefix: '+1' },
    { code: 'MX', name: 'México', prefix: '+52' },
    { code: 'AR', name: 'Argentina', prefix: '+54' },
    { code: 'CL', name: 'Chile', prefix: '+56' },
    { code: 'PE', name: 'Perú', prefix: '+51' },
    { code: 'VE', name: 'Venezuela', prefix: '+58' },
    { code: 'EC', name: 'Ecuador', prefix: '+593' },
    { code: 'BO', name: 'Bolivia', prefix: '+591' },
    { code: 'PY', name: 'Paraguay', prefix: '+595' },
    { code: 'UY', name: 'Uruguay', prefix: '+598' },
    { code: 'BR', name: 'Brasil', prefix: '+55' },
    { code: 'ES', name: 'España', prefix: '+34' },
    { code: 'PT', name: 'Portugal', prefix: '+351' },
    { code: 'FR', name: 'Francia', prefix: '+33' },
    { code: 'DE', name: 'Alemania', prefix: '+49' },
    { code: 'IT', name: 'Italia', prefix: '+39' },
    { code: 'GB', name: 'Reino Unido', prefix: '+44' },
    { code: 'CA', name: 'Canadá', prefix: '+1' },
    { code: 'CR', name: 'Costa Rica', prefix: '+506' },
    { code: 'PA', name: 'Panamá', prefix: '+507' },
    { code: 'NI', name: 'Nicaragua', prefix: '+505' },
    { code: 'HN', name: 'Honduras', prefix: '+504' },
    { code: 'GT', name: 'Guatemala', prefix: '+502' },
    { code: 'SV', name: 'El Salvador', prefix: '+503' },
    { code: 'BZ', name: 'Belice', prefix: '+501' },
    { code: 'CU', name: 'Cuba', prefix: '+53' },
    { code: 'DO', name: 'República Dominicana', prefix: '+1' },
    { code: 'HT', name: 'Haití', prefix: '+509' },
    { code: 'JM', name: 'Jamaica', prefix: '+1' },
    { code: 'CN', name: 'China', prefix: '+86' },
    { code: 'JP', name: 'Japón', prefix: '+81' },
    { code: 'KR', name: 'Corea del Sur', prefix: '+82' },
    { code: 'IN', name: 'India', prefix: '+91' },
    { code: 'AU', name: 'Australia', prefix: '+61' },
    { code: 'NZ', name: 'Nueva Zelanda', prefix: '+64' },
    { code: 'ZA', name: 'Sudáfrica', prefix: '+27' },
    { code: 'EG', name: 'Egipto', prefix: '+20' },
    { code: 'RU', name: 'Rusia', prefix: '+7' },
    { code: 'TR', name: 'Turquía', prefix: '+90' },
    { code: 'SA', name: 'Arabia Saudí', prefix: '+966' },
    { code: 'AE', name: 'Emiratos Árabes Unidos', prefix: '+971' },
    { code: 'IL', name: 'Israel', prefix: '+972' },
    { code: 'SG', name: 'Singapur', prefix: '+65' },
    { code: 'MY', name: 'Malasia', prefix: '+60' },
    { code: 'TH', name: 'Tailandia', prefix: '+66' },
    { code: 'PH', name: 'Filipinas', prefix: '+63' },
    { code: 'ID', name: 'Indonesia', prefix: '+62' },
    { code: 'VN', name: 'Vietnam', prefix: '+84' }
];

// Función para escapar HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

// Navegación entre secciones
function showSection(sectionId, clickedElement) {
    // Ocultar todas las secciones
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });

    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar enlaces activos del sidebar
    document.querySelectorAll('.sidebar-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (clickedElement) {
        clickedElement.classList.add('active');
    }

    // Cargar datos de la sección si es necesario
    if (sectionId === 'moderation') {
        loadPosts();
    }
}

// Función para obtener el prefijo del país seleccionado
function getSelectedCountryPrefix(countrySelectId) {
    const countrySelect = document.getElementById(countrySelectId);
    if (!countrySelect) return '';

    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    if (selectedOption && selectedOption.dataset.prefix) {
        return selectedOption.dataset.prefix;
    }
    return '';
}

// Función para formatear el número de teléfono completo antes de enviar
function getFullPhoneNumber() {
    const countrySelect = document.getElementById('new-country');
    const phoneInput = document.getElementById('new-phone');

    if (!phoneInput) return '';

    let number = phoneInput.value.trim();

    // Si ya tiene formato completo con +, usarlo directamente
    if (number.startsWith('+')) {
        return number;
    }

    // Remover cualquier carácter no numérico
    number = number.replace(/[^\d]/g, '');

    // Obtener el prefijo del país seleccionado
    const prefix = getSelectedCountryPrefix('new-country');

    // Combinar prefijo y número
    if (prefix && number) {
        return prefix + number;
    }

    // Si no hay prefijo pero hay número, devolver como está
    return number;
}

// Función para obtener el número completo de búsqueda
function getFullSearchPhoneNumber() {
    const phoneInput = document.getElementById('search-phone-input');

    if (!phoneInput) return '';

    let number = phoneInput.value.trim();

    // Si el número ya tiene el formato completo con +, usarlo directamente
    if (number.startsWith('+')) {
        return number;
    }

    // Remover cualquier carácter no numérico
    number = number.replace(/[^\d]/g, '');

    // Obtener el prefijo del país seleccionado
    const prefix = getSelectedCountryPrefix('search-country');

    // Combinar prefijo y número si ambos existen
    if (prefix && number) {
        return prefix + number;
    }

    // Si no hay prefijo pero hay número, devolver como está
    return number;
}

// Función para poblar el select de países
function populateCountrySelect() {
    const countrySelect = document.getElementById('new-country');
    const searchCountrySelect = document.getElementById('search-country');

    // Ordenar países alfabéticamente por nombre
    const sortedCountries = [...countryCodes].sort((a, b) => a.name.localeCompare(b.name));

    // Poblar el select de creación de usuario
    if (countrySelect) {
        sortedCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.prefix})`;
            option.dataset.prefix = country.prefix;
            countrySelect.appendChild(option);
        });
    }

    // Poblar el select de búsqueda
    if (searchCountrySelect) {
        sortedCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country.code;
            option.textContent = `${country.name} (${country.prefix})`;
            option.dataset.prefix = country.prefix;
            searchCountrySelect.appendChild(option);
        });
    }
}

// Función de búsqueda de usuarios
async function handleSearchUser() {
    const searchInput = document.getElementById('search-phone-input');
    const messageContainer = document.getElementById('message-container');
    const tableBody = document.getElementById('users-table-body');

    if (!searchInput) return;

    const fullPhoneNumber = getFullSearchPhoneNumber();
    if (!fullPhoneNumber) {
        showError('Por favor, ingresa un número de teléfono', messageContainer);
        searchInput.focus();
        return;
    }

    const formattedPhone = formatPhone(fullPhoneNumber);

    if (!validatePhone(formattedPhone)) {
        showError('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)', messageContainer);
        searchInput.focus();
        return;
    }

    clearMessage(messageContainer);

    try {
        const user = await getUserByPhone(formattedPhone);
        displayUserInTable(user, tableBody);
        showSuccess('Usuario encontrado correctamente', messageContainer);
    } catch (error) {
        showError(error.message || 'Error al buscar usuario. Verifica el número de teléfono.', messageContainer);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
                        No encontrado
                    </td>
                </tr>
            `;
        }
    }
}

// Variable global para almacenar el usuario actual seleccionado
let currentSelectedUser = null;

function displayUserInTable(user, tableBody) {
    if (!tableBody) return;

    // Guardar usuario actual para usar en otras funciones
    currentSelectedUser = user;

    const userName = user.name || user.username || 'No disponible';
    const userEmail = user.email || 'No disponible';
    const userPhone = user.phone || user.phoneNumber || 'No disponible';
    const isActive = user.isActive !== undefined ? user.isActive : (user.status === 'active' || user.status === 'activo');
    const userId = user.id || user._id || '';

    const avatarInitial = userName.charAt(0).toUpperCase();
    const statusBadge = isActive
        ? '<span class="status-badge status-active">Activo</span>'
        : '<span class="status-badge status-suspended">Inactivo</span>';

    const actionButtons = isActive
        ? `<button class="table-btn" onclick="handleInactivateUser('${escapeHtml(userId)}')">Inactivar</button>`
        : `<button class="table-btn" onclick="handleActivateUser('${escapeHtml(userId)}')">Reactivar</button>`;

    tableBody.innerHTML = `
        <tr>
            <td>
                <div class="user-cell">
                    <div class="user-avatar">${escapeHtml(avatarInitial)}</div>
                    <span>${escapeHtml(userName)}</span>
                </div>
            </td>
            <td>${escapeHtml(userEmail)}</td>
            <td>${escapeHtml(userPhone)}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="table-btn" onclick="handleEditUser('${escapeHtml(userId)}')">
                        Editar
                    </button>
                    ${actionButtons}
                    <button class="table-btn delete" onclick="handleDeleteUser('${escapeHtml(userId)}')">
                        Eliminar
                    </button>
                </div>
            </td>
        </tr>
    `;
}

async function handleCreateUser(event) {
    event.preventDefault();
    const messageContainer = document.getElementById('message-container');
    const createBtn = document.getElementById('create-user-btn');

    const fullPhoneNumber = getFullPhoneNumber();
    if (!fullPhoneNumber) {
        showError('Por favor, selecciona un país e ingresa un número de teléfono', messageContainer);
        return;
    }

    const formData = {
        username: document.getElementById('new-username').value.trim(),
        email: document.getElementById('new-email').value.trim(),
        phone: formatPhone(fullPhoneNumber),
        role: document.getElementById('new-role').value,
        password: document.getElementById('new-password').value
    };

    if (!validatePhone(formData.phone)) {
        showError('Formato de teléfono inválido. Debe ser un número internacional (ej: +573001234567)', messageContainer);
        return;
    }

    createBtn.disabled = true;
    createBtn.textContent = 'Creando...';
    clearMessage(messageContainer);

    try {
        await createUser(formData);
        showSuccess('Usuario creado correctamente', messageContainer);
        resetCreateUserForm();
        const searchInput = document.getElementById('search-phone-input');
        if (searchInput && searchInput.value) {
            searchInput.value = formData.phone;
            await handleSearchUser();
        }
    } catch (error) {
        showError(error.message || 'Error al crear usuario', messageContainer);
    } finally {
        createBtn.disabled = false;
        createBtn.textContent = 'Crear Usuario';
    }
}

function resetCreateUserForm() {
    const form = document.getElementById('create-user-form');
    if (form) {
        form.reset();
    }
}

async function handleEditUser(userId) {
    if (!currentSelectedUser) {
        showError('No hay usuario seleccionado', document.getElementById('message-container'));
        return;
    }

    // Abrir modal de edición
    openEditUserModal(currentSelectedUser);
}

function openEditUserModal(user) {
    // Crear o actualizar modal
    let modal = document.getElementById('edit-user-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'edit-user-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Editar Usuario</h2>
                <button class="modal-close" onclick="closeEditUserModal()">&times;</button>
            </div>
            <form id="edit-user-form" onsubmit="handleUpdateUser(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="edit-name">Nombre</label>
                        <input type="text" id="edit-name" name="name" value="${escapeHtml(user.name || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email</label>
                        <input type="email" id="edit-email" name="email" value="${escapeHtml(user.email || '')}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-age">Edad</label>
                        <input type="number" id="edit-age" name="age" value="${user.age || ''}" min="1">
                    </div>
                    <div class="form-group">
                        <label for="edit-gender">Género</label>
                        <select id="edit-gender" name="gender">
                            <option value="">Seleccionar</option>
                            <option value="male" ${user.gender === 'male' ? 'selected' : ''}>Masculino</option>
                            <option value="female" ${user.gender === 'female' ? 'selected' : ''}>Femenino</option>
                            <option value="other" ${user.gender === 'other' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                    <div class="form-group form-group-full">
                        <label for="edit-biography">Biografía</label>
                        <textarea id="edit-biography" name="biography" rows="3" style="width: 100%; padding: 12px 16px; font-size: 16px; border: 1px solid var(--border-color); border-radius: var(--radius); background: var(--surface-elevated); color: var(--text-primary); font-family: inherit; resize: vertical;">${escapeHtml(user.biography || '')}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="edit-birthDate">Fecha de Nacimiento</label>
                        <input type="date" id="edit-birthDate" name="birthDate" value="${user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-image">URL de Imagen</label>
                        <input type="url" id="edit-image" name="image" value="${escapeHtml(user.image || '')}">
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-isVerified" name="isVerified" ${user.isVerified ? 'checked' : ''}>
                            Usuario Verificado
                        </label>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="closeEditUserModal()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="update-user-btn">Actualizar</button>
                </div>
            </form>
        </div>
    `;
    modal.style.display = 'flex';
}

function closeEditUserModal() {
    const modal = document.getElementById('edit-user-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function handleUpdateUser(event) {
    event.preventDefault();
    const messageContainer = document.getElementById('message-container');
    const updateBtn = document.getElementById('update-user-btn');

    if (!currentSelectedUser) {
        showError('No hay usuario seleccionado', messageContainer);
        return;
    }

    const userId = currentSelectedUser.id || currentSelectedUser._id;
    const formData = {
        name: document.getElementById('edit-name').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        age: parseInt(document.getElementById('edit-age').value) || undefined,
        gender: document.getElementById('edit-gender').value || undefined,
        biography: document.getElementById('edit-biography').value.trim() || undefined,
        birthDate: document.getElementById('edit-birthDate').value ? new Date(document.getElementById('edit-birthDate').value).toISOString() : undefined,
        image: document.getElementById('edit-image').value.trim() || undefined,
        isVerified: document.getElementById('edit-isVerified').checked
    };

    // Remover campos undefined
    Object.keys(formData).forEach(key => {
        if (formData[key] === undefined || formData[key] === '') {
            delete formData[key];
        }
    });

    updateBtn.disabled = true;
    updateBtn.textContent = 'Actualizando...';
    clearMessage(messageContainer);

    try {
        const response = await updateUser(userId, formData);
        showSuccess('Usuario actualizado correctamente', messageContainer);
        closeEditUserModal();
        
        // Recargar usuario actualizado
        if (currentSelectedUser.phone) {
            await handleSearchUser();
        }
    } catch (error) {
        let errorMessage = error.message || 'Error al actualizar usuario';
        if (error.details) {
            errorMessage += ': ' + Object.values(error.details).join(', ');
        }
        showError(errorMessage, messageContainer);
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Actualizar';
    }
}

async function handleInactivateUser(userId) {
    const reason = prompt('Razón de la inactivación (opcional):');
    const notes = prompt('Notas adicionales (opcional):');
    
    if (reason === null && notes === null) {
        return; // Usuario canceló
    }

    const messageContainer = document.getElementById('message-container');
    clearMessage(messageContainer);

    try {
        await deactivateUser(userId, reason || '', notes || '');
        showSuccess('Usuario inactivado correctamente', messageContainer);
        
        // Recargar usuario
        if (currentSelectedUser && currentSelectedUser.phone) {
            await handleSearchUser();
        }
    } catch (error) {
        showError(error.message || 'Error al inactivar usuario', messageContainer);
    }
}

async function handleActivateUser(userId) {
    const notes = prompt('Notas sobre la reactivación (opcional):');
    
    if (notes === null) {
        return; // Usuario canceló
    }

    const messageContainer = document.getElementById('message-container');
    clearMessage(messageContainer);

    try {
        await activateUser(userId, notes || '');
        showSuccess('Usuario reactivado correctamente', messageContainer);
        
        // Recargar usuario
        if (currentSelectedUser && currentSelectedUser.phone) {
            await handleSearchUser();
        }
    } catch (error) {
        showError(error.message || 'Error al reactivar usuario', messageContainer);
    }
}

async function handleDeleteUser(userId) {
    const reason = prompt('Razón de la eliminación (requerido):');
    
    if (!reason || reason.trim() === '') {
        showError('Debes proporcionar una razón para eliminar el usuario', document.getElementById('message-container'));
        return;
    }

    if (!confirm('¿Estás seguro de que deseas eliminar este usuario permanentemente? Esta acción no se puede deshacer.')) {
        return;
    }

    const messageContainer = document.getElementById('message-container');
    clearMessage(messageContainer);

    try {
        await deleteUser(userId, reason.trim());
        showSuccess('Usuario eliminado permanentemente', messageContainer);
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
                        Usuario eliminado
                    </td>
                </tr>
            `;
        }
        currentSelectedUser = null;
    } catch (error) {
        showError(error.message || 'Error al eliminar usuario', messageContainer);
    }
}

// Función para cambiar entre modo claro y oscuro
function toggleThemeMode() {
    const newTheme = toggleTheme();
    updateThemeIcon(newTheme);
}

// Función para actualizar el icono del tema
function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.textContent = 'dark_mode';
            themeIcon.parentElement.title = 'Cambiar a modo claro';
        } else {
            themeIcon.textContent = 'light_mode';
            themeIcon.parentElement.title = 'Cambiar a modo oscuro';
        }
    }
}

async function loadCurrentUserInfo() {
    try {
        const userId = localStorage.getItem('user_id');
        if (userId) {
            const userName = localStorage.getItem('user_name') || 'Administrador';
            const avatarInitial = userName.charAt(0).toUpperCase();

            const avatarEl = document.getElementById('user-avatar-initial');
            const nameEl = document.getElementById('user-name-sidebar');

            if (avatarEl) avatarEl.textContent = avatarInitial;
            if (nameEl) nameEl.textContent = userName;
        }
    } catch (error) {
        console.error('Error al cargar información del usuario:', error);
    }
}

function setupSearchInput() {
    const searchInput = document.getElementById('search-phone-input');
    if (searchInput) {
        searchInput.addEventListener('input', function (e) {
            let value = e.target.value;
            // Si hay un país seleccionado, solo permitir números
            const countrySelect = document.getElementById('search-country');
            if (countrySelect && countrySelect.value) {
                // Solo números, sin el signo +
                value = value.replace(/[^\d]/g, '');
            } else {
                // Permitir formato completo con +
                value = value.replace(/[^\d+]/g, '');
                if (value && !value.startsWith('+')) {
                    value = '+' + value.replace(/^\+/, '');
                }
            }
            e.target.value = value;
        });
    }

    const phoneInput = document.getElementById('new-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value;
            // Si hay un país seleccionado, solo permitir números
            const countrySelect = document.getElementById('new-country');
            if (countrySelect && countrySelect.value) {
                // Solo números, sin el signo +
                value = value.replace(/[^\d]/g, '');
            } else {
                // Permitir formato completo con +
                value = value.replace(/[^\d+]/g, '');
                if (value && !value.startsWith('+')) {
                    value = '+' + value.replace(/^\+/, '');
                }
            }
            e.target.value = value;
        });
    }
}

// Función para alternar modo de pruebas
function toggleTestMode() {
    const currentMode = isTestMode();
    setTestMode(!currentMode);
    updateTestModeIndicator(!currentMode);
    updateTestModeButton(!currentMode);
    
    if (!currentMode) {
        loadAllTestData();
    }
}

// Función para actualizar el indicador de modo de pruebas
function updateTestModeIndicator(enabled) {
    const indicator = document.getElementById('test-mode-indicator');
    if (indicator) {
        if (enabled) {
            indicator.classList.add('active');
        } else {
            indicator.classList.remove('active');
        }
    }
}

// Función para actualizar el botón de modo de pruebas
function updateTestModeButton(enabled) {
    const btn = document.getElementById('test-mode-btn');
    if (btn) {
        if (enabled) {
            btn.style.background = 'rgba(255, 193, 7, 0.3)';
            btn.style.borderColor = '#FFC107';
            btn.title = 'Desactivar Modo de Pruebas';
        } else {
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.title = 'Activar Modo de Pruebas';
        }
    }
}

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', function () {
    requireAuth();
    initTheme();
    // Actualizar icono del tema según el tema actual
    const currentTheme = getTheme();
    updateThemeIcon(currentTheme);
    
    // Inicializar modo de pruebas
    const testMode = isTestMode();
    updateTestModeIndicator(testMode);
    updateTestModeButton(testMode);
    if (testMode) {
        loadAllTestData();
    }
    
    loadCurrentUserInfo();
    setupSearchInput();
    populateCountrySelect();
    loadPosts();
});


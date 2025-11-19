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

function displayUserInTable(user, tableBody) {
    if (!tableBody) return;

    const userName = user.name || user.username || 'No disponible';
    const userEmail = user.email || 'No disponible';
    const userPhone = user.phone || user.phoneNumber || 'No disponible';
    const userStatus = user.status || 'active';
    const userId = user.id || user._id || '';

    const avatarInitial = userName.charAt(0).toUpperCase();
    const statusBadge = userStatus === 'active' || userStatus === 'activo'
        ? '<span class="status-badge status-active">Activo</span>'
        : '<span class="status-badge status-suspended">Suspendido</span>';

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
    // Abrir sección de búsqueda para editar usuario
    showSection('users', document.querySelector('.sidebar-nav-link[onclick*="users"]'));
    const messageContainer = document.getElementById('message-container');
    showSuccess('Usa el campo de búsqueda para encontrar y editar el usuario', messageContainer);
}

async function handleDeleteUser(userId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.')) {
        return;
    }

    const messageContainer = document.getElementById('message-container');
    clearMessage(messageContainer);

    try {
        await deleteUser(userId);
        showSuccess('Usuario eliminado', messageContainer);
        const tableBody = document.getElementById('users-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-secondary);">
                        Eliminado
                    </td>
                </tr>
            `;
        }
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

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', function () {
    requireAuth();
    initTheme();
    // Actualizar icono del tema según el tema actual
    const currentTheme = getTheme();
    updateThemeIcon(currentTheme);
    loadCurrentUserInfo();
    setupSearchInput();
    populateCountrySelect();
    loadPosts();
});


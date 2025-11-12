/**
 * Gestión de posts y moderación
 * Funciones para obtener, aprobar y rechazar posts
 */

/**
 * Obtiene la lista de posts desde el backend
 * @param {Object} filters - Filtros opcionales (lat, lon, area)
 * @returns {Promise<Array>} Lista de posts
 */
async function getPosts(filters = {}) {
    try {
        // Preparar el body de la petición
        const body = {
            lat: filters.lat || '',
            lon: filters.lon || '',
            area: filters.area || 0
        };
        
        // Realizar petición autenticada
        const response = await apiPost('/feed/get-home', body, true);
        
        // Si la respuesta es un array, retornarlo directamente
        if (Array.isArray(response)) {
            return response;
        }
        
        // Si la respuesta tiene una propiedad que contiene el array de posts
        if (response.posts && Array.isArray(response.posts)) {
            return response.posts;
        }
        
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        }
        
        // Si no se encuentra el array, retornar array vacío
        console.warn('Formato de respuesta inesperado:', response);
        return [];
        
    } catch (error) {
        console.error('Error al obtener posts:', error);
        throw error;
    }
}

/**
 * Aprueba un post
 * NOTA: Este endpoint aún no está definido por el backend.
 * Se implementará cuando el endpoint esté disponible.
 * 
 * @param {string} postId - ID del post a aprobar
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function approvePost(postId) {
    try {
        if (!postId) {
            throw new Error('ID de post requerido');
        }
        
        // TODO: Reemplazar con el endpoint real cuando esté disponible
        // Endpoint asumido: POST /admin/posts/{id}/approve
        // Si el endpoint es diferente, ajustar aquí
        
        const endpoint = `/admin/posts/${postId}/approve`;
        
        try {
            const response = await apiPost(endpoint, {}, true);
            return response;
        } catch (error) {
            // Si el endpoint no existe aún, mostrar mensaje informativo
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                console.warn('Endpoint de aprobación no disponible aún:', endpoint);
                throw new Error('La funcionalidad de aprobación aún no está disponible en el backend');
            }
            throw error;
        }
    } catch (error) {
        console.error('Error al aprobar post:', error);
        throw error;
    }
}

/**
 * Rechaza un post
 * NOTA: Este endpoint aún no está definido por el backend.
 * Se implementará cuando el endpoint esté disponible.
 * 
 * @param {string} postId - ID del post a rechazar
 * @returns {Promise<Object>} Respuesta del servidor
 */
async function rejectPost(postId) {
    try {
        if (!postId) {
            throw new Error('ID de post requerido');
        }
        
        // TODO: Reemplazar con el endpoint real cuando esté disponible
        // Endpoint asumido: POST /admin/posts/{id}/reject
        // Si el endpoint es diferente, ajustar aquí
        
        const endpoint = `/admin/posts/${postId}/reject`;
        
        try {
            const response = await apiPost(endpoint, {}, true);
            return response;
        } catch (error) {
            // Si el endpoint no existe aún, mostrar mensaje informativo
            if (error.message.includes('404') || error.message.includes('Not Found')) {
                console.warn('Endpoint de rechazo no disponible aún:', endpoint);
                throw new Error('La funcionalidad de rechazo aún no está disponible en el backend');
            }
            throw error;
        }
    } catch (error) {
        console.error('Error al rechazar post:', error);
        throw error;
    }
}

/**
 * Renderiza la lista de posts en el contenedor especificado
 * @param {Array} posts - Array de posts a renderizar
 * @param {HTMLElement} container - Contenedor donde renderizar los posts
 */
function renderPosts(posts, container) {
    if (!container) {
        console.error('Contenedor no encontrado');
        return;
    }
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No hay posts disponibles</p>
            </div>
        `;
        return;
    }
    
    // Generar HTML para cada post
    const postsHTML = posts.map(post => {
        // Obtener imágenes del post
        const images = post.images || [];
        const imagesHTML = images.length > 0 
            ? images.map(img => `
                <img src="${img}" alt="Imagen del post" class="post-image" loading="lazy">
            `).join('')
            : '';
        
        // Obtener información del usuario
        const userName = post.user?.name || post.userName || 'Usuario desconocido';
        const userId = post.user?.id || post.userId || '';
        
        // Formatear fecha
        const createdAt = formatDate(post.createdAt || post.created_at);
        
        return `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-header">
                    <div class="post-user-info">
                        <span class="user-name">${userName}</span>
                        ${userId ? `<span class="user-id">ID: ${userId}</span>` : ''}
                    </div>
                    <span class="post-date">${createdAt}</span>
                </div>
                
                ${post.content ? `
                    <div class="post-content">
                        <p>${escapeHtml(post.content)}</p>
                    </div>
                ` : ''}
                
                ${imagesHTML ? `
                    <div class="post-images">
                        ${imagesHTML}
                    </div>
                ` : ''}
                
                <div class="post-actions">
                    <button class="btn btn-approve" onclick="handleApprovePost('${post.id}')">
                        Aprobar
                    </button>
                    <button class="btn btn-reject" onclick="handleRejectPost('${post.id}')">
                        Rechazar
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = postsHTML;
}

/**
 * Maneja la aprobación de un post
 * @param {string} postId - ID del post a aprobar
 */
async function handleApprovePost(postId) {
    try {
        // Deshabilitar botones durante la operación
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = true);
        }
        
        await approvePost(postId);
        
        // Remover el post de la lista
        if (postCard) {
            postCard.style.opacity = '0.5';
            postCard.style.pointerEvents = 'none';
            // Opcional: remover completamente después de un delay
            setTimeout(() => {
                postCard.remove();
                // Verificar si no hay más posts
                const remainingPosts = document.querySelectorAll('.post-card');
                if (remainingPosts.length === 0) {
                    const container = document.getElementById('posts-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="empty-state">
                                <p>No hay más posts pendientes</p>
                            </div>
                        `;
                    }
                }
            }, 500);
        }
        
        // Mostrar mensaje de éxito
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showSuccess('Post aprobado correctamente', messageContainer);
        }
        
    } catch (error) {
        console.error('Error al aprobar post:', error);
        
        // Mostrar mensaje de error
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showError(error.message || 'Error al aprobar el post', messageContainer);
        }
        
        // Rehabilitar botones
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

/**
 * Maneja el rechazo de un post
 * @param {string} postId - ID del post a rechazar
 */
async function handleRejectPost(postId) {
    try {
        // Confirmar acción
        if (!confirm('¿Estás seguro de que deseas rechazar este post?')) {
            return;
        }
        
        // Deshabilitar botones durante la operación
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = true);
        }
        
        await rejectPost(postId);
        
        // Remover el post de la lista
        if (postCard) {
            postCard.style.opacity = '0.5';
            postCard.style.pointerEvents = 'none';
            // Opcional: remover completamente después de un delay
            setTimeout(() => {
                postCard.remove();
                // Verificar si no hay más posts
                const remainingPosts = document.querySelectorAll('.post-card');
                if (remainingPosts.length === 0) {
                    const container = document.getElementById('posts-container');
                    if (container) {
                        container.innerHTML = `
                            <div class="empty-state">
                                <p>No hay más posts pendientes</p>
                            </div>
                        `;
                    }
                }
            }, 500);
        }
        
        // Mostrar mensaje de éxito
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showSuccess('Post rechazado correctamente', messageContainer);
        }
        
    } catch (error) {
        console.error('Error al rechazar post:', error);
        
        // Mostrar mensaje de error
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showError(error.message || 'Error al rechazar el post', messageContainer);
        }
        
        // Rehabilitar botones
        const postCard = document.querySelector(`[data-post-id="${postId}"]`);
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

/**
 * Escapa HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} Texto escapado
 */
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Carga y muestra los posts en la página
 */
async function loadPosts() {
    try {
        const container = document.getElementById('posts-container');
        const loadingContainer = document.getElementById('loading-container');
        const messageContainer = document.getElementById('message-container');
        
        // Mostrar loading
        if (loadingContainer) {
            loadingContainer.style.display = 'block';
        }
        if (container) {
            container.innerHTML = '';
        }
        
        // Obtener posts
        const posts = await getPosts();
        
        // Ocultar loading
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        // Renderizar posts
        if (container) {
            renderPosts(posts, container);
        }
        
        // Si no hay posts, mostrar mensaje
        if (!posts || posts.length === 0) {
            if (messageContainer) {
                showSuccess('No hay posts pendientes de moderación', messageContainer);
            }
        }
        
    } catch (error) {
        console.error('Error al cargar posts:', error);
        
        // Ocultar loading
        const loadingContainer = document.getElementById('loading-container');
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        // Mostrar error
        const container = document.getElementById('posts-container');
        const messageContainer = document.getElementById('message-container');
        
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Error al cargar los posts</p>
                    <p class="error-details">${error.message || 'Error desconocido'}</p>
                    <button class="btn btn-retry" onclick="loadPosts()">Reintentar</button>
                </div>
            `;
        }
        
        if (messageContainer) {
            showError(error.message || 'Error al cargar los posts', messageContainer);
        }
    }
}


async function getPosts(filters = {}) {
    const body = {
        lat: filters.lat || '',
        lon: filters.lon || '',
        area: filters.area || 0
    };
    
    const response = await apiPost('/feed/get-home', body, true);
    
    if (Array.isArray(response)) {
        return response;
    }
    
    if (response.posts && Array.isArray(response.posts)) {
        return response.posts;
    }
    
    if (response.data && Array.isArray(response.data)) {
        return response.data;
    }
    
    return [];
}

async function approvePost(postId) {
    if (!postId) {
        throw new Error('ID de post requerido');
    }
    
    const endpoint = `/admin/posts/${postId}/approve`;
    return await apiPost(endpoint, {}, true);
}

async function rejectPost(postId) {
    if (!postId) {
        throw new Error('ID de post requerido');
    }
    
    const endpoint = `/admin/posts/${postId}/reject`;
    return await apiPost(endpoint, {}, true);
}

function renderPosts(posts, container) {
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>Sin publicaciones pendientes</p></div>`;
        return;
    }
    
    const postsHTML = posts.map(post => {
        const images = post.images || [];
        const imagesHTML = images.length > 0
            ? images.map(img => `<img src="${img}" alt="Imagen del post" class="post-image" loading="lazy">`).join('')
            : '';
        
        const userName = post.user?.name || post.userName || 'Usuario desconocido';
        const userId = post.user?.id || post.userId || '';
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
                
                ${post.content ? `<div class="post-content"><p>${escapeHtml(post.content)}</p></div>` : ''}
                
                ${imagesHTML ? `<div class="post-images">${imagesHTML}</div>` : ''}
                
                <div class="post-actions">
                    <button class="btn btn-approve" onclick="handleApprovePost('${post.id}')">Aprobar</button>
                    <button class="btn btn-reject" onclick="handleRejectPost('${post.id}')">Rechazar</button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = postsHTML;
}

async function handleApprovePost(postId) {
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    if (postCard) {
        const buttons = postCard.querySelectorAll('.post-actions button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        await approvePost(postId);
        
        if (postCard) {
            postCard.style.opacity = '0.5';
            postCard.style.pointerEvents = 'none';
            setTimeout(() => {
                postCard.remove();
                const remainingPosts = document.querySelectorAll('.post-card');
                if (remainingPosts.length === 0) {
                    const container = document.getElementById('posts-container');
                    if (container) {
                        container.innerHTML = `<div class="empty-state"><p>No hay más posts pendientes</p></div>`;
                    }
                }
            }, 500);
        }
        
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showSuccess('Post aprobado correctamente', messageContainer);
        }
    } catch (error) {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showError(error.message || 'Error al aprobar el post', messageContainer);
        }
        
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

async function handleRejectPost(postId) {
    if (!confirm('¿Estás seguro de que deseas rechazar este post?')) {
        return;
    }
    
    const postCard = document.querySelector(`[data-post-id="${postId}"]`);
    if (postCard) {
        const buttons = postCard.querySelectorAll('.post-actions button');
        buttons.forEach(btn => btn.disabled = true);
    }
    
    try {
        await rejectPost(postId);
        
        if (postCard) {
            postCard.style.opacity = '0.5';
            postCard.style.pointerEvents = 'none';
            setTimeout(() => {
                postCard.remove();
                const remainingPosts = document.querySelectorAll('.post-card');
                if (remainingPosts.length === 0) {
                    const container = document.getElementById('posts-container');
                    if (container) {
                        container.innerHTML = `<div class="empty-state"><p>No hay más posts pendientes</p></div>`;
                    }
                }
            }, 500);
        }
        
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showSuccess('Post rechazado correctamente', messageContainer);
        }
    } catch (error) {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            showError(error.message || 'Error al rechazar el post', messageContainer);
        }
        
        if (postCard) {
            const buttons = postCard.querySelectorAll('.post-actions button');
            buttons.forEach(btn => btn.disabled = false);
        }
    }
}

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

async function loadPosts() {
    const container = document.getElementById('posts-container');
    const loadingContainer = document.getElementById('loading-container');
    const messageContainer = document.getElementById('message-container');
    
    if (loadingContainer) {
        loadingContainer.style.display = 'block';
    }
    if (container) {
        container.innerHTML = '';
    }
    
    try {
        const posts = await getPosts();
        
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
        if (container) {
            renderPosts(posts, container);
        }
        
        if (!posts || posts.length === 0) {
            if (messageContainer) {
                showSuccess('Sin publicaciones pendientes', messageContainer);
            }
        }
    } catch (error) {
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
        
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

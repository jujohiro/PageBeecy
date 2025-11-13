const MOCK_POSTS = [
    {
        id: '1',
        content: 'Esta es una publicación de prueba para el panel de moderación. El contenido puede variar según el tipo de publicación.',
        images: ['https://via.placeholder.com/400x300?text=Imagen+1', 'https://via.placeholder.com/400x300?text=Imagen+2', 'https://via.placeholder.com/400x300?text=Imagen+3', 'https://via.placeholder.com/400x300?text=Imagen+4', 'https://via.placeholder.com/400x300?text=Imagen+5'],
        user: {
            id: 'user123',
            name: 'Juan Pérez'
        },
        createdAt: new Date().toISOString()
    },
    {
        id: '2',
        content: 'Otra publicación de ejemplo con contenido diferente para demostrar la funcionalidad del panel de moderación.',
        images: ['https://via.placeholder.com/400x300?text=Imagen+A', 'https://via.placeholder.com/400x300?text=Imagen+B'],
        user: {
            id: 'user456',
            name: 'María González'
        },
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: '3',
        content: 'Publicación sin imágenes para mostrar diferentes casos de uso en el panel de moderación.',
        images: [],
        user: {
            id: 'user789',
            name: 'Carlos Rodríguez'
        },
        createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: '4',
        content: 'Esta publicación tiene una sola imagen para verificar cómo se muestra en el diseño compacto.',
        images: ['https://via.placeholder.com/400x300?text=Solo+1'],
        user: {
            id: 'user101',
            name: 'Ana Martínez'
        },
        createdAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
        id: '5',
        content: 'Publicación con múltiples imágenes para probar el contador de imágenes adicionales.',
        images: ['https://via.placeholder.com/400x300?text=1', 'https://via.placeholder.com/400x300?text=2', 'https://via.placeholder.com/400x300?text=3', 'https://via.placeholder.com/400x300?text=4', 'https://via.placeholder.com/400x300?text=5', 'https://via.placeholder.com/400x300?text=6'],
        user: {
            id: 'user202',
            name: 'Luis Fernández'
        },
        createdAt: new Date(Date.now() - 14400000).toISOString()
    },
    {
        id: '6',
        content: 'Otra publicación de prueba con contenido variado para el panel de moderación.',
        images: ['https://via.placeholder.com/400x300?text=X', 'https://via.placeholder.com/400x300?text=Y', 'https://via.placeholder.com/400x300?text=Z'],
        user: {
            id: 'user303',
            name: 'Sofía López'
        },
        createdAt: new Date(Date.now() - 18000000).toISOString()
    }
];

async function getPosts(filters = {}) {
    return MOCK_POSTS;
}

async function approvePost(postId) {
    return { success: true, message: 'Post aprobado' };
}

async function rejectPost(postId) {
    return { success: true, message: 'Post rechazado' };
}

function renderPosts(posts, container) {
    if (!container) return;
    
    if (!posts || posts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>Sin publicaciones pendientes</p></div>';
        return;
    }
    
    const postsHTML = posts.map(post => {
        const images = post.images || [];
        const imagesHTML = images.length > 0
            ? images.slice(0, 4).map(img => `<img src="${escapeHtml(img)}" alt="Imagen" class="post-image-thumbnail" loading="lazy" onclick="viewImage('${escapeHtml(img)}')">`).join('')
            : '';
        
        const userName = post.user?.name || post.userName || 'Usuario desconocido';
        const userId = post.user?.id || post.userId || '';
        const createdAt = formatDate(post.createdAt || post.created_at);
        const postContent = post.content ? escapeHtml(post.content) : '';
        const postId = escapeHtml(post.id);
        const imageCount = images.length > 4 ? `+${images.length - 4}` : '';
        
        return `<div class="post-card" data-post-id="${postId}">
            <div class="post-content-wrapper">
                <div class="post-header">
                    <div class="post-user-info">
                        <span class="user-name">${escapeHtml(userName)}</span>
                        ${userId ? `<span class="user-id">ID: ${escapeHtml(String(userId))}</span>` : ''}
                    </div>
                    <span class="post-date">${escapeHtml(createdAt)}</span>
                </div>
                ${postContent ? `<div class="post-content"><p>${postContent}</p></div>` : ''}
                ${imagesHTML ? `<div class="post-images">${imagesHTML}${imageCount ? `<span class="image-count">${imageCount}</span>` : ''}</div>` : ''}
            </div>
            <div class="post-actions">
                <button class="btn btn-approve" onclick="handleApprovePost('${postId}')">Aprobar</button>
                <button class="btn btn-reject" onclick="handleRejectPost('${postId}')">Rechazar</button>
            </div>
        </div>`;
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
                        container.innerHTML = '<div class="empty-state"><p>No hay más posts pendientes</p></div>';
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
                        container.innerHTML = '<div class="empty-state"><p>No hay más posts pendientes</p></div>';
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
    return String(text).replace(/[&<>"']/g, m => map[m]);
}

function viewImage(imageUrl) {
    window.open(imageUrl, '_blank');
}

async function loadPosts() {
    const container = document.getElementById('posts-container');
    const messageContainer = document.getElementById('message-container');
    
    if (container) {
        container.innerHTML = '';
    }
    
    try {
        const posts = await getPosts();
        if (container) {
            renderPosts(posts, container);
        }
        if (!posts || posts.length === 0) {
            if (messageContainer) {
                showSuccess('Sin publicaciones pendientes', messageContainer);
            }
        }
    } catch (error) {
        if (container) {
            container.innerHTML = `<div class="error-state">
                <p>Error al cargar los posts</p>
                <p class="error-details">${escapeHtml(error.message || 'Error desconocido')}</p>
            </div>`;
        }
        if (messageContainer) {
            showError(error.message || 'Error al cargar los posts', messageContainer);
        }
    }
}

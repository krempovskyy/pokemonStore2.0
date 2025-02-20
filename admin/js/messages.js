let currentPage = 1;
let currentStatus = 'all';
let currentSearch = '';
let totalPages = 1;
let messageModal = null;

// DOM Elements
const messagesTableBody = document.getElementById('messagesTableBody');
const messagesPagination = document.getElementById('messagesPagination');
const searchInput = document.getElementById('searchMessages');
const statusButtons = document.querySelectorAll('.btn-group button[data-status]');
const viewMessageModal = new bootstrap.Modal(document.getElementById('viewMessageModal'));

document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadMessages();

    // Initialize event listeners
    initializeEventListeners();
});

function initializeEventListeners() {
    // Status filter handlers
    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentStatus = button.dataset.status;
            currentPage = 1;
            loadMessages();
        });
    });

    // Search input handler
    searchInput.addEventListener('input', debounce(() => {
        currentSearch = searchInput.value;
        currentPage = 1;
        loadMessages();
    }, 300));

    // Delete message button handler
    document.getElementById('deleteMessage').addEventListener('click', () => {
        const messageId = document.getElementById('viewMessageModal').dataset.messageId;
        if (messageId) {
            deleteMessage(messageId);
        }
    });
}

async function loadMessages() {
    try {
        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;

        const params = new URLSearchParams({
            page: currentPage,
            limit: 10
        });
        
        if (currentStatus !== 'all') {
            params.append('status', currentStatus);
        }
        
        if (currentSearch) {
            params.append('search', currentSearch);
        }

        const response = await fetch(`/admin/api/messages.php?${params}`);
        const data = await response.json();
        
        if (data.success) {
            renderMessages(data.data.messages);
            renderPagination(data.data.pagination);
            updateUnreadCount();
        } else {
            throw new Error(data.message || 'Failed to load messages');
        }
    } catch (error) {
        console.error('Error:', error);
        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-danger">
                    <i class="fas fa-exclamation-circle fa-2x mb-3"></i>
                    <p>Failed to load messages. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

function renderMessages(messages) {
    if (!messages || messages.length === 0) {
        messagesTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                    <p class="text-muted">No messages found</p>
                </td>
            </tr>
        `;
        return;
    }

    messagesTableBody.innerHTML = messages.map(message => `
        <tr class="${message.message_status === 'unread' ? 'table-active' : ''}" data-id="${message.message_id}">
            <td>${formatDate(message.created_at)}</td>
            <td>${escapeHtml(message.name)}</td>
            <td>${escapeHtml(message.email)}</td>
            <td>${escapeHtml(message.subject || 'No Subject')}</td>
            <td>
                <span class="badge ${message.message_status === 'unread' ? 'bg-primary' : 'bg-secondary'}">
                    ${message.message_status}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary view-message" onclick="viewMessage(${message.message_id})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-danger delete-message" onclick="deleteMessage(${message.message_id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function renderPagination(pagination) {
    if (!pagination || pagination.totalPages <= 1) {
        messagesPagination.innerHTML = '';
        return;
    }

    let html = '';
    
    // Previous button
    html += `
        <li class="page-item ${pagination.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${pagination.currentPage - 1}); return false;">
                Previous
            </a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || 
            (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)) {
            html += `
                <li class="page-item ${i === pagination.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i}); return false;">${i}</a>
                </li>
            `;
        } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
            html += `
                <li class="page-item disabled">
                    <span class="page-link">...</span>
                </li>
            `;
        }
    }

    // Next button
    html += `
        <li class="page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${pagination.currentPage + 1}); return false;">
                Next
            </a>
        </li>
    `;

    messagesPagination.innerHTML = html;
}

async function viewMessage(messageId) {
    try {
        const response = await fetch(`/admin/api/messages.php?id=${messageId}`);
        const data = await response.json();
        
        if (data.success && data.data.message) {
            const message = data.data.message;
            
            // Update modal content
            document.getElementById('modalName').textContent = message.name;
            document.getElementById('modalEmail').textContent = message.email;
            document.getElementById('modalSubject').textContent = message.subject || 'No Subject';
            document.getElementById('modalDate').textContent = formatDate(message.created_at);
            document.getElementById('modalMessage').textContent = message.message;
            
            // Store message ID in modal
            document.getElementById('viewMessageModal').dataset.messageId = message.message_id;

            // Show modal
            viewMessageModal.show();

            // If message is unread, mark it as read
            if (message.message_status === 'unread') {
                await updateMessageStatus(messageId, 'read');
            }
        } else {
            throw new Error(data.message || 'Failed to load message details');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load message details. Please try again.');
    }
}

async function updateMessageStatus(messageId, status) {
    try {
        const response = await fetch('/admin/api/messages.php', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: messageId,
                status: status
            })
        });

        const data = await response.json();
        
        if (data.success) {
            loadMessages();
            updateUnreadCount();
        } else {
            throw new Error(data.message || 'Failed to update message status');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
        try {
            const response = await fetch(`/admin/api/messages.php?id=${messageId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            
            if (data.success) {
                viewMessageModal.hide();
                loadMessages();
                updateUnreadCount();
            } else {
                throw new Error(data.message || 'Failed to delete message');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete message. Please try again.');
        }
    }
}

function changePage(page) {
    currentPage = page;
    loadMessages();
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function updateUnreadCount() {
    try {
        const response = await fetch('/admin/api/messages.php?status=unread&limit=1');
        const data = await response.json();
        
        if (data.success) {
            const unreadCount = data.data.pagination.totalItems;
            const unreadBadges = document.querySelectorAll('.unread-count');
            
            unreadBadges.forEach(badge => {
                if (unreadCount > 0) {
                    badge.textContent = unreadCount;
                    badge.style.display = 'inline-block';
                } else {
                    badge.style.display = 'none';
                }
            });
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
} 
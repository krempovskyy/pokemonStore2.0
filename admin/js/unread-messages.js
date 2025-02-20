// Function to update unread messages count
async function updateUnreadCount() {
    try {
        const response = await fetch('/admin/api/messages.php?status=unread&limit=1');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success) {
            const unreadCount = data.data.pagination.totalItems;
            const badge = document.querySelector('.unread-count');
            
            if (unreadCount > 0) {
                badge.textContent = unreadCount;
                badge.style.display = 'inline-block';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating unread count:', error);
    }
}

// Update count when page loads
document.addEventListener('DOMContentLoaded', updateUnreadCount);

// Update count every minute
setInterval(updateUnreadCount, 60000); 
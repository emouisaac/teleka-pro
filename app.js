function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    sidebar.classList.toggle('open');
}

function closeSidebarOnClickOutside(event) {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.getElementById('adminSidebarToggle');
    if (!sidebar || !sidebar.classList.contains('open') || window.innerWidth > 768) return;
    if (event.target.closest('.sidebar') || event.target.closest('#adminSidebarToggle')) return;
    sidebar.classList.remove('open');
}

function resetSidebarOnResize() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;
    if (window.innerWidth > 768) {
        sidebar.classList.remove('open');
    }
}

// Admin authentication
async function checkAdminAuth() {
    try {
        const response = await fetch('/auth/status', { credentials: 'include' });
        const data = await response.json();
        if (data.authenticated && data.user && data.user.role === 'admin') {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.content');
            const topbar = document.querySelector('.topbar');
            if (sidebar) sidebar.classList.remove('hidden');
            if (content) content.classList.remove('hidden');
            if (topbar) topbar.classList.remove('hidden');
            const authPanel = document.getElementById('adminAuthPanel');
            if (authPanel) authPanel.classList.add('hidden');
            if (window.location.pathname !== '/admin.html') {
                window.location.href = '/admin.html';
            }
        } else {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.content');
            const topbar = document.querySelector('.topbar');
            if (sidebar) sidebar.classList.add('hidden');
            if (content) content.classList.add('hidden');
            if (topbar) topbar.classList.add('hidden');
            const authPanel = document.getElementById('adminAuthPanel');
            if (authPanel) authPanel.classList.remove('hidden');
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        document.querySelector('.sidebar').classList.add('hidden');
        document.querySelector('.content').classList.add('hidden');
        document.querySelector('.topbar').classList.add('hidden');
        document.getElementById('adminAuthPanel').classList.remove('hidden');
    }
}

document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    try {
        const response = await fetch('/auth/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            document.querySelector('.sidebar').classList.remove('hidden');
            document.querySelector('.content').classList.remove('hidden');
            document.querySelector('.topbar').classList.remove('hidden');
            document.getElementById('adminAuthPanel').classList.add('hidden');
            if (window.location.pathname !== '/admin.html') {
                window.location.href = '/admin.html';
            }
        } else {
            alert(data.message || 'Invalid credentials');
        }
    } catch (error) {
        console.error('Login failed:', error);
        alert('Login failed');
    }
});

document.getElementById('adminSidebarLogout').addEventListener('click', async function() {
    try {
        await fetch('/auth/admin/logout', { method: 'POST', credentials: 'include' });
        checkAdminAuth();
    } catch (error) {
        console.error('Logout failed:', error);
    }
});

// Check auth on load
document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    loadDriverApplications();

    document.addEventListener('click', closeSidebarOnClickOutside);
    window.addEventListener('resize', resetSidebarOnResize);
});

async function loadDriverApplications() {
    try {
        const response = await fetch('/api/drivers/pending', { credentials: 'include' });
        const drivers = await response.json();
        if (!Array.isArray(drivers)) {
            console.error('loadDriverApplications expected array but got', drivers);
            return;
        }
        const tbody = document.getElementById('driverApplicationsBody');
        if (!tbody) return;
        tbody.innerHTML = '';

        drivers.forEach(driver => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${driver.name}</td>
                <td>${driver.phone}</td>
                <td>${driver.vehicle_info}</td>
                <td><button class="btn small" onclick="viewDocuments(${driver.id})">View</button></td>
                <td><span class="status-badge pending">${driver.status}</span></td>
                <td>
                    <button class="btn small primary" onclick="approveDriver(${driver.id})">Approve</button>
                    <button class="btn small secondary" onclick="rejectDriver(${driver.id})">Reject</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Failed to load driver applications:', error);
    }
}

async function approveDriver(driverId) {
    try {
        const response = await fetch(`/api/drivers/approve/${driverId}`, {
            method: 'POST',
            credentials: 'include'
        });
        const data = await response.json();
        if (data.success) {
            loadDriverApplications();
            alert('Driver approved successfully');
        } else {
            alert('Failed to approve driver');
        }
    } catch (error) {
        console.error('Approval failed:', error);
        alert('Approval failed');
    }
}

async function rejectDriver(driverId) {
    if (confirm('Are you sure you want to reject this driver application?')) {
        try {
            const response = await fetch(`/api/drivers/reject/${driverId}`, {
                method: 'POST',
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                loadDriverApplications();
                alert('Driver application rejected');
            } else {
                alert('Failed to reject driver');
            }
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Rejection failed');
        }
    }
}

function viewDocuments(driverId) {
    // For now, just show a placeholder
    alert('Document viewing not implemented yet. Driver ID: ' + driverId);
}

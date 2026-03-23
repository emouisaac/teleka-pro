// Provide Google client ID to the page via JS global (injected by server)
window.GOOGLE_CLIENT_ID = '{{GOOGLE_CLIENT_ID}}';

function toggleMobileMenu() {
    const menu = document.querySelector('.navbar-menu');
    const toggle = document.querySelector('.navbar-toggle');
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
}

// Authentication functions
async function checkAuthStatus() {
    try {
        const response = await fetch('/auth/status', { credentials: 'include' });
        const data = await response.json();
        updateAuthUI(data.authenticated, data.user);
    } catch (error) {
        console.error('Auth check failed:', error);
    }
}

function updateAuthUI(authenticated, user) {
    const authLink = document.getElementById('auth-action');
    if (authenticated && user) {
        authLink.textContent = `Logout (${user.name})`;
        authLink.onclick = handleLogout;
    } else {
        authLink.textContent = 'Login';
        authLink.onclick = handleAuthClick;
    }
}

function handleAuthClick(event) {
    event.preventDefault();
    window.location.href = '/auth/google';
}

async function handleLogout(event) {
    event.preventDefault();
    try {
        await fetch('/auth/admin/logout', { method: 'POST', credentials: 'include' });
        window.location.reload();
    } catch (error) {
        console.error('Logout failed:', error);
    }
}

// Initialize Google Sign-In
function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: '275353277028-m8u8c8pq73jj0a2ds4n6eikj43hpklf8.apps.googleusercontent.com',
        callback: handleGoogleSignIn
    });
}

function handleGoogleSignIn(response) {
    // This is handled by the server-side OAuth flow
    window.location.reload();
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    if (typeof google !== 'undefined') {
        initializeGoogleSignIn();
    }
});
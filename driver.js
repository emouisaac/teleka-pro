/**
 * Driver Dashboard Application
 * Manages authentication, navigation, and responsive UI for driver portal
 */

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let driverToken = localStorage.getItem('driverToken');
let resizeTimeout; // For debouncing resize events

// DOM Element Cache - Cached for performance
const DOM = {
    sidebar: null,
    authPanel: null,
    dashboard: null,
    menuToggle: null,
    driverName: null,
    loginForm: null,
    registerForm: null,
    navLinks: null,
    sidebarLogoutBtn: null,

    init() {
        this.sidebar = document.querySelector('.driver-sidebar');
        this.authPanel = document.getElementById('driverAuthPanel');
        this.dashboard = document.getElementById('dashboard');
        this.menuToggle = document.getElementById('menuToggle');
        this.driverName = document.getElementById('driverName');
        this.loginForm = document.getElementById('driverLoginForm');
        this.registerForm = document.getElementById('driverRegisterForm');
        this.navLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');
        this.sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    }
};

// ============================================================================
// RESPONSIVE MENU MANAGEMENT
// ============================================================================

/**
 * Toggle sidebar menu visibility on mobile/tablet
 */
function toggleDriverMenu() {
    if (!DOM.sidebar) return;
    DOM.sidebar.classList.toggle('open');
    DOM.menuToggle?.setAttribute('aria-expanded', DOM.sidebar.classList.contains('open'));
}

/**
 * Close sidebar when clicking outside on mobile/tablet screens
 * Respects visibility breakpoint (768px)
 */
function closeDriverMenuOnClickOutside(event) {
    if (!DOM.sidebar || !DOM.sidebar.classList.contains('open')) return;
    if (window.innerWidth > 768) return;
    
    const isClickInside = event.target.closest('.driver-sidebar') || event.target.closest('#menuToggle');
    if (!isClickInside) {
        DOM.sidebar.classList.remove('open');
        DOM.menuToggle?.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Reset sidebar state on window resize
 * Uses debouncing to prevent excessive function calls
 */
function resetDriverMenuOnResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (!DOM.sidebar) return;
        if (window.innerWidth > 768) {
            DOM.sidebar.classList.remove('open');
            DOM.menuToggle?.setAttribute('aria-expanded', 'false');
        }
    }, 150); // Debounce delay
}

// ============================================================================
// SECTION & NAVIGATION MANAGEMENT
// ============================================================================

/**
 * Switch between dashboard sections with smooth transitions
 * Updates active nav links and handles responsive closing
 * @param {string} sectionId - The ID of the section to display
 */
function switchSection(sectionId) {
    // Deactivate all sections
    document.querySelectorAll('.driver-section').forEach(section => {
        section.classList.remove('active');
    });

    // Activate target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update active nav links
    DOM.navLinks?.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === sectionId) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        } else {
            link.removeAttribute('aria-current');
        }
    });

    // Close sidebar on small screens after section switch
    if (window.innerWidth <= 768 && DOM.sidebar) {
        DOM.sidebar.classList.remove('open');
        DOM.menuToggle?.setAttribute('aria-expanded', 'false');
    }
}

/**
 * Initialize navigation event listeners using event delegation
 */
function initializeNavigation() {
    DOM.navLinks?.forEach(link => {
        link.addEventListener('click', function(e) {
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                e.preventDefault();
                switchSection(sectionId);
            }
        });
    });
}

// ============================================================================
// AUTHENTICATION & SESSION MANAGEMENT
// ============================================================================

/**
 * Verify driver authentication on page load
 * Checks stored token validity with backend
 */
async function checkDriverAuth() {
    if (!driverToken) {
        showDriverAuth();
        return;
    }

    try {
        const response = await fetch('/auth/driver/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: driverToken }),
            signal: AbortSignal.timeout(5000) // 5 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.valid && data.driver) {
            showDriverDashboard(data.driver);
        } else {
            driverToken = null;
            localStorage.removeItem('driverToken');
            showDriverAuth();
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        showDriverAuth();
    }
}

/**
 * Display authentication panel and hide dashboard navigation
 */
function showDriverAuth() {
    if (DOM.authPanel) DOM.authPanel.classList.add('active');
    
    document.querySelectorAll('.driver-section:not(#driverAuthPanel)').forEach(section => {
        section.classList.remove('active');
    });

    const driverSidebar = document.getElementById('driverSidebar');
    const driverFooter = document.querySelector('.driver-bottom-nav');
    const driverTopbar = document.querySelector('.driver-topbar');

    if (driverSidebar) driverSidebar.style.display = 'none';
    if (driverFooter) driverFooter.style.display = 'none';
    if (driverTopbar) driverTopbar.style.display = 'none';
}

/**
 * Display driver dashboard and show navigation
 * @param {object} driver - Driver data object with user information
 */
function showDriverDashboard(driver) {
    if (DOM.authPanel) DOM.authPanel.classList.remove('active');
    if (DOM.dashboard) DOM.dashboard.classList.add('active');

    const driverSidebar = document.getElementById('driverSidebar');
    const driverTopbar = document.querySelector('.driver-topbar');
    const driverFooter = document.querySelector('.driver-bottom-nav');

    if (driverSidebar) driverSidebar.style.display = '';
    if (driverTopbar) driverTopbar.style.display = '';
    if (driverFooter) driverFooter.style.display = '';

    // Update UI with driver information
    if (DOM.driverName && driver.name) {
        DOM.driverName.textContent = driver.name;
    }

    // Mark dashboard as active
    const dashboardLink = document.querySelector('[data-section="dashboard"]');
    if (dashboardLink) {
        dashboardLink.classList.add('active');
        dashboardLink.setAttribute('aria-current', 'page');
    }
}

/**
 * Clear authentication and return to login screen
 */
function logout() {
    driverToken = null;
    localStorage.removeItem('driverToken');
    showDriverAuth();
}

// ============================================================================
// FORM HANDLING
// ============================================================================

/**
 * Handle driver login form submission
 */
async function handleLoginSubmit(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!submitButton) return;

    const email = document.getElementById('driverLoginEmail')?.value?.trim();
    const password = document.getElementById('driverLoginPassword')?.value;

    if (!email || !password) {
        showError('Please enter both email and password');
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        const response = await fetch('/auth/driver/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            signal: AbortSignal.timeout(8000) // 8 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.token) {
            driverToken = data.token;
            localStorage.setItem('driverToken', driverToken);
            showDriverDashboard(data.driver);
        } else {
            showError(data.error || 'Login failed. Please try again.');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(error.name === 'AbortError' ? 'Request timeout. Please try again.' : 'Login failed. Please check your connection.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
}

/**
 * Handle driver registration form submission
 */
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    if (!submitButton) return;

    const formData = {
        name: document.getElementById('registerName')?.value?.trim(),
        email: document.getElementById('registerEmail')?.value?.trim(),
        phone: document.getElementById('registerPhone')?.value?.trim(),
        vehicleInfo: document.getElementById('registerVehicle')?.value?.trim(),
        licenseNumber: document.getElementById('registerLicenseNumber')?.value?.trim(),
        password: document.getElementById('registerPassword')?.value
    };

    // Validation
    if (!Object.values(formData).every(val => val)) {
        showError('Please fill in all fields');
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = 'Registering...';

        const response = await fetch('/auth/driver/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
            signal: AbortSignal.timeout(8000) // 8 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
            showSuccess(data.message || 'Registration submitted successfully!');
            switchAuthForm('login');
            e.target.reset();
        } else {
            showError(data.error || 'Registration failed. Please try again.');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.name === 'AbortError' ? 'Request timeout. Please try again.' : 'Registration failed. Please check your connection.');
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Register';
    }
}

/**
 * Switch between login and registration forms
 * @param {string} formType - 'login' or 'register'
 */
function switchAuthForm(formType) {
    const loginCard = document.querySelector('.driver-auth-card--login');
    const registerCard = document.getElementById('driverRegisterCard');

    if (formType === 'login') {
        loginCard?.classList.remove('hidden');
        registerCard?.classList.add('hidden');
    } else if (formType === 'register') {
        loginCard?.classList.add('hidden');
        registerCard?.classList.remove('hidden');
    }
}

// ============================================================================
// USER FEEDBACK
// ============================================================================

/**
 * Display error message to user
 * @param {string} message - Error message text
 */
function showError(message) {
    console.error('Error:', message);
    const errorEl = document.createElement('div');
    errorEl.className = 'notification notification--error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;
    document.body.appendChild(errorEl);
    
    setTimeout(() => {
        errorEl.classList.add('fade-out');
        setTimeout(() => errorEl.remove(), 300);
    }, 4000);
}

/**
 * Display success message to user
 * @param {string} message - Success message text
 */
function showSuccess(message) {
    const successEl = document.createElement('div');
    successEl.className = 'notification notification--success';
    successEl.setAttribute('role', 'status');
    successEl.textContent = message;
    document.body.appendChild(successEl);
    
    setTimeout(() => {
        successEl.classList.add('fade-out');
        setTimeout(() => successEl.remove(), 300);
    }, 3000);
}

// ============================================================================
// EVENT LISTENERS INITIALIZATION
// ============================================================================

/**
 * Initialize all event listeners and set up the application
 */
function initializeEventListeners() {
    // Menu toggle
    DOM.menuToggle?.addEventListener('click', toggleDriverMenu);

    // Outside click handler
    document.addEventListener('click', closeDriverMenuOnClickOutside);

    // Window resize handler with debouncing
    window.addEventListener('resize', resetDriverMenuOnResize);

    // Form submissions
    if (DOM.loginForm) {
        DOM.loginForm.addEventListener('submit', handleLoginSubmit);
    }
    if (DOM.registerForm) {
        DOM.registerForm.addEventListener('submit', handleRegistrationSubmit);
    }

    // Form toggle buttons
    document.getElementById('showRegisterForm')?.addEventListener('click', () => switchAuthForm('register'));
    document.getElementById('showLoginForm')?.addEventListener('click', () => switchAuthForm('login'));

    // Logout button
    DOM.sidebarLogoutBtn?.addEventListener('click', logout);
}

// ============================================================================
// APPLICATION INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    DOM.init();
    initializeNavigation();
    initializeEventListeners();
    checkDriverAuth();
});

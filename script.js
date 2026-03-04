const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

navbarToggle.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    navbarToggle.classList.toggle('active');
});

// Dark Mode Toggle from Settings
const darkModeToggle = document.querySelector('#dark-mode-toggle');

// Check for saved dark mode preference in localStorage or system settings
function initDarkMode() {
    let isDarkMode;
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
        isDarkMode = stored === 'true';
    } else if (window.matchMedia) {
        // default to system preference if no value stored yet
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
        isDarkMode = false;
    }

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        if (darkModeToggle) darkModeToggle.checked = false;
    }
}

// Initialize dark mode on page load
initDarkMode();

// Toggle dark mode via settings checkbox
if (darkModeToggle) {
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
    });
}

// Function to switch sections from navbar clicks
function switchSection(sectionId) {
    const sections = document.querySelectorAll('.content .section');
    sections.forEach(sec => {
        if (sec.id === sectionId) {
            sec.classList.add('active');
        } else {
            sec.classList.remove('active');
        }
    });

    // Update sidebar active state if sidebar exists
    const sidebarItems = document.querySelectorAll('.sidebar-menu li[data-section]');
    sidebarItems.forEach(item => {
        if (item.getAttribute('data-section') === sectionId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Close mobile menu after selection
    navbarMenu.classList.remove('active');
    navbarToggle.classList.remove('active');
}

// Logout function
function logout() {
    alert('Logged out successfully!');
    // You can add redirect or clear session here
    switchSection('dashboard');
}

// sidebar navigation in dashboard
const sidebarItems = document.querySelectorAll('.sidebar-menu li[data-section]');
const sections = document.querySelectorAll('.content .section');

sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        // toggle active class on sidebar items
        sidebarItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        const target = item.getAttribute('data-section');
        sections.forEach(sec => {
            if (sec.id === target) {
                sec.classList.add('active');
            } else {
                sec.classList.remove('active');
            }
        });
    });
});

// simple form submissions placeholders
const rideForm = document.querySelector('.ride-form');
if (rideForm) {
    rideForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Ride request submitted!');
        rideForm.reset();
    });
}

const profileForm = document.querySelector('.profile-form');
if (profileForm) {
    profileForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Profile updated!');
    });
}

const settingsForm = document.querySelector('.settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', e => {
        e.preventDefault();
        alert('Settings saved!');
    });
}
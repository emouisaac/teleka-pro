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

// Hero slider logic
function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-content h1');
    if (slides.length === 0) return;
    let current = 0;
    slides.forEach((s, i) => s.style.color = '');
    slides[current].classList.add('active');
    slides[current].style.color = 'orange';
    setInterval(() => {
        const prev = slides[current];
        prev.classList.remove('active');
        prev.classList.add('exit');
        // prepare next
        current = (current + 1) % slides.length;
        const next = slides[current];
        next.classList.remove('exit');
        next.classList.add('active');
        slides.forEach((s,i)=>{
            s.style.color = i === current ? 'orange' : '';
        });
    }, 3000);
}

// initialize hero slider on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initHeroSlider);

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

// Add icons to service cards
function addServiceIcons() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    const icons = {
        'Airport Transfers': `<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
        'City Rides': `<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
        'Business Travel': `<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M20 7h-4V5l-2-2h-4L8 5v2H4c-1.1 0-2 .9-2 2v5c0 .75.4 1.38 1 1.73V19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-3.27c.59-.36 1-.98 1-1.73V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zM4 9h16v5h-5v-3H9v3H4V9zm9 6h-2v1h-2v-1H9v-1h2v1zm4 4H7v-1h1v-1h8v1h1v1z"/></svg>`,
        'Tours Travel': `<svg width="40" height="40" viewBox="0 0 24 24" fill="white"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 1.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-1.1L3 19V6.5l6-1.1 6 1.1V19zm3-14.5V17l-5-.9V5.1l5-.9z"/></svg>`
    };
    
    serviceCards.forEach(card => {
        const title = card.querySelector('h3').textContent.trim();
        const iconDiv = card.querySelector('.service-icon');
        if (iconDiv && icons[title]) {
            iconDiv.innerHTML = icons[title];
        }
    });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', addServiceIcons);
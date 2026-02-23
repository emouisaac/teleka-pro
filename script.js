// Mobile menu toggle
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

navbarToggle.addEventListener('click', () => {
    navbarToggle.classList.toggle('active');
    navbarMenu.classList.toggle('active');
});

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
body.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Smooth scrolling for navigation links
document.querySelectorAll('.navbar-menu a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 70; // Height of fixed navbar
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }

        // Close mobile menu after clicking a link
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
    });
});

// Add scroll effect to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    const currentTheme = body.getAttribute('data-theme');
    
    if (window.scrollY > 50) {
        if (currentTheme === 'dark') {
            navbar.style.background = 'rgba(10, 20, 37, 0.95)';
        } else {
            navbar.style.background = 'rgba(44, 62, 80, 0.95)';
        }
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = currentTheme === 'dark' ? 
            'linear-gradient(135deg, #0a1425 0%, #1a3a52 100%)' : 
            'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)';
        navbar.style.backdropFilter = 'none';
    }
});

// Booking button functionality
document.getElementById('bookingbtn').addEventListener('click', () => {
    // If user not logged in, encourage login but allow guest booking
    const session = sessionStorage.getItem('customerSession');
    if (!session) {
        // open auth prompt (optional)
        document.getElementById('authModal').classList.add('show');
        return;
    }
    document.getElementById('bookingModal').classList.add('show');
});

// Close modal
document.getElementById('closeBooking').addEventListener('click', () => {
    document.getElementById('bookingModal').classList.remove('show');
});

// Auth modal open/close handlers
document.getElementById('openLogin').addEventListener('click', (e) => { e.preventDefault(); document.getElementById('authModal').classList.add('show'); });
document.getElementById('closeAuth').addEventListener('click', () => { document.getElementById('authModal').classList.remove('show'); });
window.addEventListener('click', (e) => { if (e.target === document.getElementById('authModal')) document.getElementById('authModal').classList.remove('show'); });

// Auth panel switch handlers
document.getElementById('showRegister').addEventListener('click', (e) => { 
    e.preventDefault(); 
    document.getElementById('loginPanel').style.display = 'none'; 
    document.getElementById('registerPanel').style.display = 'block'; 
});
document.getElementById('showLogin').addEventListener('click', (e) => { 
    e.preventDefault(); 
    document.getElementById('registerPanel').style.display = 'none'; 
    document.getElementById('loginPanel').style.display = 'block'; 
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('bookingModal');
    if (e.target === modal) {
        modal.classList.remove('show');
    }
});

// Booking form submission
document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        id: 'REQ' + Date.now(),
        pickup: document.getElementById('pickup').value,
        dropoff: document.getElementById('dropoff').value,
        passengerName: document.getElementById('passengerName').value,
        passengerPhone: document.getElementById('passengerPhone').value,
        passengerEmail: document.getElementById('passengerEmail').value,
        serviceType: document.getElementById('serviceType').value,
        passengers: document.getElementById('passengers').value,
        status: 'pending',
        timestamp: new Date().toISOString(),
        assignedDriver: null
    };
    // Try to POST to backend; fallback to localStorage if unavailable
    (async () => {
        try {
            const res = await fetch('/api/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error('server');
            alert('Ride request submitted — we will notify you when a driver is assigned.');
        } catch (err) {
            const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
            requests.push(formData);
            localStorage.setItem('rideRequests', JSON.stringify(requests));
            alert('Offline: ride saved locally. It will sync when the server is available.');
        } finally {
            document.getElementById('bookingForm').reset();
            document.getElementById('bookingModal').classList.remove('show');
            notifyNewRequest(formData);
        }
    })();
});

// Function to notify admin and drivers of new request
function notifyNewRequest(request) {
    // This will be picked up by admin and driver dashboards
    // try server notifications endpoint
    (async () => {
        try {
            await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'new_request', message: `New ride request from ${request.passengerName}`, data: request }) });
            return;
        } catch (e) {
            const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
            notifications.push({ id: 'NOTIF' + Date.now(), type: 'new_request', message: `New ride request from ${request.passengerName}`, data: request, timestamp: new Date().toISOString(), read: false });
            localStorage.setItem('notifications', JSON.stringify(notifications));
        }
    })();
}

// Initialize sample data if none exists
document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('rideRequests')) {
        const sampleRequests = [
            {
                id: 'REQ001',
                pickup: 'Kampala City Center',
                dropoff: 'Entebbe Airport',
                passengerName: 'John Doe',
                passengerPhone: '+256700000000',
                passengerEmail: 'john@example.com',
                serviceType: 'premium',
                passengers: '2',
                status: 'pending',
                timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
                assignedDriver: null,
                fare: 45.00
            },
            {
                id: 'REQ002',
                pickup: 'Nakawa Shopping Mall',
                dropoff: 'Hotel Serena',
                passengerName: 'Jane Smith',
                passengerPhone: '+256711111111',
                passengerEmail: 'jane@example.com',
                serviceType: 'standard',
                passengers: '1',
                status: 'assigned',
                timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 min ago
                assignedDriver: 'John Smith',
                fare: 25.50
            }
        ];
        localStorage.setItem('rideRequests', JSON.stringify(sampleRequests));
    }
    
    if (!localStorage.getItem('drivers')) {
        const sampleDrivers = [
            { id: 'D001', name: 'John Smith', email: 'john@example.com' },
            { id: 'D002', name: 'Mike Johnson', email: 'mike@example.com' },
            { id: 'D003', name: 'Sarah Davis', email: 'sarah@example.com' }
        ];
        localStorage.setItem('drivers', JSON.stringify(sampleDrivers));
    }
    
    if (!localStorage.getItem('activeTrips')) {
        const sampleTrips = [
            {
                id: 'REQ002',
                driver: 'John Smith',
                customer: 'Jane Smith',
                route: 'Nakawa Shopping Mall → Hotel Serena',
                status: 'assigned',
                amount: '$25.50',
                time: new Date().toLocaleTimeString()
            }
        ];
        localStorage.setItem('activeTrips', JSON.stringify(sampleTrips));
    }
    
    if (!localStorage.getItem('driverStats')) {
        const defaultStats = {
            email: 'john@example.com',
            rating: 4.8,
            acceptanceRate: 95,
            totalTrips: 5,
            totalEarnings: 125.00,
            todayEarnings: 25.50,
            weekEarnings: 125.00,
            monthEarnings: 500.00,
            phone: '+1234567890',
            license: 'DL123456789',
            vehicle: 'Toyota Camry - ABC123'
        };
        localStorage.setItem('driverStats', JSON.stringify(defaultStats));
    }

    // If a customer session exists populate booking name/email fields for convenience
    const session = JSON.parse(sessionStorage.getItem('customerSession') || 'null');
    if (session) {
        const nameEl = document.getElementById('passengerName');
        const phoneEl = document.getElementById('passengerPhone');
        const emailEl = document.getElementById('passengerEmail');
        if (nameEl) nameEl.value = session.name || '';
        if (phoneEl) phoneEl.value = session.phone || '';
        if (emailEl) emailEl.value = session.email || '';
    }

    // Login form handling (optional accounts stored in localStorage)
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = { id: 'C' + Date.now(), name: document.getElementById('regName').value, email: document.getElementById('regEmail').value, phone: document.getElementById('regPhone').value };
        const users = JSON.parse(localStorage.getItem('customers') || '[]');
        users.push(user);
        localStorage.setItem('customers', JSON.stringify(users));
        sessionStorage.setItem('customerSession', JSON.stringify(user));
        alert('Account created and logged in.');
        document.getElementById('authModal').classList.remove('show');
        document.getElementById('bookingModal').classList.add('show');
    });

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const phone = document.getElementById('loginPhone').value;
        const users = JSON.parse(localStorage.getItem('customers') || '[]');
        const found = users.find(u => (u.email === email && u.phone === phone) || (u.email === email));
        if (found) {
            sessionStorage.setItem('customerSession', JSON.stringify(found));
            alert('Logged in.');
            document.getElementById('authModal').classList.remove('show');
            document.getElementById('bookingModal').classList.add('show');
        } else {
            alert('No account found. You can create one in the Register tab or continue as guest.');
        }
    });
});
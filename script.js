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
    document.getElementById('bookingModal').classList.add('show');
});

// Close modal
document.getElementById('closeBooking').addEventListener('click', () => {
    document.getElementById('bookingModal').classList.remove('show');
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
    
    // Save to localStorage
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
    requests.push(formData);
    localStorage.setItem('rideRequests', JSON.stringify(requests));
    
    // Show success message
    alert('Ride request submitted successfully! We will notify you when a driver is assigned.');
    
    // Reset form and close modal
    document.getElementById('bookingForm').reset();
    document.getElementById('bookingModal').classList.remove('show');
    
    // Trigger notification for admin and drivers
    notifyNewRequest(formData);
});

// Function to notify admin and drivers of new request
function notifyNewRequest(request) {
    // This will be picked up by admin and driver dashboards
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.push({
        id: 'NOTIF' + Date.now(),
        type: 'new_request',
        message: `New ride request from ${request.passengerName}`,
        data: request,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
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
});
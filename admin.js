// =====================
// UTILITY FUNCTIONS
// =====================

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// =====================
// DARK MODE TOGGLE
// =====================

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
});

// Load saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

// =====================
// SIDEBAR NAVIGATION
// =====================

const navItems = document.querySelectorAll('.nav-item');
const contentSections = document.querySelectorAll('.content-section');

// Handle navigation with smooth scrolling
document.querySelectorAll('.sidebar-nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const href = this.getAttribute('href');
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);
        
        if (target) {
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Hide all sections
            contentSections.forEach(section => section.classList.remove('active'));
            
            // Show target section
            target.classList.add('active');
            target.scrollTop = 0;
            
            // Close mobile sidebar
            closeSidebar();
        }
    });
});

// Handle hash changes (for browser back/forward buttons)
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        const target = document.getElementById(hash);
        if (target && target.classList.contains('content-section')) {
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            const activeNav = document.querySelector(`a[href="#${hash}"]`);
            if (activeNav) activeNav.classList.add('active');
            
            // Show target section
            contentSections.forEach(section => section.classList.remove('active'));
            target.classList.add('active');
            target.scrollTop = 0;
        }
    }
});

// =====================
// SIDEBAR TOGGLE (MOBILE)
// =====================

const sidebar = document.querySelector('.sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const menuToggle = document.getElementById('menuToggle');

function toggleSidebar() {
    sidebar.classList.toggle('open');
}

function closeSidebar() {
    if (window.innerWidth <= 992) {
        sidebar.classList.remove('open');
    }
}

sidebarToggle?.addEventListener('click', toggleSidebar);
menuToggle?.addEventListener('click', toggleSidebar);

// Close sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
            closeSidebar();
        }
    }
});

// =====================
// MOCK DATA
// =====================

const mockTrips = [
    { id: 'T001', driver: 'John Smith', customer: 'Alice Brown', route: 'Downtown → Airport', distance: '15.2 km', status: 'active', amount: '$28.50', time: '2:30 PM' },
    { id: 'T002', driver: 'Mike Johnson', customer: 'Bob Wilson', route: 'Mall → Hotel', distance: '8.5 km', status: 'completed', amount: '$15.75', time: '1:45 PM' },
    { id: 'T003', driver: 'Sarah Davis', customer: 'Carol White', route: 'Station → Office', distance: '12.0 km', status: 'active', amount: '$22.50', time: '2:15 PM' },
    { id: 'T004', driver: 'Tom Brown', customer: 'David Green', route: 'Home → University', distance: '5.8 km', status: 'completed', amount: '$12.25', time: '11:30 AM' },
    { id: 'T005', driver: 'Emma Wilson', customer: 'Emma Garcia', route: 'Office → Restaurant', distance: '3.2 km', status: 'active', amount: '$8.50', time: '12:45 PM' },
];

const mockDrivers = [
    { id: 'D001', name: 'John Smith', email: 'john@transport.com', license: 'DL123456', status: 'active', trips: 256, rating: 4.8 },
    { id: 'D002', name: 'Mike Johnson', email: 'mike@transport.com', license: 'DL789012', status: 'active', trips: 189, rating: 4.6 },
    { id: 'D003', name: 'Sarah Davis', email: 'sarah@transport.com', license: 'DL345678', status: 'inactive', trips: 145, rating: 4.7 },
    { id: 'D004', name: 'Tom Brown', email: 'tom@transport.com', license: 'DL901234', status: 'active', trips: 312, rating: 4.9 },
    { id: 'D005', name: 'Emma Wilson', email: 'emma@transport.com', license: 'DL567890', status: 'active', trips: 198, rating: 4.5 },
];

const mockCustomers = [
    { id: 'C001', name: 'Alice Brown', email: 'alice@email.com', phone: '+1-555-0101', status: 'active', trips: 45, spent: '$892.50' },
    { id: 'C002', name: 'Bob Wilson', email: 'bob@email.com', phone: '+1-555-0102', status: 'active', trips: 32, spent: '$645.75' },
    { id: 'C003', name: 'Carol White', email: 'carol@email.com', phone: '+1-555-0103', status: 'inactive', trips: 18, spent: '$325.00' },
    { id: 'C004', name: 'David Green', email: 'david@email.com', phone: '+1-555-0104', status: 'active', trips: 56, spent: '$1,120.25' },
    { id: 'C005', name: 'Emma Garcia', email: 'emma@email.com', phone: '+1-555-0105', status: 'active', trips: 28, spent: '$512.50' },
];

const mockRegistrations = [
    { id: 'REG001', name: 'James Miller', email: 'james@email.com', status: 'pending', docs: ['License', 'Insurance', 'ID Proof'], avatar: 'https://via.placeholder.com/60' },
    { id: 'REG002', name: 'Laura Martinez', email: 'laura@email.com', status: 'pending', docs: ['License', 'Insurance', 'Background Check'], avatar: 'https://via.placeholder.com/60' },
    { id: 'REG003', name: 'Chris Thompson', email: 'chris@email.com', status: 'approved', docs: ['License', 'Insurance', 'ID Proof'], avatar: 'https://via.placeholder.com/60' },
];

// =====================
// DASHBOARD INITIALIZATION
// =====================

function initializeDashboard() {
    loadTripsTable();
    loadDriversTable();
    loadCustomersTable();
    loadDriverRegistrations();
    loadRequestsTable();
    setupEventListeners();
    initializeCharts();
    setDefaultDate();
    setupNotifications();
}

function setDefaultDate() {
    const dateInput = document.getElementById('dashboardDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// =====================
// TRIPS MANAGEMENT
// =====================

function loadTripsTable() {
    const tbody = document.getElementById('tripsTableBody');
    if (!tbody) return;
    
    const trips = JSON.parse(localStorage.getItem('activeTrips') || '[]');
    const filter = document.getElementById('tripStatusFilter')?.value || '';
    
    const filteredTrips = filter ? trips.filter(t => t.status === filter) : trips;
    
    tbody.innerHTML = filteredTrips.map(trip => `
        <tr>
            <td>${trip.id}</td>
            <td>${trip.driver}</td>
            <td>${trip.customer}</td>
            <td>${trip.route}</td>
            <td>${trip.distance || 'N/A'}</td>
            <td><span class="status-badge status-${trip.status}">${trip.status}</span></td>
            <td>${trip.amount}</td>
            <td>${trip.time}</td>
            <td>
                <button class="btn-secondary" onclick="viewTripDetails('${trip.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="9" style="text-align: center; padding: 20px;">No active trips</td></tr>';
}

function viewTripDetails(tripId) {
    const trip = mockTrips.find(t => t.id === tripId);
    if (trip) {
        const detailsHtml = `
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <p><strong>Trip ID:</strong> ${trip.id}</p>
                    <p><strong>Driver:</strong> ${trip.driver}</p>
                    <p><strong>Customer:</strong> ${trip.customer}</p>
                    <p><strong>Route:</strong> ${trip.route}</p>
                    <p><strong>Distance:</strong> ${trip.distance}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${trip.status}">${trip.status}</span></p>
                    <p><strong>Amount:</strong> ${trip.amount}</p>
                </div>
            </div>
        `;
        document.getElementById('tripDetails').innerHTML = detailsHtml;
        showModal('tripModal');
    }
}

function closeTripModal() {
    closeModal('tripModal');
}

function exportTripsData() {
    const csv = 'Trip ID,Driver,Customer,Route,Distance,Status,Amount,Time\n' +
        mockTrips.map(t => `${t.id},${t.driver},${t.customer},${t.route},${t.distance},${t.status},${t.amount},${t.time}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trips_report.csv';
    a.click();
    showToast('Trips data exported successfully!');
}

// =====================
// DRIVER REGISTRATION
// =====================

function loadDriverRegistrations() {
    const grid = document.getElementById('driverRegistrationGrid');
    if (!grid) return;
    
    grid.innerHTML = mockRegistrations.map(reg => `
        <div class="registration-card">
            <div class="registration-header">
                <img src="${reg.avatar}" alt="${reg.name}" class="registration-avatar">
                <div class="registration-info">
                    <h4>${reg.name}</h4>
                    <p>${reg.email}</p>
                    <span class="status-badge status-${reg.status}" style="font-size: 11px;">${reg.status}</span>
                </div>
            </div>
            <div class="registration-documents">
                <p>Documents</p>
                <ul class="doc-list">
                    ${reg.docs.map(doc => `<li>${doc}</li>`).join('')}
                </ul>
            </div>
            <div class="registration-actions">
                <button class="btn-primary" onclick="approveRegistration('${reg.id}')" ${reg.status === 'approved' ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> Approve
                </button>
                <button class="btn-danger" onclick="rejectRegistration('${reg.id}')" ${reg.status === 'rejected' ? 'disabled' : ''}>
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `).join('');
}

function approveRegistration(regId) {
    const reg = mockRegistrations.find(r => r.id === regId);
    if (reg) {
        reg.status = 'approved';
        loadDriverRegistrations();
        showToast(`Registration approved for ${reg.name}`);
    }
}

function rejectRegistration(regId) {
    const reg = mockRegistrations.find(r => r.id === regId);
    if (reg) {
        reg.status = 'rejected';
        loadDriverRegistrations();
        showToast(`Registration rejected for ${reg.name}`, 'warning');
    }
}

// =====================
// DRIVERS MANAGEMENT
// =====================

function loadDriversTable() {
    const tbody = document.getElementById('driversTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = mockDrivers.map(driver => `
        <tr>
            <td>${driver.id}</td>
            <td>${driver.name}</td>
            <td>${driver.email}</td>
            <td>${driver.license}</td>
            <td><span class="status-badge status-${driver.status}">${driver.status}</span></td>
            <td>${driver.trips}</td>
            <td>
                <i class="fas fa-star" style="color: #ffc107;"></i> ${driver.rating}
            </td>
            <td>
                <button class="btn-secondary" onclick="viewDriverDetails('${driver.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-secondary" onclick="editDriver('${driver.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewDriverDetails(driverId) {
    const driver = mockDrivers.find(d => d.id === driverId);
    if (driver) {
        const detailsHtml = `
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <p><strong>Driver ID:</strong> ${driver.id}</p>
                    <p><strong>Name:</strong> ${driver.name}</p>
                    <p><strong>Email:</strong> ${driver.email}</p>
                    <p><strong>License:</strong> ${driver.license}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${driver.status}">${driver.status}</span></p>
                    <p><strong>Trips Completed:</strong> ${driver.trips}</p>
                    <p><strong>Rating:</strong> <i class="fas fa-star" style="color: #ffc107;"></i> ${driver.rating}</p>
                </div>
            </div>
        `;
        document.getElementById('driverDetails').innerHTML = detailsHtml;
        showModal('driverModal');
    }
}

function closeDriverModal() {
    closeModal('driverModal');
}

function suspendDriver() {
    showToast('Driver suspended successfully', 'warning');
    closeDriverModal();
}

function editDriver(driverId) {
    showToast('Redirecting to driver edit form...');
}

function openAddDriverModal() {
    showToast('Add new driver form opened');
}

// =====================
// CUSTOMERS MANAGEMENT
// =====================

function loadCustomersTable() {
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = mockCustomers.map(customer => `
        <tr>
            <td>${customer.id}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td><span class="status-badge status-${customer.status}">${customer.status}</span></td>
            <td>${customer.trips}</td>
            <td>${customer.spent}</td>
            <td>
                <button class="btn-secondary" onclick="viewCustomerDetails('${customer.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-secondary" onclick="editCustomer('${customer.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function viewCustomerDetails(customerId) {
    const customer = mockCustomers.find(c => c.id === customerId);
    if (customer) {
        showToast(`Viewing details for ${customer.name}`);
    }
}

function editCustomer(customerId) {
    showToast('Redirecting to customer edit form...');
}

function openAddCustomerModal() {
    showToast('Add new customer form opened');
}

// =====================
// RESET CREDENTIALS
// =====================

function toggleResetPanel(type) {
    const content = document.getElementById(`${type}ResetContent`);
    const header = content.previousElementSibling;
    
    content.classList.toggle('hidden');
    header.classList.toggle('collapsed');
}

function searchDriversForReset() {
    const searchTerm = document.getElementById('driverResetSearch').value;
    const results = mockDrivers.filter(d => 
        d.email.includes(searchTerm) || d.id.includes(searchTerm) || d.name.includes(searchTerm)
    );
    
    const resultsDiv = document.getElementById('driverResetResults');
    resultsDiv.innerHTML = results.map(driver => `
        <div class="result-item">
            <div class="result-info">
                <h5>${driver.name}</h5>
                <p>${driver.email}</p>
            </div>
            <button class="btn-primary" onclick="sendResetLink('driver', '${driver.id}', '${driver.email}')" style="font-size: 12px; padding: 8px 15px;">
                <i class="fas fa-key"></i> Reset
            </button>
        </div>
    `).join('') || '<p style="color: var(--text-light); text-align: center; padding: 20px;">No drivers found</p>';
}

function searchCustomersForReset() {
    const searchTerm = document.getElementById('customerResetSearch').value;
    const results = mockCustomers.filter(c => 
        c.email.includes(searchTerm) || c.id.includes(searchTerm) || c.name.includes(searchTerm)
    );
    
    const resultsDiv = document.getElementById('customerResetResults');
    resultsDiv.innerHTML = results.map(customer => `
        <div class="result-item">
            <div class="result-info">
                <h5>${customer.name}</h5>
                <p>${customer.email}</p>
            </div>
            <button class="btn-primary" onclick="sendResetLink('customer', '${customer.id}', '${customer.email}')" style="font-size: 12px; padding: 8px 15px;">
                <i class="fas fa-key"></i> Reset
            </button>
        </div>
    `).join('') || '<p style="color: var(--text-light); text-align: center; padding: 20px;">No customers found</p>';
}

function sendResetLink(type, id, email) {
    showToast(`Password reset link sent to ${email}`);
}

function closeResetModal() {
    closeModal('resetModal');
}

function confirmReset() {
    showToast('Reset link has been sent successfully!');
    closeResetModal();
}

// =====================
// REPORTS
// =====================

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    if (!reportType) {
        showToast('Please select a report type', 'warning');
        return;
    }
    showToast(`${reportType} report generating...`);
}

function downloadReport(type) {
    showToast(`Downloading ${type} report...`);
}

// =====================
// SETTINGS
// =====================

function sendChangePasswordLink() {
    showToast('Password change link sent to your email');
}

function viewLoginHistory() {
    showToast('Loading login history...');
}

function saveSettings() {
    showToast('Settings saved successfully!');
}

// =====================
// EVENT LISTENERS SETUP
// =====================

function setupEventListeners() {
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                showToast('Logging out...');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        });
    }
    
    // Trip status filter
    const tripStatusFilter = document.getElementById('tripStatusFilter');
    if (tripStatusFilter) {
        tripStatusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const tbody = document.getElementById('tripsTableBody');
            if (status) {
                const filtered = mockTrips.filter(t => t.status === status);
                tbody.innerHTML = filtered.map(trip => `
                    <tr>
                        <td>${trip.id}</td>
                        <td>${trip.driver}</td>
                        <td>${trip.customer}</td>
                        <td>${trip.route}</td>
                        <td>${trip.distance}</td>
                        <td><span class="status-badge status-${trip.status}">${trip.status}</span></td>
                        <td>${trip.amount}</td>
                        <td>${trip.time}</td>
                        <td>
                            <button class="btn-secondary" onclick="viewTripDetails('${trip.id}')" style="font-size: 12px; padding: 5px 10px;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                loadTripsTable();
            }
        });
    }
    
    // Driver search
    const driverSearch = document.getElementById('driverSearch');
    if (driverSearch) {
        driverSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tbody = document.getElementById('driversTableBody');
            if (searchTerm) {
                const filtered = mockDrivers.filter(d => 
                    d.name.toLowerCase().includes(searchTerm) || 
                    d.email.toLowerCase().includes(searchTerm)
                );
                tbody.innerHTML = filtered.map(driver => `
                    <tr>
                        <td>${driver.id}</td>
                        <td>${driver.name}</td>
                        <td>${driver.email}</td>
                        <td>${driver.license}</td>
                        <td><span class="status-badge status-${driver.status}">${driver.status}</span></td>
                        <td>${driver.trips}</td>
                        <td>
                            <i class="fas fa-star" style="color: #ffc107;"></i> ${driver.rating}
                        </td>
                        <td>
                            <button class="btn-secondary" onclick="viewDriverDetails('${driver.id}')" style="font-size: 12px; padding: 5px 10px;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                loadDriversTable();
            }
        });
    }
    
    // Customer search
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const tbody = document.getElementById('customersTableBody');
            if (searchTerm) {
                const filtered = mockCustomers.filter(c => 
                    c.name.toLowerCase().includes(searchTerm) || 
                    c.email.toLowerCase().includes(searchTerm)
                );
                tbody.innerHTML = filtered.map(customer => `
                    <tr>
                        <td>${customer.id}</td>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone}</td>
                        <td><span class="status-badge status-${customer.status}">${customer.status}</span></td>
                        <td>${customer.trips}</td>
                        <td>${customer.spent}</td>
                        <td>
                            <button class="btn-secondary" onclick="viewCustomerDetails('${customer.id}')" style="font-size: 12px; padding: 5px 10px;">
                                <i class="fas fa-eye"></i>
                            </button>
                        </td>
                    </tr>
                `).join('');
            } else {
                loadCustomersTable();
            }
        });
    }
    
    // Driver status filter
    const driverStatusFilter = document.getElementById('driverStatusFilter');
    if (driverStatusFilter) {
        driverStatusFilter.addEventListener('change', (e) => {
            const status = e.target.value;
            const grid = document.getElementById('driverRegistrationGrid');
            if (status) {
                const filtered = mockRegistrations.filter(r => r.status === status);
                grid.innerHTML = filtered.map(reg => `
                    <div class="registration-card">
                        <div class="registration-header">
                            <img src="${reg.avatar}" alt="${reg.name}" class="registration-avatar">
                            <div class="registration-info">
                                <h4>${reg.name}</h4>
                                <p>${reg.email}</p>
                                <span class="status-badge status-${reg.status}" style="font-size: 11px;">${reg.status}</span>
                            </div>
                        </div>
                        <div class="registration-documents">
                            <p>Documents</p>
                            <ul class="doc-list">
                                ${reg.docs.map(doc => `<li>${doc}</li>`).join('')}
                            </ul>
                        </div>
                        <div class="registration-actions">
                            <button class="btn-primary" onclick="approveRegistration('${reg.id}')" ${reg.status === 'approved' ? 'disabled' : ''}>
                                <i class="fas fa-check"></i> Approve
                            </button>
                            <button class="btn-danger" onclick="rejectRegistration('${reg.id}')" ${reg.status === 'rejected' ? 'disabled' : ''}>
                                <i class="fas fa-times"></i> Reject
                            </button>
                        </div>
                    </div>
                `).join('');
            } else {
                loadDriverRegistrations();
            }
        });
    }
}

// =====================
// CHARTS (Placeholder)
// =====================

function initializeCharts() {
    // Chart.js integration would go here
    // For now, charts are displayed as canvas elements
    // In a real implementation, you'd load Chart.js library
    const tripsCanvas = document.getElementById('tripsChart');
    const revenueCanvas = document.getElementById('revenueChart');
    
    if (tripsCanvas) {
        const ctx = tripsCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(102, 126, 234, 0.1)';
        ctx.fillRect(0, 0, tripsCanvas.width, tripsCanvas.height);
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Chart.js integration ready', 20, 30);
    }
    
    if (revenueCanvas) {
        const ctx = revenueCanvas.getContext('2d');
        ctx.fillStyle = 'rgba(240, 147, 251, 0.1)';
        ctx.fillRect(0, 0, revenueCanvas.width, revenueCanvas.height);
        ctx.fillStyle = '#f093fb';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Chart.js integration ready', 20, 30);
    }
}

// =====================
// RIDE REQUESTS MANAGEMENT
// =====================

function loadRequestsTable() {
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
    const filter = document.getElementById('requestStatusFilter')?.value || '';
    
    const filteredRequests = filter ? requests.filter(r => r.status === filter) : requests;
    
    tbody.innerHTML = filteredRequests.map(request => `
        <tr>
            <td>${request.id}</td>
            <td>${request.passengerName}</td>
            <td>${request.pickup}</td>
            <td>${request.dropoff}</td>
            <td><span class="service-badge service-${request.serviceType}">${request.serviceType}</span></td>
            <td><span class="status-badge status-${request.status}">${request.status}</span></td>
            <td>${new Date(request.timestamp).toLocaleString()}</td>
            <td>
                <button class="btn-secondary" onclick="viewRequestDetails('${request.id}')" style="font-size: 12px; padding: 5px 10px;">
                    <i class="fas fa-eye"></i>
                </button>
                ${request.status === 'pending' ? `
                    <button class="btn-primary" onclick="assignDriver('${request.id}')" style="font-size: 12px; padding: 5px 10px;">
                        <i class="fas fa-user-plus"></i> Assign
                    </button>
                ` : ''}
                ${request.status === 'assigned' ? `
                    <button class="btn-success" onclick="markCompleted('${request.id}')" style="font-size: 12px; padding: 5px 10px;">
                        <i class="fas fa-check"></i> Complete
                    </button>
                ` : ''}
            </td>
        </tr>
    `).join('') || '<tr><td colspan="8" style="text-align: center; padding: 20px;">No ride requests found</td></tr>';
}

function viewRequestDetails(requestId) {
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
    const request = requests.find(r => r.id === requestId);
    
    if (request) {
        const details = `
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <p><strong>Request ID:</strong> ${request.id}</p>
                    <p><strong>Passenger:</strong> ${request.passengerName}</p>
                    <p><strong>Phone:</strong> ${request.passengerPhone}</p>
                    <p><strong>Email:</strong> ${request.passengerEmail || 'Not provided'}</p>
                    <p><strong>Pickup:</strong> ${request.pickup}</p>
                    <p><strong>Drop-off:</strong> ${request.dropoff}</p>
                    <p><strong>Service Type:</strong> ${request.serviceType}</p>
                    <p><strong>Passengers:</strong> ${request.passengers}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${request.status}">${request.status}</span></p>
                    <p><strong>Assigned Driver:</strong> ${request.assignedDriver || 'Not assigned'}</p>
                    <p><strong>Time:</strong> ${new Date(request.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `;
        document.getElementById('tripDetails').innerHTML = details;
        showModal('tripModal');
    }
}

function assignDriver(requestId) {
    const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    if (drivers.length === 0) {
        // Use mock drivers if no real drivers
        const mockDrivers = [
            { id: 'D001', name: 'John Smith' },
            { id: 'D002', name: 'Mike Johnson' },
            { id: 'D003', name: 'Sarah Davis' }
        ];
        localStorage.setItem('drivers', JSON.stringify(mockDrivers));
    }
    
    const availableDrivers = JSON.parse(localStorage.getItem('drivers') || '[]');
    const driverOptions = availableDrivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
    
    const modalContent = `
        <h3>Assign Driver to Request ${requestId}</h3>
        <div style="margin: 20px 0;">
            <label for="driverSelect">Select Driver:</label>
            <select id="driverSelect" style="width: 100%; padding: 10px; margin: 10px 0;">
                ${driverOptions}
            </select>
        </div>
        <div style="text-align: right;">
            <button class="btn-secondary" onclick="closeModal('tripModal')">Cancel</button>
            <button class="btn-primary" onclick="confirmAssignDriver('${requestId}')">Assign Driver</button>
        </div>
    `;
    
    document.getElementById('tripDetails').innerHTML = modalContent;
}

function confirmAssignDriver(requestId) {
    const driverId = document.getElementById('driverSelect').value;
    const driverName = document.getElementById('driverSelect').options[document.getElementById('driverSelect').selectedIndex].text;
    
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        requests[requestIndex].status = 'assigned';
        requests[requestIndex].assignedDriver = driverName;
        localStorage.setItem('rideRequests', JSON.stringify(requests));
        
        // Add to active trips
        const trips = JSON.parse(localStorage.getItem('activeTrips') || '[]');
        trips.push({
            id: requestId,
            driver: driverName,
            customer: requests[requestIndex].passengerName,
            route: `${requests[requestIndex].pickup} → ${requests[requestIndex].dropoff}`,
            status: 'assigned',
            amount: 'Pending',
            time: new Date().toLocaleTimeString()
        });
        localStorage.setItem('activeTrips', JSON.stringify(trips));
        
        showToast(`Driver ${driverName} assigned to request ${requestId}`);
        loadRequestsTable();
        closeModal('tripModal');
        
        // Notify driver
        notifyDriver(requestId, driverName);
    }
}

function markCompleted(requestId) {
    const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
    const requestIndex = requests.findIndex(r => r.id === requestId);
    
    if (requestIndex !== -1) {
        requests[requestIndex].status = 'completed';
        localStorage.setItem('rideRequests', JSON.stringify(requests));
        
        // Update active trips
        const trips = JSON.parse(localStorage.getItem('activeTrips') || '[]');
        const tripIndex = trips.findIndex(t => t.id === requestId);
        if (tripIndex !== -1) {
            trips[tripIndex].status = 'completed';
            localStorage.setItem('activeTrips', JSON.stringify(trips));
        }
        
        showToast(`Request ${requestId} marked as completed`);
        loadRequestsTable();
    }
}

function refreshRequests() {
    loadRequestsTable();
    showToast('Requests refreshed');
}

function notifyDriver(requestId, driverName) {
    // This will be picked up by driver dashboard
    const notifications = JSON.parse(localStorage.getItem('driverNotifications') || '[]');
    notifications.push({
        id: 'DNOTIF' + Date.now(),
        driverName: driverName,
        type: 'new_assignment',
        message: `New trip assigned: ${requestId}`,
        requestId: requestId,
        timestamp: new Date().toISOString(),
        read: false
    });
    localStorage.setItem('driverNotifications', JSON.stringify(notifications));
}

// =====================
// NOTIFICATIONS
// =====================

function setupNotifications() {
    // Check for new requests every 30 seconds
    setInterval(() => {
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        const unreadCount = notifications.filter(n => !n.read).length;
        
        const badge = document.querySelector('.notification-btn .badge');
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
        
        if (unreadCount > 0) {
            loadRequestsTable(); // Refresh requests table
        }
    }, 30000);
}

// =====================
// CLOSE MODALS ON CLICK OUTSIDE
// =====================

window.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// =====================
// INITIALIZE ON LOAD
// =====================

document.addEventListener('DOMContentLoaded', initializeDashboard);

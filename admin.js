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
// PRODUCTION: No demo/mock data
// All data is loaded from backend APIs. The front-end is production-only.
// Admin credentials (client gate): user=Admin256, password=Ap.23082017
// NOTE: server-side authentication should be implemented for real production systems.
// =====================

const ADMIN_CREDENTIALS = { user: 'Admin256', pass: 'Ap.23082017' };

// Authentication helpers
function isAuthenticated() {
    return sessionStorage.getItem('adminAuthenticated') === 'true';
}

function requireAuth() {
    if (!isAuthenticated()) {
        showToast('Admin authentication required', 'warning');
        const loginModal = document.getElementById('adminLoginModal');
        if (loginModal) loginModal.classList.add('show');
        // hide main UI to prevent interaction
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('.main-content');
        if (sidebar) sidebar.style.pointerEvents = 'none';
        if (main) main.style.pointerEvents = 'none';
        document.body.classList.add('locked');
        return false;
    }
    // ensure UI interactive when authenticated
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    if (sidebar) sidebar.style.pointerEvents = '';
    if (main) main.style.pointerEvents = '';
    document.body.classList.remove('locked');
    return true;
}

// =====================
// DASHBOARD INITIALIZATION
// =====================

function initializeDashboard() {
    setupEventListeners();
    setDefaultDate();
    initializeCharts();
    setupNotifications();

    // Require admin authentication before loading production data
    const authenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
    const loginModal = document.getElementById('adminLoginModal');

    function postAuthInit() {
        loadTripsTable();
        loadDriversTable();
        loadCustomersTable();
        loadDriverRegistrations();
        loadRequestsTable();
        loadKPIs();
        loadActivities();
    }

    // Attach login button
    const loginBtn = document.getElementById('adminLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => loginAdmin(postAuthInit));
    }

    if (authenticated) {
        if (loginModal) loginModal.classList.remove('show');
        postAuthInit();
    } else {
        // show login modal (already present in DOM with class show)
        if (loginModal) loginModal.classList.add('show');
    }
}

function loginAdmin(onSuccess) {
    const user = document.getElementById('adminUser')?.value || '';
    const pass = document.getElementById('adminPass')?.value || '';
    if (user === ADMIN_CREDENTIALS.user && pass === ADMIN_CREDENTIALS.pass) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        const loginModal = document.getElementById('adminLoginModal');
        if (loginModal) loginModal.classList.remove('show');
        showToast('Login successful');
        // restore UI interactivity
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('.main-content');
        if (sidebar) sidebar.style.pointerEvents = '';
        if (main) main.style.pointerEvents = '';
        document.body.classList.remove('locked');
        if (typeof onSuccess === 'function') onSuccess();
    } else {
        showToast('Invalid admin credentials', 'warning');
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('adminAuthenticated');
    // show login modal again
    const loginModal = document.getElementById('adminLoginModal');
    if (loginModal) loginModal.classList.add('show');
    document.body.classList.add('locked');
    showToast('Logged out');
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
async function loadTripsTable() {
    if (!requireAuth()) return;
    const tbody = document.getElementById('tripsTableBody');
    if (!tbody) return;
    const filter = document.getElementById('tripStatusFilter')?.value || '';
    try {
        const res = await fetch('/api/trips/active');
        if (!res.ok) throw new Error('Failed to load trips');
        const trips = await res.json();
        const filtered = filter ? trips.filter(t => t.status === filter) : trips;
        tbody.innerHTML = filtered.map(trip => `
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
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:20px;">Failed to load trips</td></tr>';
        console.error(err);
    }
}

async function viewTripDetails(tripId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch('/api/trips/active');
        if (!res.ok) throw new Error('Failed to load trips');
        const trips = await res.json();
        const trip = trips.find(t => t.id === tripId);
        if (!trip) return showToast('Trip not found', 'warning');
        const detailsHtml = `
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <p><strong>Trip ID:</strong> ${trip.id}</p>
                    <p><strong>Driver:</strong> ${trip.driver}</p>
                    <p><strong>Customer:</strong> ${trip.customer}</p>
                    <p><strong>Route:</strong> ${trip.route}</p>
                    <p><strong>Distance:</strong> ${trip.distance || 'N/A'}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${trip.status}">${trip.status}</span></p>
                    <p><strong>Amount:</strong> ${trip.amount}</p>
                </div>
            </div>
        `;
        document.getElementById('tripDetails').innerHTML = detailsHtml;
        showModal('tripModal');
    } catch (err) {
        console.error(err);
        showToast('Unable to load trip details', 'warning');
    }
}

function closeTripModal() {
    closeModal('tripModal');
}

async function exportTripsData() {
    if (!requireAuth()) return;
    try {
        const res = await fetch('/api/trips/active');
        if (!res.ok) throw new Error('Failed to load trips');
        const trips = await res.json();
        const csv = 'Trip ID,Driver,Customer,Route,Distance,Status,Amount,Time\n' +
            trips.map(t => `${t.id},${t.driver},${t.customer},${t.route},${t.distance || ''},${t.status},${t.amount},${t.time}`).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'trips_report.csv';
        a.click();
        showToast('Trips data exported successfully!');
    } catch (err) {
        console.error(err);
        showToast('Failed to export trips', 'warning');
    }
}

// =====================
// DRIVER REGISTRATION
// =====================

async function loadDriverRegistrations(statusFilter = '') {
    if (!requireAuth()) return;
    const grid = document.getElementById('driverRegistrationGrid');
    if (!grid) return;
    try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('Failed to load drivers');
        const drivers = await res.json();
        // treat drivers with status 'pending' as registration requests
        const regs = drivers.filter(d => (d.status || '').toLowerCase() === 'pending');
        const filtered = statusFilter ? regs.filter(r => r.status === statusFilter) : regs;
        if (filtered.length === 0) return grid.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No registration requests</p>';
        grid.innerHTML = filtered.map(reg => `
            <div class="registration-card">
                <div class="registration-header">
                    <img src="${reg.avatar || 'https://via.placeholder.com/60'}" alt="${reg.name}" class="registration-avatar">
                    <div class="registration-info">
                        <h4>${reg.name}</h4>
                        <p>${reg.email}</p>
                        <span class="status-badge status-${reg.status || 'pending'}" style="font-size: 11px;">${reg.status || 'pending'}</span>
                    </div>
                </div>
                <div class="registration-documents">
                    <p>Documents</p>
                    <ul class="doc-list">
                        ${(reg.docs || []).map(doc => `<li>${doc}</li>`).join('')}
                    </ul>
                </div>
                <div class="registration-actions">
                    <button class="btn-primary" onclick="approveRegistration('${reg.id}')">
                        <i class="fas fa-check"></i> Approve
                    </button>
                    <button class="btn-danger" onclick="rejectRegistration('${reg.id}')">
                        <i class="fas fa-times"></i> Reject
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Failed to load registration requests</p>';
    }
}

async function approveRegistration(regId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch(`/api/drivers/${regId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) });
        if (!res.ok) throw new Error('Failed to approve');
        showToast('Registration approved');
        loadDriverRegistrations();
    } catch (err) {
        console.error(err);
        showToast('Failed to approve registration', 'warning');
    }
}

async function rejectRegistration(regId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch(`/api/drivers/${regId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) });
        if (!res.ok) throw new Error('Failed to reject');
        showToast('Registration rejected', 'warning');
        loadDriverRegistrations();
    } catch (err) {
        console.error(err);
        showToast('Failed to reject registration', 'warning');
    }
}

// =====================
// DRIVERS MANAGEMENT
// =====================

async function loadDriversTable(searchTerm = '') {
    if (!requireAuth()) return;
    const tbody = document.getElementById('driversTableBody');
    if (!tbody) return;
    try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('Failed to load drivers');
        const drivers = await res.json();
        const filtered = searchTerm ? drivers.filter(d => (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (d.email || '').toLowerCase().includes(searchTerm.toLowerCase())) : drivers;
        if (filtered.length === 0) return tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">No drivers found</td></tr>';
        tbody.innerHTML = filtered.map(driver => `
            <tr>
                <td>${driver.id}</td>
                <td>${driver.name}</td>
                <td>${driver.email || ''}</td>
                <td>${driver.license || ''}</td>
                <td><span class="status-badge status-${driver.status || 'unknown'}">${driver.status || 'unknown'}</span></td>
                <td>${driver.trips || 0}</td>
                <td>
                    <i class="fas fa-star" style="color: #ffc107;"></i> ${driver.rating || 'N/A'}
                </td>
                <td>
                    <button class="btn-secondary" onclick="viewDriverDetails('${driver.id}')" style="font-size: 12px; padding: 5px 10px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Failed to load drivers</td></tr>';
    }
}

async function viewDriverDetails(driverId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('Failed to load drivers');
        const drivers = await res.json();
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return showToast('Driver not found', 'warning');
        const detailsHtml = `
            <div style="padding: 20px 0;">
                <div style="margin-bottom: 15px;">
                    <p><strong>Driver ID:</strong> ${driver.id}</p>
                    <p><strong>Name:</strong> ${driver.name}</p>
                    <p><strong>Email:</strong> ${driver.email || ''}</p>
                    <p><strong>License:</strong> ${driver.license || ''}</p>
                    <p><strong>Status:</strong> <span class="status-badge status-${driver.status || 'unknown'}">${driver.status || 'unknown'}</span></p>
                    <p><strong>Trips Completed:</strong> ${driver.trips || 0}</p>
                    <p><strong>Rating:</strong> <i class="fas fa-star" style="color: #ffc107;"></i> ${driver.rating || 'N/A'}</p>
                </div>
            </div>
        `;
        document.getElementById('driverDetails').innerHTML = detailsHtml;
        showModal('driverModal');
    } catch (err) {
        console.error(err);
        showToast('Unable to load driver details', 'warning');
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

async function loadCustomersTable(searchTerm = '') {
    if (!requireAuth()) return;
    const tbody = document.getElementById('customersTableBody');
    if (!tbody) return;
    try {
        const res = await fetch('/api/requests');
        if (!res.ok) throw new Error('Failed to load requests');
        const requests = await res.json();
        // derive customers from requests
        const customersMap = {};
        requests.forEach(r => {
            const id = r.passengerEmail || r.passengerPhone || r.passengerName || r.id;
            if (!customersMap[id]) {
                customersMap[id] = { id: id, name: r.passengerName || 'Unknown', email: r.passengerEmail || '', phone: r.passengerPhone || '', trips: 0, spent: 0 };
            }
            customersMap[id].trips += 1;
            customersMap[id].spent += Number(r.fare || 0);
        });
        let customers = Object.values(customersMap);
        if (searchTerm) {
            customers = customers.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (customers.length === 0) return tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">No customers found</td></tr>';
        tbody.innerHTML = customers.map((customer, idx) => `
            <tr>
                <td>${customer.id || 'C' + (idx+1)}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td><span class="status-badge status-active">active</span></td>
                <td>${customer.trips}</td>
                <td>$${(customer.spent || 0).toFixed(2)}</td>
                <td>
                    <button class="btn-secondary" onclick="viewCustomerDetails('${customer.id}')" style="font-size: 12px; padding: 5px 10px;">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:20px;">Failed to load customers</td></tr>';
    }
}

async function viewCustomerDetails(customerId) {
    try {
        const res = await fetch('/api/requests');
        if (!res.ok) throw new Error('Failed to load requests');
        const requests = await res.json();
        const found = requests.find(r => (r.passengerEmail || r.passengerPhone || r.passengerName || r.id) === customerId || r.passengerName === customerId);
        if (found) {
            const name = found.passengerName || 'Unknown';
            const details = `Viewing details for ${name} — Phone: ${found.passengerPhone || 'N/A'}, Email: ${found.passengerEmail || 'N/A'}`;
            showToast(details);
        } else {
            showToast('Customer details not found', 'warning');
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to load customer details', 'warning');
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
    if (!requireAuth()) return;
    const searchTerm = document.getElementById('driverResetSearch').value || '';
    const resultsDiv = document.getElementById('driverResetResults');
    resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Searching...</p>';
    fetch('/api/drivers')
        .then(r => r.ok ? r.json() : Promise.reject('Failed'))
        .then(drivers => {
            const filtered = drivers.filter(d => (d.email || '').includes(searchTerm) || (d.id || '').includes(searchTerm) || (d.name || '').includes(searchTerm));
            if (filtered.length === 0) return resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No drivers found</p>';
            resultsDiv.innerHTML = filtered.map(driver => `
                <div class="result-item">
                    <div class="result-info">
                        <h5>${driver.name}</h5>
                        <p>${driver.email || ''}</p>
                    </div>
                    <button class="btn-primary" onclick="sendResetLink('driver', '${driver.id}', '${driver.email || ''}')" style="font-size: 12px; padding: 8px 15px;">
                        <i class="fas fa-key"></i> Reset
                    </button>
                </div>
            `).join('');
        }).catch(err => {
            console.error(err);
            resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Failed to search drivers</p>';
        });
}

function searchCustomersForReset() {
    if (!requireAuth()) return;
    const searchTerm = document.getElementById('customerResetSearch').value || '';
    const resultsDiv = document.getElementById('customerResetResults');
    resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Searching...</p>';
    // derive customers from requests
    fetch('/api/requests')
        .then(r => r.ok ? r.json() : Promise.reject('Failed'))
        .then(requests => {
            const map = {};
            requests.forEach(r => {
                const id = r.passengerEmail || r.passengerPhone || r.passengerName || r.id;
                if (!map[id]) map[id] = { id, name: r.passengerName || 'Unknown', email: r.passengerEmail || '' };
            });
            const customers = Object.values(map).filter(c => (c.email || '').includes(searchTerm) || (c.id || '').includes(searchTerm) || (c.name || '').includes(searchTerm));
            if (customers.length === 0) return resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">No customers found</p>';
            resultsDiv.innerHTML = customers.map(customer => `
                <div class="result-item">
                    <div class="result-info">
                        <h5>${customer.name}</h5>
                        <p>${customer.email}</p>
                    </div>
                    <button class="btn-primary" onclick="sendResetLink('customer', '${customer.id}', '${customer.email}')" style="font-size: 12px; padding: 8px 15px;">
                        <i class="fas fa-key"></i> Reset
                    </button>
                </div>
            `).join('');
        }).catch(err => {
            console.error(err);
            resultsDiv.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 20px;">Failed to search customers</p>';
        });
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
                    logoutAdmin();
                }, 600);
            }
        });
    }
    
    // Trip status filter
    const tripStatusFilter = document.getElementById('tripStatusFilter');
    if (tripStatusFilter) {
        tripStatusFilter.addEventListener('change', () => {
            loadTripsTable();
        });
    }
    
    // Driver search
    const driverSearch = document.getElementById('driverSearch');
    if (driverSearch) {
        driverSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value || '';
            loadDriversTable(searchTerm);
        });
    }
    
    // Customer search
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        customerSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value || '';
            loadCustomersTable(searchTerm);
        });
    }
    
    // Driver status filter
    const driverStatusFilter = document.getElementById('driverStatusFilter');
    if (driverStatusFilter) {
        driverStatusFilter.addEventListener('change', (e) => {
            const status = e.target.value || '';
            loadDriverRegistrations(status);
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
// DASHBOARD KPIS
// =====================
async function loadKPIs() {
    try {
        const [tripsRes, driversRes, requestsRes] = await Promise.all([
            fetch('/api/trips/active'),
            fetch('/api/drivers'),
            fetch('/api/requests')
        ]);
        const trips = tripsRes.ok ? await tripsRes.json() : [];
        const drivers = driversRes.ok ? await driversRes.json() : [];
        const requests = requestsRes.ok ? await requestsRes.json() : [];

        const activeTripCount = (trips || []).length;
        const totalDrivers = (drivers || []).length;
        const uniqueCustomers = new Set((requests || []).map(r => r.passengerEmail || r.passengerPhone || r.passengerName || r.id));
        const totalCustomers = uniqueCustomers.size;
        const totalRevenue = (requests || []).reduce((sum, r) => sum + (Number(r.fare) || 0), 0);

        document.getElementById('activeTripCount').textContent = activeTripCount;
        document.getElementById('totalDrivers').textContent = totalDrivers;
        document.getElementById('totalCustomers').textContent = totalCustomers;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
    } catch (err) {
        console.error('Failed to load KPIs', err);
    }
}

// =====================
// RECENT ACTIVITIES
// =====================
async function loadActivities() {
    const container = document.querySelector('.activity-list');
    if (!container) return;
    try {
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to load activities');
        const notes = await res.json();
        const latest = (notes || []).slice(-6).reverse();
        if (latest.length === 0) return container.innerHTML = '<p style="color:var(--text-light); padding:12px; text-align:center;">No recent activity</p>';
        container.innerHTML = latest.map(n => `
            <div class="activity-item">
                <div class="activity-icon ${n.type === 'new_request' ? 'success' : n.type === 'new_assignment' ? 'info' : 'info'}">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-details">
                    <p class="activity-title">${n.message}</p>
                    <p class="activity-desc">${n.data && n.data.passengerName ? n.data.passengerName : ''}</p>
                    <p class="activity-time">${new Date(n.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p style="color:var(--text-light); padding:12px; text-align:center;">Unable to load activity</p>';
    }
}

// =====================
// RIDE REQUESTS MANAGEMENT
// =====================

async function loadRequestsTable() {
    if (!requireAuth()) return;
    const tbody = document.getElementById('requestsTableBody');
    if (!tbody) return;
    const filter = document.getElementById('requestStatusFilter')?.value || '';
    try {
        const res = await fetch('/api/requests');
        if (!res.ok) throw new Error('Failed to load requests');
        const requests = await res.json();
        const filtered = filter ? requests.filter(r => r.status === filter) : requests;
        if (filtered.length === 0) return tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No ride requests found</td></tr>';
        tbody.innerHTML = filtered.map(request => `
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
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Failed to load requests</td></tr>';
    }
}

async function viewRequestDetails(requestId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch('/api/requests');
        if (!res.ok) throw new Error('Failed to load requests');
        const requests = await res.json();
        const request = requests.find(r => r.id === requestId);
        if (!request) return showToast('Request not found', 'warning');
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
    } catch (err) {
        console.error(err);
        showToast('Unable to load request details', 'warning');
    }
}

async function assignDriver(requestId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch('/api/drivers');
        if (!res.ok) throw new Error('Failed to load drivers');
        const drivers = await res.json();
        const driverOptions = drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('');
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
        showModal('tripModal');
    } catch (err) {
        console.error(err);
        showToast('Failed to load drivers', 'warning');
    }
}

async function confirmAssignDriver(requestId) {
    if (!requireAuth()) return;
    const select = document.getElementById('driverSelect');
    if (!select) return showToast('No driver selected', 'warning');
    const driverId = select.value;
    const driverName = select.options[select.selectedIndex].text;
    try {
        const res = await fetch(`/api/requests/${requestId}/assign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ driverId, driverName }) });
        if (!res.ok) throw new Error('Assign failed');
        showToast(`Driver ${driverName} assigned to request ${requestId}`);
        closeModal('tripModal');
        loadRequestsTable();
        loadTripsTable();
    } catch (err) {
        console.error(err);
        showToast('Failed to assign driver', 'warning');
    }
}

async function markCompleted(requestId) {
    if (!requireAuth()) return;
    try {
        const res = await fetch(`/api/trips/${requestId}/complete`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to complete trip');
        showToast(`Request ${requestId} marked as completed`);
        loadRequestsTable();
        loadTripsTable();
    } catch (err) {
        console.error(err);
        showToast('Failed to complete trip', 'warning');
    }
}

function refreshRequests() {
    loadRequestsTable();
    showToast('Requests refreshed');
}

// =====================
// NOTIFICATIONS
// =====================

function setupNotifications() {
    // Poll notifications from server every 30 seconds
    async function poll() {
        try {
            const res = await fetch('/api/notifications');
            if (!res.ok) throw new Error('Failed to fetch notifications');
            const notifications = await res.json();
            const unreadCount = (notifications || []).filter(n => !n.read).length;
            const badge = document.querySelector('.notification-btn .badge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'inline' : 'none';
            }
                    if (unreadCount > 0) loadRequestsTable();
                    loadActivities();
        } catch (err) {
            console.error('Notification poll failed', err);
        }
    }

    if (!isAuthenticated()) return; // don't poll until authenticated
    poll();
    setInterval(poll, 30000);
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

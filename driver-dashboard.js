// Driver Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authModal = document.getElementById('authModal');
    const dashboardContainer = document.getElementById('dashboardContainer');
    const tripModal = document.getElementById('tripModal');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Dashboard elements
    const onlineToggle = document.getElementById('onlineToggle');
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');
    const findingTrips = document.getElementById('findingTrips');
    const activeTrip = document.getElementById('activeTrip');
    const acceptedTrip = document.getElementById('acceptedTrip');
    const ongoingTrip = document.getElementById('ongoingTrip');
    const tripCompleted = document.getElementById('tripCompleted');

    // Trip management variables
    let currentTrip = null;
    let tripTimer = null;
    let tripStartTime = null;
    let acceptanceTimer = null;

    // Initialize app
    init();

    function init() {
        // Check if user is logged in
        const isLoggedIn = localStorage.getItem('driverLoggedIn');
        if (isLoggedIn) {
            showDashboard();
            startNotificationCheck();
            checkForNewAssignments(); // Check immediately on load
        } else {
            showAuthModal();
        }

        // Event listeners
        setupEventListeners();
        loadMockData();
    }

    function setupEventListeners() {
        // Auth tabs
        document.getElementById('loginTab').addEventListener('click', () => switchTab('login'));
        document.getElementById('registerTab').addEventListener('click', () => switchTab('register'));

        // Auth forms
        document.getElementById('loginFormData').addEventListener('submit', handleLogin);
        document.getElementById('registerFormData').addEventListener('submit', handleRegister);

        // Navigation
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.getAttribute('data-section');
                switchSection(section);
            });
        });

        // Menu toggle
        menuToggle.addEventListener('click', toggleSidebar);

        // Modals
        document.getElementById('closeAuth').addEventListener('click', () => authModal.style.display = 'none');
        document.getElementById('closeTrip').addEventListener('click', () => tripModal.style.display = 'none');

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);

        // Profile form
        document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);

        // Trip actions
        document.getElementById('acceptTrip').addEventListener('click', () => handleTripAction('accept'));
        document.getElementById('declineTrip').addEventListener('click', () => handleTripAction('decline'));

        // Dashboard trip actions
        document.getElementById('acceptTripBtn').addEventListener('click', () => handleTripAction('accept'));
        document.getElementById('declineTripBtn').addEventListener('click', () => handleTripAction('decline'));
        document.getElementById('startTripBtn').addEventListener('click', startTrip);
        document.getElementById('cancelTripBtn').addEventListener('click', cancelTrip);
        document.getElementById('endTripBtn').addEventListener('click', endTrip);
        document.getElementById('collectCashBtn').addEventListener('click', collectCash);

        // Online toggle
        onlineToggle.addEventListener('change', handleOnlineToggle);

        // Dark theme toggle
        document.getElementById('darkTheme').addEventListener('change', handleDarkThemeToggle);

        // Settings
        document.getElementById('changePassword').addEventListener('click', () => alert('Change password functionality would be implemented here'));
        document.getElementById('deleteAccount').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                handleLogout();
            }
        });

        // History filters
        document.getElementById('historyFilter').addEventListener('change', filterHistory);
        document.getElementById('historyDate').addEventListener('change', filterHistory);
    }

    function switchTab(tab) {
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (tab === 'login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.classList.remove('hidden');
            registerForm.classList.add('hidden');
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
        }
    }

    function handleLogin(e) {
        e.preventDefault();
        // Mock login - in real app, this would validate credentials
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (email && password) {
            localStorage.setItem('driverLoggedIn', 'true');
            localStorage.setItem('driverEmail', email);
            
            // Find driver name from stored drivers
            const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
            const driver = drivers.find(d => d.email === email);
            if (driver) {
                localStorage.setItem('driverName', driver.name);
            } else {
                localStorage.setItem('driverName', 'John Doe');
            }
            
            // Initialize driver stats if not exists
            initializeDriverStats();
            
            authModal.style.display = 'none';
            showDashboard();
            startNotificationCheck();
            checkForNewAssignments();
        } else {
            alert('Please enter valid credentials');
        }
    }

    function handleRegister(e) {
        e.preventDefault();
        // Mock registration
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const phone = document.getElementById('regPhone').value;
        const license = document.getElementById('regLicense').value;
        const password = document.getElementById('regPassword').value;

        if (name && email && phone && license && password) {
            localStorage.setItem('driverLoggedIn', 'true');
            localStorage.setItem('driverEmail', email);
            localStorage.setItem('driverName', name);
            
            // Add to drivers list
            const drivers = JSON.parse(localStorage.getItem('drivers') || '[]');
            drivers.push({
                id: 'D' + Date.now(),
                name: name,
                email: email,
                phone: phone,
                license: license
            });
            localStorage.setItem('drivers', JSON.stringify(drivers));
            
            // Initialize driver stats
            initializeDriverStats();
            
            authModal.style.display = 'none';
            showDashboard();
        } else {
            alert('Please fill in all fields');
        }
    }
    
    function initializeDriverStats() {
        const driverEmail = localStorage.getItem('driverEmail');
        if (!localStorage.getItem('driverStats')) {
            const defaultStats = {
                email: driverEmail,
                rating: 4.8,
                acceptanceRate: 95,
                totalTrips: 0,
                totalEarnings: 0,
                todayEarnings: 0,
                weekEarnings: 0,
                monthEarnings: 0,
                phone: '+1234567890',
                license: 'DL123456789',
                vehicle: 'Toyota Camry - ABC123'
            };
            localStorage.setItem('driverStats', JSON.stringify(defaultStats));
        }
    }

    function handleLogout() {
        localStorage.removeItem('driverLoggedIn');
        localStorage.removeItem('driverEmail');
        localStorage.removeItem('driverName');
        dashboardContainer.style.display = 'none';
        showAuthModal();
    }

    function startNotificationCheck() {
        // Check for new assignments every 10 seconds
        setInterval(() => {
            checkForNewAssignments();
            updateNotificationCount();
        }, 10000);
    }

    function checkForNewAssignments() {
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const notifications = JSON.parse(localStorage.getItem('driverNotifications') || '[]');
        
        const newNotifications = notifications.filter(n => 
            n.driverName === driverName && !n.read
        );
        
        if (newNotifications.length > 0) {
            // Show notification for new assignment
            const latest = newNotifications[0];
            showTripNotification(latest);
            
            // Mark as read
            const allNotifications = JSON.parse(localStorage.getItem('driverNotifications') || '[]');
            const index = allNotifications.findIndex(n => n.id === latest.id);
            if (index !== -1) {
                allNotifications[index].read = true;
                localStorage.setItem('driverNotifications', JSON.stringify(allNotifications));
            }
        }
    }

    function showTripNotification(notification) {
        // Get request details
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        const request = requests.find(r => r.id === notification.requestId);
        
        if (request) {
            // Populate trip details
            document.getElementById('pickupAddress').textContent = request.pickup;
            document.getElementById('dropoffAddress').textContent = request.dropoff;
            document.getElementById('passengerName').textContent = request.passengerName;
            
            // Calculate estimated distance and time (mock)
            document.getElementById('tripDistance').textContent = '5.2 km';
            document.getElementById('tripDuration').textContent = '15 min';
            document.getElementById('tripFare').textContent = '$25.50';
            
            // Show active trip section
            findingTrips.style.display = 'none';
            activeTrip.style.display = 'block';
            acceptedTrip.style.display = 'none';
            ongoingTrip.style.display = 'none';
            tripCompleted.style.display = 'none';
            
            // Start acceptance timer
            startAcceptanceTimer();
        }
    }

    function updateNotificationCount() {
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const notifications = JSON.parse(localStorage.getItem('driverNotifications') || '[]');
        const unreadCount = notifications.filter(n => 
            n.driverName === driverName && !n.read
        ).length;
        
        const countElement = document.getElementById('notificationCount');
        countElement.textContent = unreadCount;
        countElement.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    function startAcceptanceTimer() {
        let timeLeft = 30;
        const timerElement = document.getElementById('timerValue');
        
        acceptanceTimer = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(acceptanceTimer);
                // Auto-decline if not accepted
                declineTrip();
            }
        }, 1000);
    }

    function showAuthModal() {
        authModal.style.display = 'block';
    }

    function showDashboard() {
        dashboardContainer.style.display = 'flex';
        loadDriverData();
        // Initialize dashboard state
        handleOnlineToggle();
        // Load dark theme preference
        const savedDarkTheme = localStorage.getItem('darkTheme') === 'true';
        document.getElementById('darkTheme').checked = savedDarkTheme;
        document.body.classList.toggle('dark-theme', savedDarkTheme);
    }

    function loadDriverData() {
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const driverEmail = localStorage.getItem('driverEmail') || 'driver@example.com';
        
        // Load driver stats from localStorage or use defaults
        const driverStats = JSON.parse(localStorage.getItem('driverStats') || '{}');
        
        document.getElementById('driverName').textContent = driverName;
        document.getElementById('driverAvatar').src = 'https://via.placeholder.com/150';
        document.getElementById('profileAvatar').src = 'https://via.placeholder.com/150';
        document.getElementById('rating').textContent = driverStats.rating || '4.8';
        document.getElementById('acceptanceRate').textContent = `${driverStats.acceptanceRate || 95}%`;
        document.getElementById('totalTrips').textContent = driverStats.totalTrips || 0;
        document.getElementById('earnings').textContent = `$${driverStats.totalEarnings || 0}`;
        document.getElementById('todayEarnings').textContent = `$${driverStats.todayEarnings || 0}`;
        document.getElementById('weekEarnings').textContent = `$${driverStats.weekEarnings || 0}`;
        document.getElementById('monthEarnings').textContent = `$${driverStats.monthEarnings || 0}`;
        
        // Update profile form with real data
        document.getElementById('profileName').value = driverName;
        document.getElementById('profileEmail').value = driverEmail;
        document.getElementById('profilePhone').value = driverStats.phone || '+1234567890';
        document.getElementById('profileLicense').value = driverStats.license || 'DL123456789';
        document.getElementById('profileVehicle').value = driverStats.vehicle || 'Toyota Camry - ABC123';
    }

    function switchSection(sectionName) {
        // Update navigation
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        // Show content section
        contentSections.forEach(section => {
            section.classList.remove('active');
            const sectionId = sectionName === 'overview' ? 'statisticsSection' : `${sectionName}Section`;
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });

        // Close sidebar on mobile
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('show');
        }
    }

    function toggleSidebar() {
        sidebar.classList.toggle('show');
    }

    function loadMockData() {
        loadActivities();
        loadTrips();
        loadHistory();
        loadPayouts();
        loadDriverData();
    }

    function loadActivities() {
        const activityList = document.getElementById('activityList');
        activityList.innerHTML = '';
        
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const activities = [];
        
        // Get recent completed trips
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        const completedTrips = requests.filter(r => 
            r.assignedDriver === driverName && r.status === 'completed'
        ).slice(-5); // Last 5 completed trips
        
        completedTrips.forEach(trip => {
            activities.push({
                type: 'trip',
                message: `Completed trip: ${trip.pickup} → ${trip.dropoff}`,
                time: getTimeAgo(new Date(trip.timestamp))
            });
        });
        
        // Get recent notifications
        const notifications = JSON.parse(localStorage.getItem('driverNotifications') || '[]');
        const recentNotifications = notifications.filter(n => 
            n.driverName === driverName
        ).slice(-3); // Last 3 notifications
        
        recentNotifications.forEach(notification => {
            if (notification.type === 'new_assignment') {
                activities.push({
                    type: 'trip',
                    message: 'Accepted new trip request',
                    time: getTimeAgo(new Date(notification.timestamp))
                });
            }
        });
        
        // Sort by time (most recent first)
        activities.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        // If no activities, show default message
        if (activities.length === 0) {
            activities.push({
                type: 'info',
                message: 'Welcome to Teleka Taxi! Start accepting trips to see your activity here.',
                time: 'Just now'
            });
        }
        
        activities.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-icon">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.message}</h4>
                    <p>${activity.time}</p>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }
    
    function getTimeAgo(date) {
        const now = new Date();
        const diffInMs = now - date;
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        return `${diffInDays} days ago`;
    }

    function getActivityIcon(type) {
        const icons = {
            trip: 'route',
            rating: 'star',
            payment: 'dollar-sign'
        };
        return icons[type] || 'info-circle';
    }

    function loadTrips() {
        const tripsList = document.getElementById('tripsList');
        tripsList.innerHTML = '';
        
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        
        // Filter requests assigned to this driver and pending
        const assignedRequests = requests.filter(r => 
            r.assignedDriver === driverName && r.status === 'assigned'
        );
        
        if (assignedRequests.length === 0) {
            tripsList.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-color);">No trips available</p>';
            return;
        }

        assignedRequests.forEach(request => {
            const tripCard = document.createElement('div');
            tripCard.className = 'trip-card';
            tripCard.innerHTML = `
                <div class="trip-header">
                    <div class="trip-route">${request.pickup} → ${request.dropoff}</div>
                    <div class="trip-fare">$25.50</div>
                </div>
                <div class="trip-details">
                    <div class="trip-detail">
                        <span>Distance:</span>
                        <span>5.2 km</span>
                    </div>
                    <div class="trip-detail">
                        <span>Duration:</span>
                        <span>15 min</span>
                    </div>
                    <div class="trip-detail">
                        <span>Passenger:</span>
                        <span>${request.passengerName}</span>
                    </div>
                </div>
                <div class="trip-actions">
                    <button class="btn-success" onclick="acceptTrip('${request.id}')">Accept</button>
                    <button class="btn-danger" onclick="declineTrip('${request.id}')">Decline</button>
                </div>
            `;
            tripsList.appendChild(tripCard);
        });
    }

    function loadHistory() {
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        
        // Filter completed and cancelled trips for this driver
        const tripHistory = requests.filter(r => 
            r.assignedDriver === driverName && (r.status === 'completed' || r.status === 'cancelled')
        );
        
        if (tripHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-color);">No trip history yet</p>';
            return;
        }
        
        tripHistory.forEach(trip => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const tripDate = new Date(trip.timestamp).toLocaleDateString();
            historyItem.innerHTML = `
                <div class="history-info">
                    <h4>${trip.pickup} → ${trip.dropoff}</h4>
                    <p>${tripDate} • $${trip.fare || '25.50'}</p>
                </div>
                <div class="history-status status-${trip.status}">${trip.status}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    function loadPayouts() {
        const payoutTableBody = document.getElementById('payoutTableBody');
        payoutTableBody.innerHTML = '';
        
        // Load payouts from localStorage or use default data
        const payouts = JSON.parse(localStorage.getItem('driverPayouts') || '[]');
        
        if (payouts.length === 0) {
            // Default payouts for demo
            const defaultPayouts = [
                { date: '2024-02-15', amount: 280.50, status: 'Paid' },
                { date: '2024-02-01', amount: 245.75, status: 'Paid' },
                { date: '2024-01-15', amount: 198.25, status: 'Processing' }
            ];
            localStorage.setItem('driverPayouts', JSON.stringify(defaultPayouts));
            
            defaultPayouts.forEach(payout => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payout.date}</td>
                    <td>$${payout.amount}</td>
                    <td>${payout.status}</td>
                `;
                payoutTableBody.appendChild(row);
            });
        } else {
            payouts.forEach(payout => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${payout.date}</td>
                    <td>$${payout.amount}</td>
                    <td>${payout.status}</td>
                `;
                payoutTableBody.appendChild(row);
            });
        }
    }

    function filterHistory() {
        const filter = document.getElementById('historyFilter').value;
        const date = document.getElementById('historyDate').value;
        
        const driverName = localStorage.getItem('driverName') || 'John Doe';
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        
        let filteredHistory = requests.filter(r => 
            r.assignedDriver === driverName && (r.status === 'completed' || r.status === 'cancelled')
        );
        
        if (filter !== 'all') {
            filteredHistory = filteredHistory.filter(item => item.status === filter);
        }
        
        if (date) {
            filteredHistory = filteredHistory.filter(item => {
                const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
                return itemDate === date;
            });
        }
        
        // Re-render filtered history
        const historyList = document.getElementById('historyList');
        historyList.innerHTML = '';
        
        if (filteredHistory.length === 0) {
            historyList.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-color);">No trips found for the selected filters</p>';
            return;
        }
        
        filteredHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            const tripDate = new Date(item.timestamp).toLocaleDateString();
            historyItem.innerHTML = `
                <div class="history-info">
                    <h4>${item.pickup} → ${item.dropoff}</h4>
                    <p>${tripDate} • $${item.fare || '25.50'}</p>
                </div>
                <div class="history-status status-${item.status}">${item.status}</div>
            `;
            historyList.appendChild(historyItem);
        });
    }

    function showTripModal(tripId) {
        const trip = mockData.trips.find(t => t.id === tripId);
        if (trip) {
            document.getElementById('tripDetails').innerHTML = `
                <div class="trip-detail-modal">
                    <span>Pickup:</span>
                    <span>${trip.pickup}</span>
                </div>
                <div class="trip-detail-modal">
                    <span>Dropoff:</span>
                    <span>${trip.dropoff}</span>
                </div>
                <div class="trip-detail-modal">
                    <span>Distance:</span>
                    <span>${trip.distance}</span>
                </div>
                <div class="trip-detail-modal">
                    <span>Duration:</span>
                    <span>${trip.duration}</span>
                </div>
                <div class="trip-detail-modal">
                    <span>Fare:</span>
                    <span>$${trip.fare}</span>
                </div>
                <div class="trip-detail-modal">
                    <span>Passenger:</span>
                    <span>${trip.passenger}</span>
                </div>
            `;
            tripModal.style.display = 'block';
            tripModal.dataset.tripId = tripId;
        }
    }

    function handleTripAction(action) {
        if (action === 'accept') {
            clearInterval(acceptanceTimer);
            acceptanceTimer = null;
            hideAllTripStates();
            acceptedTrip.style.display = 'block';

            // Populate accepted trip details
            document.getElementById('acceptedPickup').textContent = currentTrip.pickup;
            document.getElementById('acceptedDropoff').textContent = currentTrip.dropoff;
            document.getElementById('passengerName').textContent = currentTrip.passenger;
        } else if (action === 'decline') {
            clearInterval(acceptanceTimer);
            acceptanceTimer = null;
            currentTrip = null;
            startFindingTrips();
        }
    }

    function declineTrip(tripId) {
        declineTripRequest(tripId);
    }

    function acceptTrip(requestId) {
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            // Update request status
            requests[requestIndex].status = 'in_progress';
            localStorage.setItem('rideRequests', JSON.stringify(requests));
            
            // Update active trips
            const trips = JSON.parse(localStorage.getItem('activeTrips') || '[]');
            const tripIndex = trips.findIndex(t => t.id === requestId);
            if (tripIndex !== -1) {
                trips[tripIndex].status = 'in_progress';
                localStorage.setItem('activeTrips', JSON.stringify(trips));
            }
            
            // Update driver stats
            updateDriverStats(requestId);
            
            // Show accepted trip UI
            hideAllTripStates();
            acceptedTrip.style.display = 'block';
            
            // Populate accepted trip details
            document.getElementById('acceptedPickup').textContent = requests[requestIndex].pickup;
            document.getElementById('acceptedDropoff').textContent = requests[requestIndex].dropoff;
            document.getElementById('passengerName').textContent = requests[requestIndex].passengerName;
            
            loadTrips(); // Refresh trips list
        }
    }
    
    function updateDriverStats(requestId) {
        const driverStats = JSON.parse(localStorage.getItem('driverStats') || '{}');
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        const request = requests.find(r => r.id === requestId);
        
        if (request) {
            driverStats.totalTrips = (driverStats.totalTrips || 0) + 1;
            const fare = 25.50; // Default fare
            driverStats.totalEarnings = (driverStats.totalEarnings || 0) + fare;
            driverStats.todayEarnings = (driverStats.todayEarnings || 0) + fare;
            driverStats.weekEarnings = (driverStats.weekEarnings || 0) + fare;
            driverStats.monthEarnings = (driverStats.monthEarnings || 0) + fare;
            
            localStorage.setItem('driverStats', JSON.stringify(driverStats));
            
            // Refresh driver data display
            loadDriverData();
        }
    }

    function declineTripRequest(requestId) {
        const requests = JSON.parse(localStorage.getItem('rideRequests') || '[]');
        const requestIndex = requests.findIndex(r => r.id === requestId);
        
        if (requestIndex !== -1) {
            // Update request status back to pending so another driver can take it
            requests[requestIndex].status = 'pending';
            requests[requestIndex].assignedDriver = null;
            localStorage.setItem('rideRequests', JSON.stringify(requests));
            
            // Remove from active trips
            const trips = JSON.parse(localStorage.getItem('activeTrips') || '[]');
            const updatedTrips = trips.filter(t => t.id !== requestId);
            localStorage.setItem('activeTrips', JSON.stringify(updatedTrips));
            
            loadTrips(); // Refresh trips list
            startFindingTrips(); // Go back to finding trips
        }
    }

    // Dashboard Functions
    function handleOnlineToggle() {
        const isOnline = onlineToggle.checked;
        statusText.textContent = isOnline ? 'Online' : 'Offline';
        statusIndicator.classList.toggle('online', isOnline);
        statusIndicator.querySelector('span').textContent = isOnline ? 'Online' : 'Offline';

        if (isOnline) {
            startFindingTrips();
        } else {
            stopFindingTrips();
        }
    }

    function handleDarkThemeToggle() {
        const isDark = document.getElementById('darkTheme').checked;
        document.body.classList.toggle('dark-theme', isDark);
        localStorage.setItem('darkTheme', isDark);
    }

    function startFindingTrips() {
        showFindingTrips();
        // Simulate finding a trip after 3-8 seconds
        setTimeout(() => {
            if (onlineToggle.checked && mockData.trips.length > 0) {
                showActiveTrip(mockData.trips[0]);
            }
        }, Math.random() * 5000 + 3000);
    }

    function stopFindingTrips() {
        hideAllTripStates();
        findingTrips.style.display = 'none';
        if (acceptanceTimer) {
            clearInterval(acceptanceTimer);
            acceptanceTimer = null;
        }
    }

    function showFindingTrips() {
        hideAllTripStates();
        findingTrips.style.display = 'block';
    }

    function showActiveTrip(trip) {
        currentTrip = trip;
        hideAllTripStates();
        activeTrip.style.display = 'block';

        // Populate trip details
        document.getElementById('pickupAddress').textContent = trip.pickup;
        document.getElementById('dropoffAddress').textContent = trip.dropoff;
        document.getElementById('tripDistance').textContent = trip.distance;
        document.getElementById('tripDuration').textContent = trip.duration;
        document.getElementById('tripFare').textContent = `$${trip.fare}`;

        // Start acceptance timer
        let timeLeft = 30;
        document.getElementById('timerValue').textContent = timeLeft;

        acceptanceTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('timerValue').textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(acceptanceTimer);
                acceptanceTimer = null;
                // Auto-decline trip
                handleTripAction('decline');
            }
        }, 1000);
    }

    function hideAllTripStates() {
        findingTrips.style.display = 'none';
        activeTrip.style.display = 'none';
        acceptedTrip.style.display = 'none';
        ongoingTrip.style.display = 'none';
        tripCompleted.style.display = 'none';
    }

    function startTrip() {
        hideAllTripStates();
        acceptedTrip.style.display = 'none';
        ongoingTrip.style.display = 'block';

        // Populate ongoing trip details
        document.getElementById('ongoingPickup').textContent = currentTrip.pickup;
        document.getElementById('ongoingDropoff').textContent = currentTrip.dropoff;

        // Start trip timer
        tripStartTime = Date.now();
        tripTimer = setInterval(updateTripTimer, 1000);
    }

    function updateTripTimer() {
        const elapsed = Math.floor((Date.now() - tripStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        document.getElementById('ongoingTimer').textContent =
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function cancelTrip() {
        if (confirm('Are you sure you want to cancel this trip?')) {
            clearInterval(tripTimer);
            tripTimer = null;
            currentTrip = null;
            startFindingTrips();
        }
    }

    function endTrip() {
        clearInterval(tripTimer);
        tripTimer = null;
        hideAllTripStates();
        tripCompleted.style.display = 'block';

        // Populate completion details
        document.getElementById('completedDistance').textContent = currentTrip.distance;
        document.getElementById('completedDuration').textContent = document.getElementById('ongoingTimer').textContent;
        document.getElementById('completedFare').textContent = `$${currentTrip.fare}`;
    }

    function collectCash() {
        alert(`Cash collected: $${currentTrip.fare}`);
        // Add to earnings
        mockData.earnings.today += currentTrip.fare;
        mockData.earnings.month += currentTrip.fare;

        // Add to history
        mockData.history.unshift({
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            pickup: currentTrip.pickup,
            dropoff: currentTrip.dropoff,
            fare: currentTrip.fare,
            status: 'completed'
        });

        // Remove from available trips
        mockData.trips = mockData.trips.filter(t => t.id !== currentTrip.id);

        currentTrip = null;
        loadDriverData();
        loadHistory();
        startFindingTrips();
    }

    function handleProfileUpdate(e) {
        e.preventDefault();
        // Mock profile update
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;
        const license = document.getElementById('profileLicense').value;
        const vehicle = document.getElementById('profileVehicle').value;

        // Update mock data
        mockData.driver.name = name;
        mockData.driver.email = email;
        mockData.driver.phone = phone;
        mockData.driver.license = license;
        mockData.driver.vehicle = vehicle;

        // Update UI
        document.getElementById('driverName').textContent = name;
        localStorage.setItem('driverName', name);

        alert('Profile updated successfully!');
    }

    // Make functions global for onclick handlers
    window.showTripModal = showTripModal;
    window.declineTrip = declineTrip;
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));

// API Routes

// Get all ride requests
app.get('/api/requests', (req, res) => {
    try {
        const requests = getDataFromFile('rideRequests') || [];
        res.json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
});

// Create new ride request
app.post('/api/requests', (req, res) => {
    try {
        const requests = getDataFromFile('rideRequests') || [];
        const newRequest = {
            id: generateId(),
            ...req.body,
            status: 'pending',
            timestamp: new Date().toISOString(),
            assignedDriver: null
        };

        requests.push(newRequest);
        saveDataToFile('rideRequests', requests);

        // Create notification for admin
        createNotification({
            type: 'new_request',
            message: `New ride request from ${newRequest.passengerName}`,
            data: newRequest
        });

        res.status(201).json(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        res.status(500).json({ error: 'Failed to create request' });
    }
});

// Update ride request
app.put('/api/requests/:id', (req, res) => {
    try {
        const requests = getDataFromFile('rideRequests') || [];
        const requestIndex = requests.findIndex(r => r.id === req.params.id);

        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Request not found' });
        }

        requests[requestIndex] = { ...requests[requestIndex], ...req.body };
        saveDataToFile('rideRequests', requests);

        res.json(requests[requestIndex]);
    } catch (error) {
        console.error('Error updating request:', error);
        res.status(500).json({ error: 'Failed to update request' });
    }
});

// Get all drivers
app.get('/api/drivers', (req, res) => {
    try {
        const drivers = getDataFromFile('drivers') || [];
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});

// Assign driver to request
app.post('/api/requests/:id/assign', (req, res) => {
    try {
        const { driverId, driverName } = req.body;
        const requests = getDataFromFile('rideRequests') || [];
        const requestIndex = requests.findIndex(r => r.id === req.params.id);

        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Request not found' });
        }

        requests[requestIndex].status = 'assigned';
        requests[requestIndex].assignedDriver = driverName;
        saveDataToFile('rideRequests', requests);

        // Add to active trips
        const activeTrips = getDataFromFile('activeTrips') || [];
        activeTrips.push({
            id: requests[requestIndex].id,
            driver: driverName,
            customer: requests[requestIndex].passengerName,
            route: `${requests[requestIndex].pickup} → ${requests[requestIndex].dropoff}`,
            status: 'assigned',
            amount: `$${requests[requestIndex].fare || '25.50'}`,
            time: new Date().toLocaleTimeString()
        });
        saveDataToFile('activeTrips', activeTrips);

        // Create notification for driver
        createDriverNotification(driverName, {
            type: 'new_assignment',
            message: `New trip assigned: ${req.params.id}`,
            requestId: req.params.id
        });

        res.json(requests[requestIndex]);
    } catch (error) {
        console.error('Error assigning driver:', error);
        res.status(500).json({ error: 'Failed to assign driver' });
    }
});

// Get notifications
app.get('/api/notifications', (req, res) => {
    try {
        const notifications = getDataFromFile('notifications') || [];
        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Get driver notifications
app.get('/api/driver-notifications/:driverName', (req, res) => {
    try {
        const notifications = getDataFromFile('driverNotifications') || [];
        const driverNotifications = notifications.filter(n => n.driverName === req.params.driverName);
        res.json(driverNotifications);
    } catch (error) {
        console.error('Error fetching driver notifications:', error);
        res.status(500).json({ error: 'Failed to fetch driver notifications' });
    }
});

// Mark notification as read
app.put('/api/driver-notifications/:id/read', (req, res) => {
    try {
        const notifications = getDataFromFile('driverNotifications') || [];
        const notificationIndex = notifications.findIndex(n => n.id === req.params.id);

        if (notificationIndex !== -1) {
            notifications[notificationIndex].read = true;
            saveDataToFile('driverNotifications', notifications);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
});

// Get active trips
app.get('/api/trips/active', (req, res) => {
    try {
        const trips = getDataFromFile('activeTrips') || [];
        res.json(trips);
    } catch (error) {
        console.error('Error fetching active trips:', error);
        res.status(500).json({ error: 'Failed to fetch active trips' });
    }
});

// Complete trip
app.post('/api/trips/:id/complete', (req, res) => {
    try {
        const requests = getDataFromFile('rideRequests') || [];
        const requestIndex = requests.findIndex(r => r.id === req.params.id);

        if (requestIndex !== -1) {
            requests[requestIndex].status = 'completed';
            saveDataToFile('rideRequests', requests);
        }

        // Update active trips
        const trips = getDataFromFile('activeTrips') || [];
        const updatedTrips = trips.filter(t => t.id !== req.params.id);
        saveDataToFile('activeTrips', updatedTrips);

        res.json({ success: true });
    } catch (error) {
        console.error('Error completing trip:', error);
        res.status(500).json({ error: 'Failed to complete trip' });
    }
});

// Initialize sample data
app.post('/api/initialize', (req, res) => {
    try {
        initializeSampleData();
        res.json({ message: 'Sample data initialized successfully' });
    } catch (error) {
        console.error('Error initializing data:', error);
        res.status(500).json({ error: 'Failed to initialize data' });
    }
});

// Serve index.html for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Helper functions
function getDataFromFile(filename) {
    try {
        const filePath = path.join(__dirname, 'data', `${filename}.json`);
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        console.error(`Error reading ${filename}:`, error);
        return null;
    }
}

function saveDataToFile(filename, data) {
    try {
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        const filePath = path.join(dataDir, `${filename}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error saving ${filename}:`, error);
        throw error;
    }
}

function generateId() {
    return 'REQ' + Date.now() + Math.random().toString(36).substr(2, 9);
}

function createNotification(notification) {
    const notifications = getDataFromFile('notifications') || [];
    notifications.push({
        id: 'NOTIF' + Date.now(),
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
    });
    saveDataToFile('notifications', notifications);
}

function createDriverNotification(driverName, notification) {
    const notifications = getDataFromFile('driverNotifications') || [];
    notifications.push({
        id: 'DNOTIF' + Date.now(),
        driverName: driverName,
        ...notification,
        timestamp: new Date().toISOString(),
        read: false
    });
    saveDataToFile('driverNotifications', notifications);
}

function initializeSampleData() {
    // Sample drivers
    const drivers = [
        { id: 'D001', name: 'John Smith', email: 'john@example.com', phone: '+1234567890', license: 'DL123456789' },
        { id: 'D002', name: 'Mike Johnson', email: 'mike@example.com', phone: '+1234567891', license: 'DL987654321' },
        { id: 'D003', name: 'Sarah Davis', email: 'sarah@example.com', phone: '+1234567892', license: 'DL456789123' }
    ];
    saveDataToFile('drivers', drivers);

    // Sample requests
    const requests = [
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
            timestamp: new Date(Date.now() - 3600000).toISOString(),
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
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            assignedDriver: 'John Smith',
            fare: 25.50
        }
    ];
    saveDataToFile('rideRequests', requests);

    // Sample active trips
    const activeTrips = [
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
    saveDataToFile('activeTrips', activeTrips);

    // Sample driver stats
    const driverStats = {
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
    saveDataToFile('driverStats', driverStats);
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Teleka Taxi server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`📊 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`👨‍💼 Driver: http://localhost:${PORT}/driver-dashboard.html`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down Teleka Taxi server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down Teleka Taxi server...');
    process.exit(0);
});
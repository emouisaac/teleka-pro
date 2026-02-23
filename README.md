# Teleka Taxi Management System

A full-stack taxi service management system with real-time communication between customers, administrators, and drivers.

## Features

- **Customer Interface**: Book rides with real-time fare calculation
- **Admin Dashboard**: Manage ride requests, assign drivers, track trips
- **Driver Dashboard**: Receive assignments, track earnings, manage trips
- **Real-time Notifications**: Instant updates across all interfaces
- **RESTful API**: Backend API for data management

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Data Storage**: File-based JSON storage (ready for database migration)
- **Authentication**: JWT (planned)
- **Development**: Nodemon for auto-restart

## Quick Start

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   cd "path/to/project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

4. **Access the application**
   - **Customer Booking**: http://localhost:3000
   - **Admin Dashboard**: http://localhost:3000/admin.html
   - **Driver Dashboard**: http://localhost:3000/driver-dashboard.html
   - **API Documentation**: http://localhost:3000/api

## API Endpoints

### Ride Requests
- `GET /api/requests` - Get all ride requests
- `POST /api/requests` - Create new ride request
- `PUT /api/requests/:id` - Update ride request
- `POST /api/requests/:id/assign` - Assign driver to request

### Drivers
- `GET /api/drivers` - Get all drivers

### Trips
- `GET /api/trips/active` - Get active trips
- `POST /api/trips/:id/complete` - Complete a trip

### Notifications
- `GET /api/notifications` - Get admin notifications
- `GET /api/driver-notifications/:driverName` - Get driver notifications
- `PUT /api/driver-notifications/:id/read` - Mark notification as read

### Initialization
- `POST /api/initialize` - Load sample data

## Project Structure

```
├── index.html              # Customer booking interface
├── admin.html              # Admin management dashboard
├── driver-dashboard.html   # Driver interface
├── style.css               # Main styles
├── admin.css               # Admin-specific styles
├── driver-dashboard.css    # Driver-specific styles
├── script.js               # Customer booking logic
├── admin.js                # Admin dashboard logic
├── driver-dashboard.js     # Driver dashboard logic
├── server.js               # Express server
├── package.json            # Node.js dependencies
├── .env                    # Environment variables
├── .gitignore              # Git ignore rules
└── data/                   # JSON data storage (created automatically)
    ├── rideRequests.json
    ├── drivers.json
    ├── activeTrips.json
    ├── notifications.json
    └── driverNotifications.json
```

## Development

### Adding New Features

1. **Frontend Changes**: Modify the respective HTML/JS files
2. **Backend Changes**: Update `server.js` with new endpoints
3. **Data Changes**: Update the data handling functions

### Environment Variables

Configure the following in `.env`:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=http://localhost:3000
```

## Deployment

### For Production
1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2
3. Consider migrating from file-based storage to a database (MongoDB recommended)
4. Set up proper authentication and authorization

### Database Migration
The current system uses file-based JSON storage for simplicity. For production, migrate to:
- MongoDB with Mongoose ODM
- PostgreSQL with Sequelize ORM
- Or any preferred database solution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions, please create an issue in the repository or contact the development team.
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database setup
const dbPath = process.env.TELEKA_DB_PATH || path.join(__dirname, 'teleka.db');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
  secret: process.env.AUTH_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: __dirname }),
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Passport strategies
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.APP_URL}/auth/google/callback`
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;

    // Check if user exists
    db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
      if (err) return done(err);

      if (user) {
        return done(null, { id: user.id, email: user.email, name: user.name, role: 'customer' });
      } else {
        // Create new user
        db.run('INSERT INTO users (email, name, role, google_id) VALUES (?, ?, ?, ?)',
          [email, name, 'customer', profile.id], function(err) {
            if (err) return done(err);
            return done(null, { id: this.lastID, email, name, role: 'customer' });
          });
      }
    });
  } catch (error) {
    return done(error);
  }
}));

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  if (email === process.env.ADMIN_EMAIL) {
    bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH, (err, isMatch) => {
      if (err) return done(err);
      if (isMatch) {
        return done(null, { id: 'admin', email, name: 'Admin', role: 'admin' });
      } else {
        return done(null, false, { message: 'Invalid credentials' });
      }
    });
  } else {
    return done(null, false, { message: 'Invalid credentials' });
  }
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Database initialization
function initDatabase() {
  db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      google_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Drivers table
    db.run(`CREATE TABLE IF NOT EXISTS drivers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      license_number TEXT,
      vehicle_info TEXT,
      status TEXT DEFAULT 'pending',
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      approved_at DATETIME,
      approved_by INTEGER
    )`);

    // Sessions table for SQLite store
    db.run(`CREATE TABLE IF NOT EXISTS sessions (
      sid TEXT PRIMARY KEY,
      sess TEXT NOT NULL,
      expire INTEGER NOT NULL
    )`);

    // Hash admin password if not already hashed
    if (process.env.ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD_HASH) {
      const hash = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);
      console.log('Admin password hash:', hash);
      // In production, store this in .env
    }
  });
}

// Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/index.html' }),
  (req, res) => {
    res.redirect('/index.html');
  }
);

app.post('/auth/admin/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/auth/admin/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});

app.post('/auth/driver/register', async (req, res) => {
  const { email, name, phone, licenseNumber, vehicleInfo, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO drivers (email, name, phone, license_number, vehicle_info, password_hash)
            VALUES (?, ?, ?, ?, ?, ?)`,
      [email, name, phone, licenseNumber, vehicleInfo, hashedPassword],
      function(err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') {
            return res.status(400).json({ error: 'Email already registered' });
          }
          return res.status(500).json({ error: 'Registration failed' });
        }
        res.json({ success: true, message: 'Registration submitted for approval' });
      });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/auth/driver/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM drivers WHERE email = ? AND status = ?', [email, 'approved'], (err, driver) => {
    if (err) return res.status(500).json({ error: 'Server error' });
    if (!driver) return res.status(401).json({ error: 'Invalid credentials or account not approved' });

    bcrypt.compare(password, driver.password_hash, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign(
        { id: driver.id, email: driver.email, role: 'driver' },
        process.env.AUTH_SECRET,
        { expiresIn: '30d' }
      );

      res.json({ success: true, token, driver: { id: driver.id, name: driver.name, email: driver.email } });
    });
  });
});

app.post('/auth/driver/verify', (req, res) => {
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.AUTH_SECRET);
    if (decoded.role === 'driver') {
      db.get('SELECT id, name, email FROM drivers WHERE id = ? AND status = ?', [decoded.id, 'approved'], (err, driver) => {
        if (err) return res.status(500).json({ error: 'Server error' });
        if (!driver) return res.status(401).json({ valid: false });
        res.json({ valid: true, driver });
      });
    } else {
      res.status(401).json({ valid: false });
    }
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

app.get('/auth/status', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

app.get('/api/drivers/pending', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  db.all('SELECT id, email, name, phone, license_number, vehicle_info, created_at FROM drivers WHERE status = ?',
    ['pending'], (err, drivers) => {
      if (err) return res.status(500).json({ error: 'Server error' });
      res.json(drivers);
    });
});

app.post('/api/drivers/approve/:id', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const driverId = req.params.id;
  db.run('UPDATE drivers SET status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ? WHERE id = ?',
    ['approved', req.user.id, driverId], function(err) {
      if (err) return res.status(500).json({ error: 'Approval failed' });
      res.json({ success: true });
    });
});

app.post('/api/drivers/reject/:id', (req, res) => {
  if (!req.isAuthenticated() || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const driverId = req.params.id;
  db.run('DELETE FROM drivers WHERE id = ?', [driverId], function(err) {
      if (err) return res.status(500).json({ error: 'Rejection failed' });
      res.json({ success: true });
    });
});

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/driver', (req, res) => res.sendFile(path.join(__dirname, 'driver.html')));

// Start server
initDatabase();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
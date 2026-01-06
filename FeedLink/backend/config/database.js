const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('donor', 'volunteer', 'ngo', 'admin')),
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Migration: Add location columns if they don't exist (backward compatible)
  db.run(`ALTER TABLE users ADD COLUMN latitude REAL DEFAULT 0.0`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding latitude column:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN longitude REAL DEFAULT 0.0`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding longitude column:', err);
    }
  });
  
  db.run(`ALTER TABLE users ADD COLUMN city TEXT DEFAULT ''`, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('Error adding city column:', err);
    }
  });

  // Donations table
  db.run(`CREATE TABLE IF NOT EXISTS donations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    donor_id INTEGER NOT NULL,
    food_name TEXT NOT NULL,
    food_type TEXT NOT NULL,
    quantity TEXT NOT NULL,
    pickup_address TEXT NOT NULL,
    expiry_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'assigned', 'delivered')),
    volunteer_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id),
    FOREIGN KEY (volunteer_id) REFERENCES users(id)
  )`);

  // Note: Admin users can be registered through the /api/auth/register endpoint
});

module.exports = db;


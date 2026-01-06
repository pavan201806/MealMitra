const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, role, phone, address, latitude, longitude, city } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, role, phone, address, latitude, longitude, city) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, 
          email, 
          hashedPassword, 
          role, 
          phone || null, 
          address || null,
          latitude || null,
          longitude || null,
          city || null
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...userData, password: undefined });
        }
      );
    });
  }

  static async update(id, userData) {
    const { name, phone, address, latitude, longitude, city } = userData;
    
    return new Promise((resolve, reject) => {
      const updates = [];
      const values = [];
      
      if (name !== undefined) {
        updates.push('name = ?');
        values.push(name);
      }
      if (phone !== undefined) {
        updates.push('phone = ?');
        values.push(phone);
      }
      if (address !== undefined) {
        updates.push('address = ?');
        values.push(address);
      }
      if (latitude !== undefined) {
        updates.push('latitude = ?');
        values.push(latitude);
      }
      if (longitude !== undefined) {
        updates.push('longitude = ?');
        values.push(longitude);
      }
      if (city !== undefined) {
        updates.push('city = ?');
        values.push(city);
      }
      
      if (updates.length === 0) {
        return resolve(null);
      }
      
      values.push(id);
      
      db.run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) reject(err);
          else resolve({ id, changes: this.changes });
        }
      );
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, name, email, role, phone, address, latitude, longitude, city, created_at FROM users WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, phone, address, latitude, longitude, city, created_at FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;


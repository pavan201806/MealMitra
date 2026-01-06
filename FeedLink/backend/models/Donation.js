const db = require('../config/database');

class Donation {
  static async create(donationData) {
    const { donor_id, food_name, food_type, quantity, pickup_address, expiry_time, volunteer_id, ngo_id } = donationData;

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO donations (donor_id, food_name, food_type, quantity, pickup_address, expiry_time, volunteer_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [donor_id, food_name, food_type, quantity, pickup_address, expiry_time, volunteer_id || null, volunteer_id ? 'assigned' : 'pending'],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID, ...donationData, status: volunteer_id ? 'assigned' : 'pending' });
        }
      );
    });
  }

  static async findByDonorId(donorId) {
    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM donations WHERE donor_id = ? ORDER BY created_at DESC',
        [donorId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async findAvailable() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT d.*, u.name as donor_name, u.phone as donor_phone 
         FROM donations d 
         JOIN users u ON d.donor_id = u.id 
         WHERE d.status = 'pending' 
         ORDER BY d.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async assign(donationId, volunteerId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE donations SET status = 'assigned', volunteer_id = ? WHERE id = ? AND status = 'pending'`,
        [volunteerId, donationId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async complete(donationId, volunteerId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE donations SET status = 'delivered' WHERE id = ? AND volunteer_id = ? AND status = 'assigned'`,
        [donationId, volunteerId],
        function(err) {
          if (err) reject(err);
          else resolve({ changes: this.changes });
        }
      );
    });
  }

  static async findNearby(address) {
    // Simple implementation - in production, use geolocation
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT d.*, u.name as donor_name, u.phone as donor_phone 
         FROM donations d 
         JOIN users u ON d.donor_id = u.id 
         WHERE d.status = 'delivered' 
         ORDER BY d.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async getAll() {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT d.*, 
         u1.name as donor_name, u1.email as donor_email,
         u2.name as volunteer_name, u2.email as volunteer_email
         FROM donations d 
         LEFT JOIN users u1 ON d.donor_id = u1.id 
         LEFT JOIN users u2 ON d.volunteer_id = u2.id 
         ORDER BY d.created_at DESC`,
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async findByVolunteerId(volunteerId) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT d.*, u.name as donor_name, u.phone as donor_phone 
         FROM donations d 
         JOIN users u ON d.donor_id = u.id 
         WHERE d.volunteer_id = ? AND d.status IN ('assigned', 'delivered')
         ORDER BY d.created_at DESC`,
        [volunteerId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM donations WHERE id = ?', [id], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = Donation;


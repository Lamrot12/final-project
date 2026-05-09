const { pool } = require('../config/database');

class Pharmacy {
  static async create(pharmacyData) {
    const { pharmacy_name, address, phone, email, latitude, longitude, operating_hours, license_number } = pharmacyData;
    const query = `
      INSERT INTO pharmacies (pharmacy_name, address, phone, email, latitude, longitude, operating_hours, license_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [pharmacy_name, address, phone, email, latitude, longitude, operating_hours, license_number];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = 'SELECT * FROM pharmacies ORDER BY pharmacy_name';
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM pharmacies WHERE pharmacy_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findNearby(lat, lng, radius = 5) {
    const query = `
      SELECT *, 
             (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
             cos(radians(longitude) - radians($2)) + 
             sin(radians($1)) * sin(radians(latitude)))) AS distance
      FROM pharmacies
      HAVING distance < $3
      ORDER BY distance
    `;
    const result = await pool.query(query, [lat, lng, radius]);
    return result.rows;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM pharmacies WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async getInventory(pharmacyId) {
    const query = `
      SELECT m.*, ps.quantity, ps.expiry_date
      FROM pharmacy_stocks ps
      JOIN medicines m ON ps.medicine_id = m.medicine_id
      WHERE ps.pharmacy_id = $1
      ORDER BY m.generic_name
    `;
    const result = await pool.query(query, [pharmacyId]);
    return result.rows;
  }
}

module.exports = Pharmacy;

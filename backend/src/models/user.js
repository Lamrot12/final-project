const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, full_name, phone, user_type } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (email, password, full_name, phone, user_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, email, full_name, phone, user_type, created_at
    `;
    const values = [email, hashedPassword, full_name, phone, user_type];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT user_id, email, full_name, phone, user_type, created_at FROM users WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;

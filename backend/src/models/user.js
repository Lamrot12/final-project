const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { email, password, full_name, phone, role_id } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (email, password_hash, full_name, phone, role_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING user_id, email, full_name, phone, role_id, is_active, created_at
    `;
    const values = [email, hashedPassword, full_name, phone, role_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = `
      SELECT u.*, r.role_name 
      FROM users u 
      LEFT JOIN user_role r ON u.role_id = r.role_id 
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = `
      SELECT user_id, email, full_name, phone, role_id, is_active, created_at 
      FROM users 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async getRoleId(roleName) {
    const query = 'SELECT role_id FROM user_role WHERE role_name = $1';
    const result = await pool.query(query, [roleName]);
    return result.rows[0]?.role_id;
  }
}

module.exports = User;

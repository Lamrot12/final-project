const { pool } = require("../config/database");



const SubscriptionModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO subscription 
       (plan_id, pharmacy_id, receipt_image_url, verification_status, verified_by, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.plan_id,
        data.pharmacy_id,
        data.receipt_image_url,
        data.verification_status || false,
        data.verified_by || null,
        data.start_date,
        data.end_date,
      ]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT * FROM subscription ORDER BY created_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM subscription WHERE subscription_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE subscription
       SET verification_status = $1,
           verified_by = $2,
           receipt_image_url = $3
       WHERE subscription_id = $4
       RETURNING *`,
      [
        data.verification_status,
        data.verified_by,
        data.receipt_image_url,
        id,
      ]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      `DELETE FROM subscription WHERE subscription_id = $1 RETURNING *`,
      [id]
    );

    return result.rows[0];
  },

  // 🔥 Auto delete expired subscriptions
  async deleteExpired() {
    const result = await pool.query(`
      DELETE FROM subscription
      WHERE end_date < CURRENT_DATE
      RETURNING *
    `);

    return result.rows;
  },
};

module.exports = { SubscriptionModel };
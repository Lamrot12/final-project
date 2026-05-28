const { pool } = require("../config/database");

const AdvertisementModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO advertisement 
      (ad_title, ad_content, advertisement_image, receipt_image_url, 
       start_date, end_date, plan_id, pharmacy_id, verification_status, created_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW())
      RETURNING *`,
      [
        data.ad_title,
        data.ad_content,
        data.advertisement_image,
        data.receipt_image_url,
        data.start_date,
        data.end_date,
        data.plan_id,
        data.pharmacy_id,
        false, // verification_status defaults to false (pending)
      ]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      `SELECT a.*, 
              p.pharmacy_name,
              ap.plan_name
       FROM advertisement a
       LEFT JOIN pharmacy p ON a.pharmacy_id = p.pharmacy_id
       LEFT JOIN advertisement_plan ap ON a.plan_id = ap.plan_id
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  },

  async findActive() {
    const result = await pool.query(
      `SELECT a.*, p.pharmacy_name
       FROM advertisement a
       JOIN pharmacy p ON a.pharmacy_id = p.pharmacy_id
       WHERE a.verification_status = true
       AND a.end_date >= CURRENT_DATE
       ORDER BY a.created_at DESC`
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT a.*, 
              p.pharmacy_name,
              ap.plan_name
       FROM advertisement a
       LEFT JOIN pharmacy p ON a.pharmacy_id = p.pharmacy_id
       LEFT JOIN advertisement_plan ap ON a.plan_id = ap.plan_id
       WHERE a.ad_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    // Build dynamic update query based on what fields are provided
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.ad_title !== undefined) {
      updates.push(`ad_title = $${paramCount++}`);
      values.push(data.ad_title);
    }
    if (data.ad_content !== undefined) {
      updates.push(`ad_content = $${paramCount++}`);
      values.push(data.ad_content);
    }
    if (data.advertisement_image !== undefined) {
      updates.push(`advertisement_image = $${paramCount++}`);
      values.push(data.advertisement_image);
    }
    if (data.receipt_image_url !== undefined) {
      updates.push(`receipt_image_url = $${paramCount++}`);
      values.push(data.receipt_image_url);
    }
    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(data.end_date);
    }
    if (data.plan_id !== undefined) {
      updates.push(`plan_id = $${paramCount++}`);
      values.push(data.plan_id);
    }
    if (data.verification_status !== undefined) {
      updates.push(`verification_status = $${paramCount++}`);
      values.push(data.verification_status);
    }
    if (data.approved_by !== undefined) {
      updates.push(`approved_by = $${paramCount++}`);
      values.push(data.approved_by);
    }

    if (updates.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE advertisement
      SET ${updates.join(", ")}
      WHERE ad_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM advertisement WHERE ad_id=$1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = AdvertisementModel;
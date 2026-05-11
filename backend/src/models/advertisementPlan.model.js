const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const AdvertisementPlanModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO advertisement_plan (plan_name, description, duration_days, price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.plan_name, data.description, data.duration_days, data.price]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM advertisement_plan ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM advertisement_plan WHERE plan_id = $1",
      [id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE advertisement_plan
       SET plan_name = $1,
           description = $2,
           duration_days = $3,
           price = $4
       WHERE plan_id = $5
       RETURNING *`,
      [data.plan_name, data.description, data.duration_days, data.price, id]
    );

    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM advertisement_plan WHERE plan_id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};

module.exports = AdvertisementPlanModel;
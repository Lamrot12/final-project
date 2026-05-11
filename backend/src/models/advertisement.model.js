const { Pool } = require("../config/database");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const AdvertisementModel = {
  async create(data) {
    const result = await pool.query(
      `INSERT INTO advertisement 
      (ad_title, ad_content, advertisement_image, receipt_image_url, start_date, end_date, plan_id, pharmacy_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
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
      ]
    );

    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM advertisement ORDER BY created_at DESC"
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM advertisement WHERE ad_id=$1",
      [id]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const result = await pool.query(
      `UPDATE advertisement
       SET ad_title=$1,
           ad_content=$2,
           advertisement_image=$3,
           receipt_image_url=$4,
           start_date=$5,
           end_date=$6
       WHERE ad_id=$7
       RETURNING *`,
      [
        data.ad_title,
        data.ad_content,
        data.advertisement_image,
        data.receipt_image_url,
        data.start_date,
        data.end_date,
        id,
      ]
    );

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
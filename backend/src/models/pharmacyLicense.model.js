const { pool } = require("../config/database");

class PharmacyLicenseModel {
  static async create(data) {
    const query = `
      INSERT INTO pharmacy_license (
        license_number,
        issue_date,
        expiry_date,
        license_document_url,
        verification_status,
        pharmacy_id
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
    `;

    const values = [
      data.license_number,
      data.issue_date,
      data.expiry_date,
      data.license_document_url,
      data.verification_status || "pending",
      data.pharmacy_id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll() {
    const query = `
      SELECT
        pl.*,

        p.pharmacy_name,
        p.address,
        p.contact_phone,
        p.contact_email,
        p.latitude,
        p.longitude,
        p.is_verified,
        p.operating_hours

      FROM pharmacy_license pl
      LEFT JOIN pharmacies p
      ON pl.pharmacy_id = p.pharmacy_id

      ORDER BY pl.uploaded_at DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT
        pl.*,

        p.pharmacy_name,
        p.address,
        p.contact_phone,
        p.contact_email,
        p.latitude,
        p.longitude,
        p.is_verified,
        p.operating_hours

      FROM pharmacy_license pl
      LEFT JOIN pharmacies p
      ON pl.pharmacy_id = p.pharmacy_id

      WHERE pl.license_id = $1
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
  }

  static async update(id, data) {
    const query = `
      UPDATE pharmacy_license
      SET
        license_number = $1,
        issue_date = $2,
        expiry_date = $3,
        license_document_url = $4,
        verification_status = $5,
        verified_by = $6,
        verified_at = $7
      WHERE license_id = $8
      RETURNING *
    `;

    const values = [
      data.license_number,
      data.issue_date,
      data.expiry_date,
      data.license_document_url,
      data.verification_status,
      data.verified_by,
      data.verified_at,
      id,
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query(
      `
      DELETE FROM pharmacy_license
      WHERE license_id = $1
      RETURNING *
      `,
      [id]
    );

    return result.rows[0];
  }
}

module.exports = PharmacyLicenseModel;
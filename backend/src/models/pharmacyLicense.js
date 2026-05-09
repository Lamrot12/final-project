const { pool } = require('../config/database');

class PharmacyLicense {
  static async create(licenseData, client = null) {
    const {
      license_number,
      issue_date,
      expiry_date,
      license_document_url,
      pharmacy_id,
      verification_status = 'pending'
    } = licenseData;

    const query = `
      INSERT INTO pharmacy_license (license_number, issue_date, expiry_date, license_document_url, pharmacy_id, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [license_number, issue_date, expiry_date, license_document_url, pharmacy_id, verification_status];

    if (client) {
      const result = await client.query(query, values);
      return result.rows[0];
    } else {
      const result = await pool.query(query, values);
      return result.rows[0];
    }
  }

  static async findByPharmacyId(pharmacyId) {
    const query = 'SELECT * FROM pharmacy_license WHERE pharmacy_id = $1';
    const result = await pool.query(query, [pharmacyId]);
    return result.rows[0];
  }

  static async findById(licenseId) {
    const query = 'SELECT * FROM pharmacy_license WHERE license_id = $1';
    const result = await pool.query(query, [licenseId]);
    return result.rows[0];
  }

  static async updateVerificationStatus(licenseId, status, verifiedBy, client = null) {
    const query = `
      UPDATE pharmacy_license 
      SET verification_status = $1, verified_by = $2, verified_at = CURRENT_TIMESTAMP
      WHERE license_id = $3
      RETURNING *
    `;
    
    if (client) {
      const result = await client.query(query, [status, verifiedBy, licenseId]);
      return result.rows[0];
    } else {
      const result = await pool.query(query, [status, verifiedBy, licenseId]);
      return result.rows[0];
    }
  }
}

module.exports = PharmacyLicense;

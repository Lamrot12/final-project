const { pool } = require('../config/database');
const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const PharmacyLicense = require('../models/pharmacyLicense');
const { uploadToCloudinary } = require('../config/cloudinary');
const path = require('path');

const pharmacyRegistrationController = {
  async register(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get uploaded files
      //const storefrontImage = req.files?.storefrontImage?.[0];
      const licenseDocument =  req.file;

      // Get form data
      const {
        fullName,
        staffEmail,
        staffPassword,
        staffPhone,
        pharmacyName,
        address,
        pharmacyPhone,
        pharmacyEmail,
        operatingHours,
        licenseNumber,
        licenseIssueDate,
        licenseExpiryDate,
        latitude,
        longitude
      } = req.body;

      // Validate required fields
      if (!fullName || !staffEmail || !staffPassword || !pharmacyName || !address || !licenseNumber) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(staffEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'User with this email already exists' });
      }


      // Get pharmacy role ID
      const pharmacyRoleId = await User.getRoleId('pharmacy');
      if (!pharmacyRoleId) {
        return res.status(500).json({ error: 'Pharmacy role not found' });
      }

      // Create user first
      const user = await User.create({
        email: staffEmail,
        password: staffPassword,
        full_name: fullName,
        phone: staffPhone,
        role_id: pharmacyRoleId
      }, client);

      // Create pharmacy (not verified yet)
      const pharmacy = await Pharmacy.create({
        pharmacy_name: pharmacyName,
        address: address,
        contact_phone: pharmacyPhone,
        contact_email: pharmacyEmail,
        latitude: latitude || null,
        longitude: longitude || null,
        operating_hours: operatingHours,
        user_id: user.user_id,
        is_verified: false
      }, client);

      // Upload license document to Cloudinary if provided and credentials are configured
      let licenseDocumentUrl = null;
      let licenseDocumentError = null;
      if (licenseDocument && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name') {
        try {
          licenseDocumentUrl = await uploadToCloudinary(licenseDocument.path, 'pharmalink/licenses');
        } catch (uploadError) {
          console.error('Error uploading license document:', uploadError);
          licenseDocumentError = uploadError.message;
          // Continue without document - don't fail the registration
        }
      }

      // Create pharmacy license record
      const license = await PharmacyLicense.create({
        license_number: licenseNumber,
        issue_date: licenseIssueDate || null,
        expiry_date: licenseExpiryDate || null,
        license_document_url: licenseDocumentUrl,
        pharmacy_id: pharmacy.pharmacy_id,
        verification_status: 'pending'
      }, client);

      await client.query('COMMIT');

      const warnings = [];
      if (licenseDocumentError) {
        warnings.push(`License document upload failed: ${licenseDocumentError}`);
      }

      res.status(201).json({
        message: 'Pharmacy registered successfully. Your application is pending verification.',
        warnings: warnings.length > 0 ? warnings : undefined,
        data: {
          user: {
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name
          },
          pharmacy: {
            pharmacy_id: pharmacy.pharmacy_id,
            pharmacy_name: pharmacy.pharmacy_name,
            is_verified: pharmacy.is_verified
          },
          license: {
            license_id: license.license_id,
            license_number: license.license_number,
            verification_status: license.verification_status
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error registering pharmacy:', error);
      res.status(500).json({ error: 'Failed to register pharmacy', details: error.message });
    } finally {
      client.release();
    }
  }
};

module.exports = pharmacyRegistrationController;

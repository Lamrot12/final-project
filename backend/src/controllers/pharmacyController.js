const Pharmacy = require('../models/pharmacy');
const PharmacyLicense = require('../models/pharmacyLicense');
const { pool } = require('../config/database');
const { uploadToCloudinary } = require('../config/cloudinary');

const pharmacyController = {
  async getNearbyPharmacies(req, res) {
    try {
      const { lat, lng, radius } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
      }
      
      const pharmacies = await Pharmacy.findNearby(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(radius) || 5
      );
      
      res.json(pharmacies);
    } catch (error) {
      console.error('Error getting nearby pharmacies:', error);
      res.status(500).json({ error: 'Failed to get nearby pharmacies' });
    }
  },

  async getPharmacyById(req, res) {
    try {
      const { id } = req.params;
      const pharmacy = await Pharmacy.findById(id);
      
      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }
      
      res.json(pharmacy);
    } catch (error) {
      console.error('Error getting pharmacy:', error);
      res.status(500).json({ error: 'Failed to get pharmacy' });
    }
  },

  async getAllPharmacies(req, res) {
    try {
      const pharmacies = await Pharmacy.findAll();
      res.json(pharmacies);
    } catch (error) {
      console.error('Error getting pharmacies:', error);
      res.status(500).json({ error: 'Failed to get pharmacies' });
    }
  },

  async approvePharmacy(req, res) {
    try {
      const { pharmacy_id } = req.params;
      const pharmacy = await Pharmacy.approvePharmacy(pharmacy_id);
      res.json({ success: true, message: 'Pharmacy approved successfully', pharmacy });
    } catch (error) {
      console.error('Error approving pharmacy:', error);
      res.status(500).json({ success: false, error: 'Failed to approve pharmacy' });
    }
  },

  async rejectPharmacy(req, res) {
    try {
      const { pharmacy_id } = req.params;
      const pharmacy = await Pharmacy.rejectPharmacy(pharmacy_id);
      res.json({ success: true, message: 'Pharmacy rejected successfully', pharmacy });
    } catch (error) {
      console.error('Error rejecting pharmacy:', error);
      res.status(500).json({ success: false, error: 'Failed to reject pharmacy' });
    }
  },

  async getPharmacyByEmail(req, res) {
    try {
      const { email } = req.params;
      const pharmacy = await Pharmacy.findByEmail(email);
      
      if (!pharmacy) {
        return res.status(404).json({ error: 'Pharmacy not found' });
      }
      
      res.json(pharmacy);
    } catch (error) {
      console.error('Error getting pharmacy:', error);
      res.status(500).json({ error: 'Failed to get pharmacy' });
    }
  },

  async getPharmacyInventory(req, res) {
    try {
      const { pharmacyId } = req.params;
      const inventory = await Pharmacy.getInventory(pharmacyId);
      res.json(inventory);
    } catch (error) {
      console.error('Error getting pharmacy inventory:', error);
      res.status(500).json({ error: 'Failed to get pharmacy inventory' });
    }
  },

  async updatePharmacy(req, res) {
    try {
      const pharmacyId = req.user.pharmacyId;
      const pharmacyData = req.body;

      const updatedPharmacy = await Pharmacy.updatePharmacy(pharmacyId, pharmacyData);
      res.json(updatedPharmacy);
    } catch (error) {
      console.error('Error updating pharmacy:', error);
      res.status(500).json({ error: 'Failed to update pharmacy' });
    }
  },

  async toggleOpenStatus(req, res) {
    try {
      const pharmacyId = req.user.pharmacyId;
      const { is_open } = req.body;

      const updatedPharmacy = await Pharmacy.toggleOpenStatus(pharmacyId, is_open);
      res.json(updatedPharmacy);
    } catch (error) {
      console.error('Error toggling open status:', error);
      res.status(500).json({ error: 'Failed to update open status' });
    }
  },

  async searchPharmaciesByMedicine(req, res) {
    try {
      console.log('searchPharmaciesByMedicine called with query:', req.query);
      const { medicine, lat, lng } = req.query;

      if (!medicine) {
        console.log('No medicine provided');
        return res.status(400).json({ error: 'Medicine name is required' });
      }

      console.log('Searching for medicine:', medicine);
      let query, params;

      if (lat && lng) {
        // Search with location-based sorting
        query = `
          SELECT
            p.pharmacy_id,
            p.pharmacy_name,
            p.address,
            p.contact_phone,
            p.contact_email,
            p.latitude,
            p.longitude,
            p.is_open,
            p.is_verified,
            m.brand_name,
            m.generic_name,
            ps.quantity,
            ps.expiry_date,
            (6371 * acos(cos(radians($2)) * cos(radians(p.latitude)) *
            cos(radians(p.longitude) - radians($3)) +
            sin(radians($2)) * sin(radians(p.latitude)))) AS distance,
            CAST(ps.quantity AS INTEGER) as quantity_int
          FROM pharmacies p
          INNER JOIN pharmacy_stocks ps ON p.pharmacy_id = ps.pharmacy_id
          INNER JOIN medicines m ON ps.medicine_id = m.medicine_id
          WHERE p.is_verified = true
            AND (m.brand_name ILIKE $1 OR m.generic_name ILIKE $1)
          ORDER BY distance ASC, p.is_open DESC, quantity_int DESC
        `;
        params = [`%${medicine}%`, parseFloat(lat), parseFloat(lng)];
      } else {
        // Search without location
        query = `
          SELECT
            p.pharmacy_id,
            p.pharmacy_name,
            p.address,
            p.contact_phone,
            p.contact_email,
            p.latitude,
            p.longitude,
            p.is_open,
            p.is_verified,
            m.brand_name,
            m.generic_name,
            ps.quantity,
            ps.expiry_date,
            CAST(ps.quantity AS INTEGER) as quantity_int
          FROM pharmacies p
          INNER JOIN pharmacy_stocks ps ON p.pharmacy_id = ps.pharmacy_id
          INNER JOIN medicines m ON ps.medicine_id = m.medicine_id
          WHERE p.is_verified = true
            AND (m.brand_name ILIKE $1 OR m.generic_name ILIKE $1)
          ORDER BY p.is_open DESC, quantity_int DESC
        `;
        params = [`%${medicine}%`];
      }

      const result = await pool.query(query, params);

      console.log('Query returned', result.rows.length, 'rows');
      const pharmacies = result.rows.map(row => ({
        pharmacy_id: row.pharmacy_id,
        pharmacy_name: row.pharmacy_name,
        address: row.address,
        contact_phone: row.contact_phone,
        contact_email: row.contact_email,
        latitude: row.latitude,
        longitude: row.longitude,
        is_open: row.is_open,
        is_verified: row.is_verified,
        distance: row.distance || null,
        medicine: {
          brand_name: row.brand_name,
          generic_name: row.generic_name,
          quantity: row.quantity,
          expiry_date: row.expiry_date
        }
      }));

      console.log('Sending response with', pharmacies.length, 'pharmacies');
      res.json(pharmacies);
    } catch (error) {
      console.error('Error searching pharmacies by medicine:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ error: 'Failed to search pharmacies', details: error.message });
    }
  },

  async getPharmacyLicense(req, res) {
    try {
      const { pharmacyId } = req.params;
      const license = await PharmacyLicense.findByPharmacyId(pharmacyId);
      
      if (!license) {
        return res.status(404).json({ error: 'Pharmacy license not found' });
      }
      
      res.json(license);
    } catch (error) {
      console.error('Error getting pharmacy license:', error);
      res.status(500).json({ error: 'Failed to get pharmacy license' });
    }
  },
  async getAllPharmaciesForAdmin(req, res) {
  try {
    const pharmacies = await Pharmacy.findAllForAdmin();
    res.json(pharmacies);
  } catch (error) {
    console.error('Error getting pharmacies for admin:', error);
    res.status(500).json({ error: 'Failed to get pharmacies' });
  }
},

  async updatePharmacyLicense(req, res) {
    try {
      const { pharmacyId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No license document uploaded' });
      }

      // Upload to Cloudinary
      const documentUrl = await uploadToCloudinary(req.file.path, 'pharmalink/licenses');

      // Get the license by pharmacy_id
      const license = await PharmacyLicense.findByPharmacyId(pharmacyId);
      
      if (!license) {
        return res.status(404).json({ error: 'Pharmacy license not found' });
      }

      // Update the license document URL
      const updatedLicense = await PharmacyLicense.updateLicenseDocument(license.license_id, documentUrl);
      
      res.json({
        message: 'Pharmacy license updated successfully',
        data: updatedLicense
      });
    } catch (error) {
      console.error('Error updating pharmacy license:', error);
      res.status(500).json({ error: 'Failed to update pharmacy license', details: error.message });
    }
  }
};

module.exports = pharmacyController;

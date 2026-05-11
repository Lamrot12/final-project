const Pharmacy = require('../models/pharmacy');
const { pool } = require('../config/database');

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
      res.json({ message: 'Pharmacy approved successfully', pharmacy });
    } catch (error) {
      console.error('Error approving pharmacy:', error);
      res.status(500).json({ error: 'Failed to approve pharmacy' });
    }
  },

  async rejectPharmacy(req, res) {
    try {
      const { pharmacy_id } = req.params;
      const pharmacy = await Pharmacy.rejectPharmacy(pharmacy_id);
      res.json({ message: 'Pharmacy rejected successfully', pharmacy });
    } catch (error) {
      console.error('Error rejecting pharmacy:', error);
      res.status(500).json({ error: 'Failed to reject pharmacy' });
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
      const { medicine } = req.query;

      if (!medicine) {
        console.log('No medicine provided');
        return res.status(400).json({ error: 'Medicine name is required' });
      }

      console.log('Searching for medicine:', medicine);
      const result = await pool.query(`
        SELECT DISTINCT
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
          ps.expiry_date
        FROM pharmacies p
        INNER JOIN pharmacy_stocks ps ON p.pharmacy_id = ps.pharmacy_id
        INNER JOIN medicines m ON ps.medicine_id = m.medicine_id
        WHERE p.is_verified = true
          AND ps.quantity > 0
          AND (m.brand_name ILIKE $1 OR m.generic_name ILIKE $1)
        ORDER BY p.is_open DESC, ps.quantity DESC
      `, [`%${medicine}%`]);

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
  }
};

module.exports = pharmacyController;

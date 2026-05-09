const Pharmacy = require('../models/pharmacy');

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
  }
};

module.exports = pharmacyController;

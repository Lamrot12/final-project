const Medicine = require('../models/medicine');

const medicineController = {
  async searchMedicines(req, res) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const medicines = await Medicine.search(q);
      res.json(medicines);
    } catch (error) {
      console.error('Error searching medicines:', error);
      res.status(500).json({ error: 'Failed to search medicines' });
    }
  },

  async getMedicineById(req, res) {
    try {
      const { id } = req.params;
      const medicine = await Medicine.findById(id);
      
      if (!medicine) {
        return res.status(404).json({ error: 'Medicine not found' });
      }
      
      res.json(medicine);
    } catch (error) {
      console.error('Error getting medicine:', error);
      res.status(500).json({ error: 'Failed to get medicine' });
    }
  },

  async getAllMedicines(req, res) {
    try {
      const medicines = await Medicine.findAll();
      res.json(medicines);
    } catch (error) {
      console.error('Error getting medicines:', error);
      res.status(500).json({ error: 'Failed to get medicines' });
    }
  },

  async getPopularMedicines(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const medicines = await Medicine.getPopular(limit);
      res.json(medicines);
    } catch (error) {
      console.error('Error getting popular medicines:', error);
      res.status(500).json({ error: 'Failed to get popular medicines' });
    }
  }
};

module.exports = medicineController;

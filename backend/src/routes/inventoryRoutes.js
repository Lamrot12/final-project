const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticate, requirePharmacy } = require('../middleware/auth');

// Protected routes - only pharmacy staff can access
router.post('/add', authenticate, requirePharmacy, inventoryController.addStock);
router.post('/reduce', authenticate, requirePharmacy, inventoryController.reduceStock);
router.get('/my-inventory', authenticate, requirePharmacy, inventoryController.getInventory);
router.get('/my-inventory/transactions', authenticate, requirePharmacy, inventoryController.getTransactions);

// Public routes (for patient viewing) - still require auth but can use any pharmacyId
router.get('/:pharmacyId', inventoryController.getInventory);

module.exports = router;

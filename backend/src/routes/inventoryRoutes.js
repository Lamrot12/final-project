const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');

router.post('/add', inventoryController.addStock);
router.post('/reduce', inventoryController.reduceStock);
router.get('/:pharmacyId', inventoryController.getInventory);
router.get('/:pharmacyId/transactions', inventoryController.getTransactions);

module.exports = router;

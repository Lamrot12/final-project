const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/email/:email', pharmacyController.getPharmacyByEmail);
router.get('/:id', pharmacyController.getPharmacyById);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:pharmacyId/inventory', pharmacyController.getPharmacyInventory);

module.exports = router;

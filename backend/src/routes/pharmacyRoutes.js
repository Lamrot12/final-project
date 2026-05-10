const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/auth');

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/email/:email', pharmacyController.getPharmacyByEmail);
router.get('/:id', pharmacyController.getPharmacyById);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:pharmacyId/inventory', pharmacyController.getPharmacyInventory);
router.put('/update', authMiddleware.authenticate, pharmacyController.updatePharmacy);
router.put('/toggle-open', authMiddleware.authenticate, pharmacyController.toggleOpenStatus);

module.exports = router;

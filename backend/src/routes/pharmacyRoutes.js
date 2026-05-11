const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/auth');

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/email/:email', pharmacyController.getPharmacyByEmail);
router.get('/search-by-medicine', pharmacyController.searchPharmaciesByMedicine);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:id', pharmacyController.getPharmacyById);
router.get('/:pharmacyId/inventory', pharmacyController.getPharmacyInventory);
router.put('/update', authMiddleware.authenticate, pharmacyController.updatePharmacy);
router.put('/toggle-open', authMiddleware.authenticate, pharmacyController.toggleOpenStatus);
router.put('/:pharmacy_id/approve', authMiddleware.authenticate, pharmacyController.approvePharmacy);
router.put('/:pharmacy_id/reject', authMiddleware.authenticate, pharmacyController.rejectPharmacy);

module.exports = router;

const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'license-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/email/:email', pharmacyController.getPharmacyByEmail);
router.get('/search-by-medicine', pharmacyController.searchPharmaciesByMedicine);
router.get('/', pharmacyController.getAllPharmacies);
router.get('/:id', pharmacyController.getPharmacyById);
router.get('/:pharmacyId/inventory', pharmacyController.getPharmacyInventory);
router.get('/:pharmacyId/license', pharmacyController.getPharmacyLicense);
router.put('/update', authMiddleware.authenticate, pharmacyController.updatePharmacy);
router.put('/toggle-open', authMiddleware.authenticate, pharmacyController.toggleOpenStatus);
router.put('/:pharmacy_id/approve', authMiddleware.authenticate, pharmacyController.approvePharmacy);
router.put('/:pharmacy_id/reject', authMiddleware.authenticate, pharmacyController.rejectPharmacy);
router.put('/:pharmacyId/license', authMiddleware.authenticate, upload.single('licenseDocument'), pharmacyController.updatePharmacyLicense);
router.get(
  '/admin/pharmacies',
  authMiddleware.authenticate,
  pharmacyController.getAllPharmaciesForAdmin
);
module.exports = router;

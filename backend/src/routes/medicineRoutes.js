const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');

router.get('/search', medicineController.searchMedicines);
router.get('/popular', medicineController.getPopularMedicines);
router.get('/', medicineController.getAllMedicines);
router.get('/:id', medicineController.getMedicineById);

module.exports = router;

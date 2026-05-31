const express = require('express');
const router = express.Router();
const { processPrescription, uploadMiddleware } = require('../controllers/ocrController');

// Process prescription image with OCR
router.post('/process-prescription', uploadMiddleware, processPrescription);

module.exports = router;

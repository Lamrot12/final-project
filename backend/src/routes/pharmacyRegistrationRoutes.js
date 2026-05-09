const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pharmacyRegistrationController = require('../controllers/pharmacyRegistrationController');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Pharmacy registration route with file uploads
router.post('/register', upload.fields([
  { name: 'storefrontImage', maxCount: 1 },
  { name: 'licenseDocument', maxCount: 1 }
]), pharmacyRegistrationController.register);

module.exports = router;

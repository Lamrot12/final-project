const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

exports.processPrescription = async (req, res) => {
  try {
    console.log('Processing prescription upload...');
    console.log('File:', req.file ? 'Present' : 'Missing');
    
    if (!req.file) {
      console.error('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    console.log('Sending request to OCR service at http://localhost:8000/predict');

    // Create form data to send to OCR service
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Forward request to OCR service using axios
    const response = await axios.post('http://localhost:8000/predict', formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });

    console.log('OCR service response status:', response.status);
    console.log('OCR service response data:', JSON.stringify(response.data).substring(0, 200));
    
    res.json(response.data);
  } catch (error) {
    console.error('Error processing prescription:', error);
    
    if (error.response) {
      // The OCR service responded with an error status
      console.error('OCR service error status:', error.response.status);
      console.error('OCR service error data:', error.response.data);
      return res.status(error.response.status).json({ 
        error: 'Failed to process prescription',
        details: error.response.data 
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to process prescription',
      details: error.message 
    });
  }
};

exports.uploadMiddleware = upload.single('image');

const jwt = require('jsonwebtoken');

const authMiddleware = {
  // Verify JWT token and add user data to request
  authenticate: (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
      }
      
      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user data to request object
      req.user = {
        userId: decoded.userId,
        userType: decoded.userType,
        pharmacyId: decoded.pharmacyId
      };
      
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  },
  
  // Check if user is pharmacy staff (has a pharmacyId)
  requirePharmacy: (req, res, next) => {
    if (!req.user || !req.user.pharmacyId) {
      return res.status(403).json({ error: 'Access denied. Pharmacy staff only.' });
    }
    next();
  },
  
  // Check if user is a patient
  requirePatient: (req, res, next) => {
    if (!req.user || req.user.userType !== 'patient') {
      return res.status(403).json({ error: 'Access denied. Patients only.' });
    }
    next();
  }
};

module.exports = authMiddleware;

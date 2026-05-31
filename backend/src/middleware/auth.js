const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

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
  // Automatically finds pharmacy by user_id if pharmacyId is missing
  requirePharmacy: async (req, res, next) => {
    try {
      console.log('requirePharmacy called with user:', req.user);
      if (!req.user) {
        console.log('No user in request');
        return res.status(403).json({ error: 'Access denied. Authentication required.' });
      }

      // If pharmacyId is already in the token, use it
      if (req.user.pharmacyId) {
        console.log('pharmacyId found in token:', req.user.pharmacyId);
        return next();
      }

      // If pharmacyId is missing but user is pharmacy type, try to find it by user_id
      if (req.user.userType === 'pharmacy' && req.user.userId) {
        console.log('Searching for pharmacy by user_id:', req.user.userId);
        const result = await pool.query(
          'SELECT pharmacy_id FROM pharmacies WHERE user_id = $1',
          [req.user.userId]
        );

        console.log('Pharmacy search result:', result.rows);
        if (result.rows.length > 0) {
          // Add pharmacyId to request object
          req.user.pharmacyId = result.rows[0].pharmacy_id;
          console.log('Found pharmacy and added to request:', req.user.pharmacyId);
          return next();
        } else {
          console.log('No pharmacy found for user_id:', req.user.userId);
        }
      }

      console.log('Access denied - no pharmacy found');
      return res.status(403).json({ error: 'Access denied. Pharmacy staff only.' });
    } catch (error) {
      console.error('RequirePharmacy middleware error:', error);
      return res.status(500).json({ error: 'Server error' });
    }
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

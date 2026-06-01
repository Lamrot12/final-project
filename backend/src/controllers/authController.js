const User = require('../models/user');
const Pharmacy = require('../models/pharmacy');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const crypto = require('crypto');

const authController = {
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const result = await pool.query(
        `
        UPDATE users
        SET is_verified = true,
            verification_token = NULL
        WHERE verification_token = $1
        RETURNING *
        `,
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          message: 'Invalid token'
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  },


  async register(req, res) {
    try {
      const { email, password, full_name, phone, user_type } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      // Get role_id from role_name
      const roleName = user_type || 'patient';
      const roleId = await User.getRoleId(roleName);
      if (!roleId) {
        return res.status(400).json({ error: 'Invalid user type' });
      }
       const verificationToken = crypto.randomBytes(32).toString('hex');
      const user = await User.create({
        email,
        password,
        full_name,
        phone,
        role_id: roleId,
        verification_token: verificationToken
      });
      const transporter = require('../config/email');

const verificationLink =
  `http://localhost:5000/api/auth/verify-email/${verificationToken}`;

await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Verify Your Email',
  html: `
    <h2>Welcome to PharmaLink</h2>
    <p>Click the button below to verify your email.</p>

    <a href="${verificationLink}">
      Verify Email
    </a>
  `
});
      const token = jwt.sign(
        { userId: user.user_id, userType: roleName },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
    res.status(201).json({
  message: 'Registration successful. Please verify your email.',
});
    } catch (error) {
      console.error('Error registering user:', error);
      res.status(500).json({ error: 'Failed to register user' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Trim whitespace from email and password
      const trimmedEmail = email?.trim();
      const trimmedPassword = password?.trim();
      
      console.log('Login attempt:', { email: trimmedEmail, passwordLength: trimmedPassword?.length });
      
      if (!trimmedEmail || !trimmedPassword) {
        return res.status(400).json({ error: 'Email and password are required' });
      }
      
      const user = await User.findByEmail(trimmedEmail);
     if (!user) {
  return res.status(401).json({ error: 'Invalid credentials' });
}

if (!user.is_verified) {
  return res.status(403).json({
    error: 'Email not verified',
    message: 'Please verify your email first'
  });
}
if (user.is_verified !== true)
      
      console.log('User found:', { userId: user.user_id, email: user.email, userType: user.role_name });
      
      const isValidPassword = await User.verifyPassword(trimmedPassword, user.password_hash);
      console.log('Password verification:', isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // If user is pharmacy staff, fetch pharmacy data and check verification
      let pharmacy = null;
      if (user.role_name === 'pharmacy') {
        pharmacy = await Pharmacy.findByUserId(user.user_id);
        if (pharmacy && !pharmacy.is_verified) {
          return res.status(403).json({ 
            error: 'Account pending approval',
            message: 'Your pharmacy account is waiting for admin approval',
            requiresApproval: true
          });
        }
      }
      
      const token = jwt.sign(
        { userId: user.user_id, userType: user.role_name, pharmacyId: pharmacy?.pharmacy_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      // Remove password from response
      const { password_hash: _, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        pharmacy,
        token
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
};

module.exports = authController;

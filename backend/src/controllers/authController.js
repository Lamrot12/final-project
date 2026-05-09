const User = require('../models/user');
const jwt = require('jsonwebtoken');

const authController = {
  async register(req, res) {
    try {
      const { email, password, full_name, phone, user_type } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const user = await User.create({
        email,
        password,
        full_name,
        phone,
        user_type: user_type || 'patient'
      });
      
      const token = jwt.sign(
        { userId: user.user_id, userType: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      res.status(201).json({
        message: 'User registered successfully',
        user,
        token
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
        console.log('User not found:', trimmedEmail);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log('User found:', { userId: user.user_id, email: user.email, userType: user.user_type });
      
      const isValidPassword = await User.verifyPassword(trimmedPassword, user.password);
      console.log('Password verification:', isValidPassword);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const token = jwt.sign(
        { userId: user.user_id, userType: user.user_type },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ error: 'Failed to login' });
    }
  }
};

module.exports = authController;

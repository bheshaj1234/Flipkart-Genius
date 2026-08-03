import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to sign JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register a new seller
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, password, storeName } = req.body;

    // Check if seller already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'Seller already registered with this email address' });
    }

    // Create seller
    const user = await User.create({
      name,
      email,
      password,
      storeName
    });

    // Sign token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      seller: {
        id: user._id,
        name: user.name,
        email: user.email,
        storeName: user.storeName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login a seller
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate fields presence
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check if user exists (explicitly select password as select is false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Sign token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      seller: {
        id: user._id,
        name: user.name,
        email: user.email,
        storeName: user.storeName
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

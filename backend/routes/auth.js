const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000/login', session: false }),
  (req, res) => {
    // Successful authentication, generate JWT
    const user = req.user;
    const accessToken = jwt.sign(
      { id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, mobile_number: user.mobile_number, address: user.address, province: user.province, district: user.district, municipal: user.municipal },
      config.secretKey,
      { expiresIn: '1h' }
    );
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/login?token=${accessToken}`);
  }
);

module.exports = router;

const express = require('express');
const { signup, login, getMe, forgotPassword, googleCallback } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/forgot-password', forgotPassword);

// Google OAuth removed

module.exports = router;

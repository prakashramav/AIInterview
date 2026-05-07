const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const progressController = require('../controllers/progressController');

// @route   GET /progress
// @desc    Get user progress
// @access  Private
router.get('/', auth, progressController.getProgress);

// @route   PATCH /progress
// @desc    Update user progress
// @access  Private
router.patch('/', auth, progressController.updateProgress);

module.exports = router;

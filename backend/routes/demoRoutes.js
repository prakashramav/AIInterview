const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');
const rateLimit = require('express-rate-limit');

const demoLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: { message: 'Too many requests, please try again after an hour.' }
});

router.post('/start', demoLimiter, demoController.startDemo);
router.post('/answer', demoLimiter, demoController.submitAnswer);
router.get('/evaluate/:sessionId', demoController.getEvaluation);

module.exports = router;

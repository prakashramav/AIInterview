const express = require('express');
const { 
  startInterview, 
  endInterview, 
  getInterviewReport, 
  getInterviews, 
  getInterview 
} = require('../controllers/interviewController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/start', auth, startInterview);
router.post('/end', auth, endInterview);
router.get('/report/:sessionId', auth, getInterviewReport);
router.get('/', auth, getInterviews);
router.get('/sessions', auth, getInterviews);
router.get('/:id', auth, getInterview);

module.exports = router;

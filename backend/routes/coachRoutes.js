const express = require('express');
const { startCoachSession, processUserMessageStream, getCoachSession, getUserSessions } = require('../controllers/coachController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/start', auth, startCoachSession);
router.post('/message-stream', auth, processUserMessageStream);
router.get('/sessions', auth, getUserSessions);
router.get('/:id', auth, getCoachSession);

module.exports = router;

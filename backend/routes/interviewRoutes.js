const express = require('express');
const multer = require('multer');
const { startInterview, answerQuestion, answerQuestionStream, getInterview, getInterviews, completeInterview } = require('../controllers/interviewController');
const { generateAvatar, checkAvatarStatus } = require('../controllers/avatarController');
const auth = require('../middleware/auth');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/start', auth, startInterview);
router.post('/answer', auth, upload.single('audio'), answerQuestion);
router.post('/answer-stream', auth, answerQuestionStream);
router.post('/avatar/generate', auth, generateAvatar);
router.get('/avatar/status/:id', auth, checkAvatarStatus);
router.post('/:id/complete', auth, completeInterview);
router.get('/:id', auth, getInterview);
router.get('/', auth, getInterviews);

module.exports = router;

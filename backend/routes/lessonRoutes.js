const express = require('express');
const { getLessons, createLesson, getUserProgress, updateProgress } = require('../controllers/lessonController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, getLessons);
router.post('/generate', auth, createLesson);
router.get('/progress', auth, getUserProgress);
router.post('/progress', auth, updateProgress);

module.exports = router;

const express = require('express');
const { getLessons, getLessonByDay, createLesson, getUserProgress, updateProgress } = require('../controllers/lessonController');
const { startCoachSession, processUserMessageStream, getCoachSession, getUserSessions } = require('../controllers/coachController');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * LESSON ROUTES
 */
router.get('/lessons', auth, getLessons);
router.get('/lessons/day/:day', auth, getLessonByDay);
router.post('/lessons/generate', auth, createLesson);
router.get('/lessons/progress', auth, getUserProgress);
router.post('/lessons/progress', auth, updateProgress);

/**
 * COACHING SESSION ROUTES
 */
router.post('/coach/start', auth, startCoachSession);
router.post('/coach/message-stream', auth, processUserMessageStream);
router.get('/coach/sessions', auth, getUserSessions);
router.get('/coach/:id', auth, getCoachSession);

module.exports = router;

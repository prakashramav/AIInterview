const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const { generateLesson } = require('../services/coachService');

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ createdAt: -1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { level, topic } = req.body;
    const userId = req.user.userId;
    
    // Find latest lesson for this user/topic to check sequence
    const latestLesson = await Lesson.findOne({ level, topic }).sort({ sequence: -1 });
    
    if (latestLesson) {
      const progress = await UserProgress.findOne({ userId, lessonId: latestLesson._id });
      if (!progress || (!progress.unlockedNext && progress.score < 6)) {
        return res.status(403).json({ 
          message: "Please complete and practice the current lesson with a score of at least 6/10 before moving forward.",
          currentLessonId: latestLesson._id
        });
      }
    }

    const nextSequence = latestLesson ? latestLesson.sequence + 1 : 1;
    const lessonData = await generateLesson(level, topic, nextSequence);
    
    const lesson = new Lesson({
      ...lessonData,
      level,
      topic,
      sequence: nextSequence
    });
    
    await lesson.save();
    res.status(201).json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProgress = async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.user.userId }).populate('lessonId');
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { lessonId, score, completed, practiced } = req.body;
    let progress = await UserProgress.findOne({ userId: req.user.userId, lessonId });
    
    const SCORE_THRESHOLD = 6;
    let unlockedNext = false;

    if (score >= SCORE_THRESHOLD) {
      unlockedNext = true;
    }

    if (progress) {
      progress.score = Math.max(progress.score, score);
      progress.completed = completed || progress.completed;
      progress.practiced = practiced || progress.practiced;
      progress.unlockedNext = unlockedNext || progress.unlockedNext;
      progress.lastAccessed = Date.now();
    } else {
      progress = new UserProgress({
        userId: req.user.userId,
        lessonId,
        score,
        completed,
        practiced,
        unlockedNext
      });
    }
    
    await progress.save();
    res.json({ progress, thresholdMet: score >= SCORE_THRESHOLD });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

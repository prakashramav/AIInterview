const Lesson = require('../models/Lesson');
const UserProgress = require('../models/UserProgress');
const { generateLesson } = require('../services/coachService');

exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find().sort({ day: 1 });
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLessonByDay = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({ day: req.params.day });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { day } = req.body; // Target day to start
    const userId = req.user.userId;
    
    // Day 1 is always unlocked
    if (day > 1) {
      const prevDay = day - 1;
      const prevLesson = await Lesson.findOne({ day: prevDay });
      if (!prevLesson) return res.status(404).json({ message: `Previous day (${prevDay}) not found.` });

      const progress = await UserProgress.findOne({ userId, lessonId: prevLesson._id });
      if (!progress || (!progress.unlockedNext && progress.score < 6)) {
        return res.status(403).json({ 
          message: `Please complete Day ${prevDay} with a score of at least 6/10 before moving to Day ${day}.`,
          prevDay
        });
      }
    }

    let lesson = await Lesson.findOne({ day });
    
    // If lesson doesn't exist in DB, generate it now!
    if (!lesson) {
      console.log(`[AI Coach] Lesson for Day ${day} missing. Generating now...`);
      // Determine level based on day (1-12: A1, 13-24: A2, etc.)
      const level = day <= 12 ? 'A1' : day <= 24 ? 'A2' : day <= 36 ? 'B1' : day <= 48 ? 'B2' : 'C1';
      
      const lessonData = await generateLesson(level, day);
      lesson = new Lesson({
        ...lessonData,
        day,
        level,
        topic: lessonData.topic || "General Fluency",
        sequence: day
      });
      await lesson.save();
    }
    
    res.status(200).json(lesson);
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

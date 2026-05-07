const Progress = require('../models/Progress');

exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      // Create initial progress if not exists
      progress = new Progress({
        userId: req.user.userId,
        currentDay: 1,
        totalDays: 60,
        lessonsCompleted: [],
        streak: 0,
        lastActiveAt: new Date()
      });
      await progress.save();
    }

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateProgress = async (req, res) => {
  const { currentDay, lesson } = req.body;

  try {
    let progress = await Progress.findOne({ userId: req.user.userId });

    if (!progress) {
      progress = new Progress({ userId: req.user.userId });
    }

    if (currentDay) progress.currentDay = currentDay;

    if (lesson) {
      // Add lesson to completed list
      progress.lessonsCompleted.push({
        lessonId: lesson.lessonId,
        title: lesson.title,
        completedAt: new Date(),
        fluencyScore: lesson.fluencyScore
      });

      // Recalculate streak
      const now = new Date();
      const lastActive = new Date(progress.lastActiveAt);
      
      const isSameDay = (d1, d2) => 
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

      const isYesterday = (d1, d2) => {
        const yesterday = new Date(d1);
        yesterday.setDate(yesterday.getDate() - 1);
        return isSameDay(yesterday, d2);
      };

      if (isSameDay(now, lastActive)) {
        // Already active today, streak stays same
      } else if (isYesterday(now, lastActive)) {
        progress.streak += 1;
      } else {
        progress.streak = 1;
      }

      progress.lastActiveAt = now;
    }

    await progress.save();
    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  completed: { type: Boolean, default: false },
  practiced: { type: Boolean, default: false },
  score: { type: Number, default: 0 }, // Overall score for this lesson
  unlockedNext: { type: Boolean, default: false },
  lastAccessed: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProgress', userProgressSchema);

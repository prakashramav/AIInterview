const mongoose = require('mongoose');

const coachSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'Beginner', 'Intermediate', 'Advanced'],
    default: 'A1'
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  lessonTopic: String,
  currentDay: {
    type: Number,
    default: 1
  },
  recentErrors: [String],
  currentStep: {
    type: Number,
    default: 1 // 1-12 as per the new interactive flow
  },
  messages: [
    {
      role: { type: String, enum: ['ai', 'user'] },
      content: String,
      correction: String, // AI's correction of user's grammar
      explanation: String, // Simple explanation of the mistake
      timestamp: { type: Date, default: Date.now }
    }
  ],
  progress: {
    fluency: { type: Number, default: 0 },
    grammar: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CoachSession', coachSessionSchema);

const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ['ai', 'user'], required: true },
  content: { type: String, required: true }
});

const InterviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobRole: { type: String, required: true }, // Used as topic
  userName: { type: String }, 
  experienceLevel: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  questionCount: { type: Number, default: 0 },
  messages: [MessageSchema],
  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
  evaluation: {
    score: Number,
    breakdown: {
      technical: Number,
      communication: Number,
      confidence: Number
    },
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    exampleAnswer: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', InterviewSchema);

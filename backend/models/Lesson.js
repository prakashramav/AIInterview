const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    required: true 
  },
  topic: { type: String, required: true },
  objectives: [{ type: String }],
  explanation: { type: String },
  examples: [String],
  speakingTasks: [String],
  sequence: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', LessonSchema);

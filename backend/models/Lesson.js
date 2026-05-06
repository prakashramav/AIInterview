const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  day: { type: Number, required: true, unique: true },
  level: { 
    type: String, 
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'], 
    required: true 
  },
  title: { type: String, required: true },
  topic: { type: String, required: true },
  goal: { type: String, required: true },
  explanation: { type: String, required: true },
  examples: [String],
  speakingTasks: [String],
  sequence: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);

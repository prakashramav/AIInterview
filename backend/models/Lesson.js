const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  topic: { 
    type: String, 
    enum: ['Grammar', 'Daily Conversation', 'Interview English', 'Business English'],
    required: true 
  },
  explanation: { type: String, required: true },
  examples: [String],
  practice: [String],
  videoUrl: { type: String }, // YouTube or D-ID URL
  sequence: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Lesson', lessonSchema);

const mongoose = require('mongoose');

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentDay: {
    type: Number,
    default: 1
  },
  totalDays: {
    type: Number,
    default: 60
  },
  lessonsCompleted: [{
    lessonId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    fluencyScore: {
      type: Number,
      required: true
    }
  }],
  streak: {
    type: Number,
    default: 0
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Progress', ProgressSchema);

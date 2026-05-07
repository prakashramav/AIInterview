require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

const lessons = [
  { day: 1, title: 'Introduction to Fluency', level: 'beginner', topic: 'Greetings', objectives: ['Master basic greetings', 'Learn self-introduction patterns'] },
  { day: 2, title: 'Everyday Vocabulary', level: 'beginner', topic: 'Common Objects', objectives: ['Identify household items', 'Use articles a/an correctly'] },
  { day: 3, title: 'Talking about Work', level: 'beginner', topic: 'Occupations', objectives: ['Describe job roles', 'Use present simple for routines'] },
  { day: 4, title: 'Digital Communication', level: 'beginner', topic: 'Email Etiquette', objectives: ['Write formal subject lines', 'Learn professional closings'] },
  { day: 5, title: 'Expressing Preferences', level: 'beginner', topic: 'Hobbies', objectives: ['Use like/love/hate correctly', 'Talk about free time'] },
  { day: 6, title: 'Networking Basics', level: 'intermediate', topic: 'Small Talk', objectives: ['Ask open-ended questions', 'Handle awkward silences'] },
  { day: 7, title: 'Project Management', level: 'intermediate', topic: 'Deadlines', objectives: ['Express urgency', 'Negotiate timelines'] },
  { day: 8, title: 'Technical Explanations', level: 'intermediate', topic: 'Documentation', objectives: ['Simplify complex concepts', 'Write clear instructions'] },
  { day: 9, title: 'Meeting Dynamics', level: 'intermediate', topic: 'Interrupting Politely', objectives: ['Use polite interjections', 'Steer conversations'] },
  { day: 10, title: 'System Architecture', level: 'advanced', topic: 'High-Level Design', objectives: ['Explain scalability', 'Discuss trade-offs'] }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');
    
    await Lesson.insertMany(lessons);
    console.log('Seeded Days 1-10');
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

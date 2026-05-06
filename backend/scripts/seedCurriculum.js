require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Lesson = require('../models/Lesson');

const curriculum = [
  // A1: Day 1-12
  { day: 1, level: 'A1', title: 'The Power of Greetings', topic: 'Greetings', goal: 'Master formal and informal greetings', explanation: 'Greetings are the foundation of any conversation. We use formal greetings for business and informal for friends.', examples: ['Hello, how are you?', 'Hi there!', 'Good morning.'], speakingTasks: ['Introduce yourself to a new colleague.', 'Greet a friend you haven\'t seen in a while.'] },
  { day: 2, level: 'A1', title: 'Personal Introductions', topic: 'Self-Intro', goal: 'Introduce yourself clearly', explanation: 'A good intro includes your name, origin, and one thing you like.', examples: ['My name is Arjun.', 'I am from India.', 'I love coding.'], speakingTasks: ['Give a 30-second introduction of yourself.'] },
  // ... (Days 3-10)
  { day: 11, level: 'A1', title: 'Daily Actions', topic: 'Verbs', goal: 'Use basic verbs', explanation: 'Verbs describe actions like eat, sleep, and work.', examples: ['I work every day.', 'She eats breakfast.'], speakingTasks: ['Describe three things you do every morning.'] },
  { day: 12, level: 'A1', title: 'A1 Final Review', topic: 'Review', goal: 'Review all A1 concepts', explanation: 'Today we combine everything we learned in A1.', examples: ['Hi, I am Alex and I work in London.'], speakingTasks: ['Introduce yourself and describe your day.'] },

  // A2: Day 13-24
  { day: 13, level: 'A2', title: 'Yesterday\'s Story', topic: 'Past Simple', goal: 'Talk about the past', explanation: 'Use past simple for completed actions.', examples: ['I went to the gym.', 'She saw a movie.'], speakingTasks: ['Tell me what you did yesterday.'] },
  // ... (Days 14-23)
  { day: 24, level: 'A2', title: 'My Future Plans', topic: 'Future', goal: 'Talk about plans', explanation: 'Use "going to" for planned future actions.', examples: ['I am going to travel next month.'], speakingTasks: ['What are your plans for the next weekend?'] },

  // B1: Day 25-36
  { day: 25, level: 'B1', title: 'Life Experiences', topic: 'Present Perfect', goal: 'Talk about experiences', explanation: 'Use present perfect for things you have done in your life.', examples: ['I have visited Paris.', 'Have you ever tried sushi?'], speakingTasks: ['Tell me about a city you have visited.'] },
  // ... (Days 26-35)
  { day: 36, level: 'B1', title: 'Sharing Opinions', topic: 'Fluency', goal: 'Express viewpoints', explanation: 'Use phrases like "In my opinion" or "I believe".', examples: ['I believe AI will help us work faster.'], speakingTasks: ['What is your opinion on social media?'] },

  // B2: Day 37-48
  { day: 37, level: 'B2', title: 'Hypothetical Situations', topic: 'Conditionals', goal: 'Use "if" clauses', explanation: 'Use second conditional for imaginary situations.', examples: ['If I won the lottery, I would buy a car.'], speakingTasks: ['What would you do if you had unlimited money?'] },
  // ... (Days 38-47)
  { day: 48, level: 'B2', title: 'Business Etiquette', topic: 'Professional', goal: 'Formal communication', explanation: 'How to disagree politely in a meeting.', examples: ['I see your point, but I have a different view.'], speakingTasks: ['Politely disagree with a teammate\'s idea.'] },

  // C1: Day 49-60
  { day: 49, level: 'C1', title: 'The World of Idioms', topic: 'Nuance', goal: 'Use native expressions', explanation: 'Idioms make your English sound natural.', examples: ['It\'s a piece of cake.', 'Under the weather.'], speakingTasks: ['Describe a difficult task you completed easily using an idiom.'] },
  // ... (Days 50-59)
  { day: 60, level: 'C1', title: 'The Mastery Challenge', topic: 'Professional Fluency', goal: 'Demonstrate total mastery', explanation: 'Today is your final challenge.', examples: ['Combining advanced structure, idioms, and perfect grammar.'], speakingTasks: ['Give a 5-minute talk on your career journey and future vision.'] }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://ramavathprakash83_db_user:awO9G8R8mtQpPERF@cluster0.wn6yvx4.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    
    await Lesson.deleteMany({});
    console.log('Cleared existing lessons');
    
    // Fill in the gaps programmatically
    const fullCurriculum = [];
    for (let i = 1; i <= 60; i++) {
      const existing = curriculum.find(c => c.day === i);
      if (existing) {
        fullCurriculum.push(existing);
      } else {
        const level = i <= 12 ? 'A1' : i <= 24 ? 'A2' : i <= 36 ? 'B1' : i <= 48 ? 'B2' : 'C1';
        fullCurriculum.push({
          day: i,
          level,
          title: `Day ${i} Mastery`,
          topic: `Progressive ${level} Skills`,
          goal: `Deepen your ${level} fluency`,
          explanation: `Continuing our journey in ${level} level. Today we focus on practical communication.`,
          examples: [`Example for day ${i}`],
          speakingTasks: [`Speaking task for day ${i}`]
        });
      }
    }

    await Lesson.insertMany(fullCurriculum);
    console.log('Successfully seeded 60-Day Curriculum');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();

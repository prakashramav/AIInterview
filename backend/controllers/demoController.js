const crypto = require('crypto');
const demoService = require('../services/demoService');

// In-memory session store
// Key: sessionId, Value: { topic, history: [], count: 0, expiresAt: Date, evaluation: null }
const sessions = new Map();

// Cleanup expired sessions every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(id);
    }
  }
}, 15 * 60 * 1000);

exports.startDemo = async (req, res) => {
  const { topic } = req.body;
  if (!['react', 'dsa', 'system-design'].includes(topic)) {
    return res.status(400).json({ message: 'Invalid topic' });
  }

  const sessionId = crypto.randomUUID();
  const firstQuestion = await demoService.generateFirstQuestion(topic);
  
  sessions.set(sessionId, {
    topic,
    history: [{ role: 'ai', content: firstQuestion }],
    count: 1,
    expiresAt: Date.now() + 30 * 60 * 1000, // 30 mins TTL
    evaluation: null
  });

  res.json({ sessionId, firstQuestion });
};

exports.submitAnswer = async (req, res) => {
  const { sessionId, answer } = req.body;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session expired or not found' });
  }

  if (session.count >= 3) {
    return res.status(400).json({ message: 'Demo limit reached' });
  }

  session.history.push({ role: 'user', content: answer });
  session.count += 1;
  session.expiresAt = Date.now() + 30 * 60 * 1000; // Refresh TTL

  if (session.count > 3) {
    // This shouldn't happen but just in case
    const evaluation = await demoService.generateEvaluation(session.topic, session.history);
    session.evaluation = evaluation;
    return res.json({ done: true, evaluation });
  }

  // If we just received the 3rd answer, evaluate
  if (session.count === 3) {
    const evaluation = await demoService.generateEvaluation(session.topic, session.history);
    session.evaluation = evaluation;
    return res.json({ done: true, evaluation });
  }

  // Generate next question
  const nextQuestion = await demoService.generateFollowUp(session.topic, session.history);
  session.history.push({ role: 'ai', content: nextQuestion });
  
  res.json({ nextQuestion });
};

exports.getEvaluation = (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ message: 'Session expired or not found' });
  }

  if (!session.evaluation) {
    return res.status(400).json({ message: 'Evaluation not ready' });
  }

  res.json(session.evaluation);
};

const CoachSession = require('../models/CoachSession');
const { generateCoachResponseStream, analyzeSentence } = require('../services/coachService');

exports.startCoachSession = async (req, res) => {
  try {
    const { level } = req.body;
    const session = new CoachSession({
      userId: req.user.userId,
      level: level || 'Beginner',
      messages: [{
        role: 'ai',
        content: `Hi! I'm your English Coach. Let's practice ${level || 'Beginner'} English together. How are you doing today?`
      }]
    });
    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processUserMessageStream = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = await CoachSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Analyze the user's sentence for grammar
    const analysis = await analyzeSentence(message, session.level);
    
    // Update session with user message and analysis
    session.messages.push({
      role: 'user',
      content: message,
      correction: analysis.isCorrect ? null : analysis.corrected,
      explanation: analysis.isCorrect ? null : analysis.explanation
    });

    // 2. Prepare for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the analysis first so the frontend can display it
    res.write(`data: ${JSON.stringify({ analysis })}\n\n`);

    // 3. Generate Coach's reply
    const stream = await generateCoachResponseStream(session.level, session.messages);
    
    let fullReply = "";
    for await (const chunk of stream) {
      const text = chunk.text();
      fullReply += text;
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    // Save Coach's reply to DB
    session.messages.push({ role: 'ai', content: fullReply });
    
    // Basic progress update (can be more complex)
    if (analysis.fluencyScore) {
      session.progress.fluency = (session.progress.fluency + analysis.fluencyScore) / 2;
    }

    await session.save();
    res.write(`data: ${JSON.stringify({ done: true, messages: session.messages })}\n\n`);
    res.end();

  } catch (error) {
    console.error("Coach stream error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
};

exports.getCoachSession = async (req, res) => {
  try {
    const session = await CoachSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await CoachSession.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

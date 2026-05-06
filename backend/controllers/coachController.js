const CoachSession = require('../models/CoachSession');
const { generateCoachResponseStream, analyzeSentence, generateOpeningQuestion } = require('../services/coachService');

exports.startCoachSession = async (req, res) => {
  try {
    const { level } = req.body;
    const firstQuestion = await generateOpeningQuestion(level || 'Beginner');

    const session = new CoachSession({
      userId: req.user.userId,
      level: level || 'Beginner',
      messages: [{
        role: 'ai',
        content: firstQuestion
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
    const { sessionId, message, context, level } = req.body;
    let session = null;
    let effectiveLevel = level || 'Beginner';
    let history = [];

    if (sessionId) {
      session = await CoachSession.findById(sessionId);
      if (!session) return res.status(404).json({ message: "Session not found" });
      effectiveLevel = session.level;
      history = session.messages;
    } else if (context) {
      // Practice mode from LessonDetail - use transient history
      history = [
        { role: 'ai', content: "Lesson context initialized." },
        { role: 'user', content: `Context: ${context}` }
      ];
    }

    // 1. Analyze the user's sentence for grammar
    const analysis = await analyzeSentence(message, effectiveLevel);
    
    if (session) {
      session.messages.push({
        role: 'user',
        content: message,
        correction: analysis.isCorrect ? null : analysis.corrected,
        explanation: analysis.isCorrect ? null : analysis.explanation
      });
    }

    // 2. Prepare for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send the analysis first so the frontend can display it
    res.write(`data: ${JSON.stringify({ analysis })}\n\n`);

    // 3. Generate Coach's reply
    // Pass currentStep and lesson context
    const lessonContext = session?.lessonId?.topic || context || "General Conversation";
    const currentStep = session?.currentStep || 1;

    const stream = await generateCoachResponseStream(effectiveLevel, [...history, { role: 'user', content: message }], currentStep, lessonContext);
    
    let fullContent = "";
    for await (const chunk of stream) {
      const text = chunk.text();
      fullContent += text;
      // We still stream the raw text (which is JSON) for now, 
      // or we can try to extract the message field if we want to stream audio.
      res.write(`data: ${JSON.stringify({ chunk: text })}\n\n`);
    }

    // Parse the final JSON from AI
    try {
      const jsonStr = fullContent.match(/\{.*\}/s)?.[0] || fullContent;
      const aiResponse = JSON.parse(jsonStr);

      if (session) {
        session.messages.push({ role: 'ai', content: aiResponse.message });
        session.currentStep = aiResponse.nextStep || (session.currentStep + 1);
        if (aiResponse.lessonCompleted) session.status = 'completed';
        
        // If there's a score in the evaluation, update progress
        if (aiResponse.evaluation?.score) {
          session.progress.fluency = (session.progress.fluency + aiResponse.evaluation.score) / 2;
        }
        await session.save();
      }

      res.write(`data: ${JSON.stringify({ 
        done: true, 
        message: aiResponse.message,
        waitForUser: aiResponse.waitForUser,
        evaluation: aiResponse.evaluation,
        nextStep: aiResponse.nextStep,
        lessonCompleted: aiResponse.lessonCompleted
      })}\n\n`);
    } catch (parseError) {
      console.error("[AI Coach] JSON Parse Error:", parseError, fullContent);
      res.write(`data: ${JSON.stringify({ done: true, message: fullContent })}\n\n`);
    }
    
    res.end();

  } catch (error) {
    console.error("Coach stream error:", error);
    if (!res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
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

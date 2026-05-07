const CoachSession = require('../models/CoachSession');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { buildCoachSystemPrompt } = require('../services/coachPromptBuilder');
const { extractErrors } = require('../services/errorTracker');
const { shouldAdvanceStep } = require('../services/stepManager');
const { filterCoachResponse } = require('../services/coachResponseFilter');
const { getInterviewResponse } = require('../services/aiClient'); // Reusing the primary AI client

/**
 * Starts or resumes a coach session for the user.
 */
exports.startCoachSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    let progress = await Progress.findOne({ userId: req.user.userId });
    
    if (!progress) {
      progress = new Progress({ userId: req.user.userId });
      await progress.save();
    }

    const currentDay = progress.currentDay;
    
    // Check for existing session for today
    let session = await CoachSession.findOne({ 
      userId: req.user.userId, 
      currentDay: currentDay,
      status: 'active'
    });

    if (!session) {
      session = new CoachSession({
        userId: req.user.userId,
        userName: user.name,
        currentDay: currentDay,
        currentStep: 1,
        lessonTopic: `Day ${currentDay}: Practical Communication`, // Placeholder, can be mapped from a curriculum
        level: 'Intermediate', // Default or fetch from user profile
        messages: [],
        recentErrors: []
      });
      
      // Generate opening
      const systemPrompt = buildCoachSystemPrompt(session);
      const opening = await getInterviewResponse(systemPrompt, [], "START_COACH_SESSION", { temperature: 0.82, maxOutputTokens: 280 });
      const filteredOpening = filterCoachResponse(opening, [], session);
      
      session.messages.push({ role: 'ai', content: filteredOpening });
      await session.save();
    }

    res.status(201).json(session);
  } catch (error) {
    console.error('[COACH_START]', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Processes a user message and returns Priya's filtered response.
 */
exports.processUserMessage = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const session = await CoachSession.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // 1. Extract errors from user message
    const errors = await extractErrors(message);
    if (errors.length > 0) {
      session.recentErrors = [...new Set([...session.recentErrors, ...errors])].slice(-5);
    }

    // 2. Build prompt
    const systemPrompt = buildCoachSystemPrompt(session);

    // 3. Get AI response
    const rawResponse = await getInterviewResponse(systemPrompt, session.messages, message, { temperature: 0.82, maxOutputTokens: 280 });

    // 4. Filter response
    const recentAiResponses = session.messages.filter(m => m.role === 'ai').map(m => m.content);
    const filteredResponse = filterCoachResponse(rawResponse, recentAiResponses, session);

    // 5. Update session
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'ai', content: filteredResponse });

    // 6. Check step advancement
    const advanced = shouldAdvanceStep(filteredResponse);
    if (advanced) {
      session.currentStep += 1;
      
      // If day complete
      if (session.currentStep > 12) {
        session.status = 'completed';
        
        // Update global progress
        const progress = await Progress.findOne({ userId: req.user.userId });
        if (progress) {
          progress.currentDay += 1;
          progress.lessonsCompleted.push({
            lessonId: `day-${session.currentDay}`,
            title: session.lessonTopic,
            fluencyScore: 85 // Mock score or calculated
          });
          await progress.save();
        }
      }
    }

    await session.save();

    res.json({
      response: filteredResponse,
      currentStep: session.currentStep,
      currentDay: session.currentDay,
      errors: session.recentErrors.slice(-3),
      lessonCompleted: session.status === 'completed'
    });

  } catch (error) {
    console.error('[COACH_MESSAGE]', error);
    res.status(500).json({ message: error.message });
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

const Interview = require('../models/Interview');
const User = require('../models/User');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Starts a new interview session.
 */
exports.startInterview = async (req, res) => {
  try {
    const { topic, experienceLevel, userName } = req.body;
    const user = await User.findById(req.user.userId);
    
    if (!user) return res.status(404).json({ message: 'User not found' });

    const interview = new Interview({
      userId: req.user.userId,
      userName: userName || user.name,
      jobRole: topic || 'General Software Engineering',
      experienceLevel: experienceLevel || 'Fresher',
      difficulty: 'easy',
      questionCount: 0,
      messages: [],
      transcript: [],
      status: 'in-progress'
    });

    await interview.save();

    res.status(201).json({ sessionId: interview._id });
  } catch (error) {
    console.error('[INTERVIEW_START]', error);
    res.status(500).json({ message: 'Error starting interview' });
  }
};

/**
 * Ends the interview and generates a final evaluation.
 */
exports.endInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const interview = await Interview.findOne({ _id: sessionId, userId: req.user.userId });

    if (!interview) return res.status(404).json({ message: 'Session not found' });

    // Generate evaluation using regular Gemini REST API
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const transcriptText = interview.messages.map(m => `${m.role === 'ai' ? 'Aryan' : 'Candidate'}: ${m.content}`).join('\n');

    const prompt = `
You are a technical interview evaluator. Based on this interview transcript, evaluate the candidate on:
1. Technical knowledge (score 1-10)
2. Communication clarity (score 1-10)  
3. Problem-solving approach (score 1-10)
4. Top 3 strengths (specific, from transcript)
5. Top 3 areas to improve (specific, actionable)
6. Overall recommendation: Strong Hire / Hire / Maybe / No Hire

Transcript:
${transcriptText}

Return ONLY valid JSON. No markdown. No explanation.
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const evaluationJson = JSON.parse(response.text().replace(/```json/g, '').replace(/```/g, '').trim());

    interview.evaluation = evaluationJson;
    interview.status = 'completed';
    await interview.save();

    res.json({ evaluation: evaluationJson, sessionId: interview._id });
  } catch (error) {
    console.error('[INTERVIEW_END]', error);
    res.status(500).json({ message: 'Error ending interview' });
  }
};

/**
 * Gets the report for a specific session.
 */
exports.getInterviewReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const interview = await Interview.findOne({ _id: sessionId, userId: req.user.userId });
    
    if (!interview) return res.status(404).json({ message: 'Report not found' });
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Keep existing list controllers for dashboard
exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

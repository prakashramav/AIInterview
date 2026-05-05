const fs = require('fs');
const Interview = require('../models/Interview');
const { generateQuestion, evaluateInterview, generateQuestionStream, getMockQuestion } = require('../services/aiService');
const { speechToText, textToSpeech } = require('../services/speechService');

exports.startInterview = async (req, res) => {
  try {
    const { jobRole, experienceLevel } = req.body;
    
    // Start with a natural opening
    const firstQuestion = `Hi... thanks for joining. Let's get started. Can you briefly introduce yourself and tell me a bit about your experience as a ${jobRole}?`;
    
    const interview = new Interview({
      userId: req.user.userId,
      jobRole,
      experienceLevel,
      messages: [{ role: 'ai', content: firstQuestion }],
      status: 'in-progress'
    });
    
    await interview.save();
    
    // Generate audio for the first question
    const audioBase64 = await textToSpeech(firstQuestion);
    
    res.status(201).json({ ...interview.toObject(), audioBase64 });
  } catch (error) {
    res.status(500).json({ message: 'Error starting interview' });
  }
};

exports.answerQuestion = async (req, res) => {
  try {
    const { interviewId } = req.body;
    let answerText = req.body.answer; // Fallback for text mode

    // If audio file is uploaded, convert to text
    if (req.file) {
      answerText = await speechToText(req.file.path);
      // Clean up the temp file
      fs.unlinkSync(req.file.path);
    }

    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.userId });
    
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ message: 'Interview is already completed' });

    // Add user answer
    interview.messages.push({ role: 'user', content: answerText });
    
    // Generate next question
    const nextQuestion = await generateQuestion(interview.jobRole, interview.experienceLevel, interview.messages);
    interview.messages.push({ role: 'ai', content: nextQuestion });
    await interview.save();
    
    // Generate audio for next question
    const audioBase64 = await textToSpeech(nextQuestion);
    
    res.json({ ...interview.toObject(), audioBase64, transcript: answerText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error answering question' });
  }
};

exports.answerQuestionStream = async (req, res) => {
  try {
    const { interviewId, answer } = req.body;
    const interview = await Interview.findOne({ _id: interviewId, userId: req.user.userId });
    
    if (!interview) return res.status(404).json({ error: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ error: 'Interview completed' });

    interview.messages.push({ role: 'user', content: answer });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    const stream = await generateQuestionStream(interview.jobRole, interview.experienceLevel, interview.messages);
    
    let fullResponse = "";
    for await (const chunk of stream) {
      const chunkText = chunk.text();
      fullResponse += chunkText;
      res.write(`data: ${JSON.stringify({ chunk: chunkText })}\n\n`);
    }

    interview.messages.push({ role: 'ai', content: fullResponse });
    await interview.save();

    res.write(`data: ${JSON.stringify({ done: true, messages: interview.messages })}\n\n`);
    res.end();
  } catch (error) {
    if (error.status === 429) {
      const mock = getMockQuestion();
      res.write(`data: ${JSON.stringify({ chunk: mock })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }
    res.write(`data: ${JSON.stringify({ error: 'Failed' })}\n\n`);
    res.end();
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findOne({ _id: id, userId: req.user.userId });
    
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    if (interview.status === 'completed') return res.status(400).json({ message: 'Already completed' });

    const userMessages = interview.messages.filter(m => m.role === 'user');
    
    if (userMessages.length === 0) {
      interview.evaluation = {
        score: 0,
        breakdown: { technical: 0, communication: 0, confidence: 0 },
        strengths: ["None detected"],
        weaknesses: ["Candidate did not provide any verbal or text answers."],
        suggestions: ["Please ensure your microphone is working and you answer the questions next time."],
        exampleAnswer: "N/A"
      };
    } else {
      const evaluation = await evaluateInterview(interview.jobRole, interview.experienceLevel, interview.messages);
      interview.evaluation = evaluation;
    }
    
    interview.status = 'completed';
    await interview.save();
    
    res.json(interview);
  } catch (error) {
    res.status(500).json({ message: 'Error completing interview' });
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

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(interviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

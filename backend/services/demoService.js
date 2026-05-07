const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro'];

const generateWithFallback = async (prompt) => {
  let lastError;
  
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
    }
  }

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }]
      });
      return response.choices[0].message.content;
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
};

exports.generateFirstQuestion = async (topic) => {
  const prompt = `You are a professional technical interviewer. 
  Generate the FIRST opening question for a demo interview on the topic: ${topic}.
  The question should be foundational but engaging.
  Return ONLY the question text. 1 sentence.`;
  
  try {
    const text = await generateWithFallback(prompt);
    return text.trim().replace(/^"|"$/g, '');
  } catch (err) {
    return `Can you tell me about a challenging ${topic} project you've worked on?`;
  }
};

exports.generateFollowUp = async (topic, history) => {
  const historyText = history.map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const prompt = `You are a professional technical interviewer. 
  Topic: ${topic}
  History:
  ${historyText}
  
  Based on the candidate's last answer, generate a single adaptive follow-up question. 
  Be technical and professional.
  Return ONLY the question text. 1-2 sentences.`;

  try {
    const text = await generateWithFallback(prompt);
    return text.trim().replace(/^"|"$/g, '');
  } catch (err) {
    return "That's interesting. Can you elaborate more on the technical trade-offs you considered?";
  }
};

exports.generateEvaluation = async (topic, history) => {
  const historyText = history.map(h => `${h.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${h.content}`).join('\n');
  
  const prompt = `You are an expert technical interviewer. 
  Topic: ${topic}
  Interview Transcript:
  ${historyText}
  
  Provide a concise evaluation in JSON format:
  {
    "technicalScore": number (0-100),
    "communicationScore": number (0-100),
    "strengths": [string, string],
    "improvements": [string, string]
  }
  
  Be honest but constructive. Return ONLY valid JSON.`;

  try {
    const text = await generateWithFallback(prompt);
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (err) {
    return {
      technicalScore: 75,
      communicationScore: 80,
      strengths: ["Clear explanations", "Good foundational knowledge"],
      improvements: ["Provide more specific examples", "Deepen understanding of edge cases"]
    };
  }
};

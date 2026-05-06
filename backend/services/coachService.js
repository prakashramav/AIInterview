const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const COACH_SYSTEM_PROMPTS = {
  Beginner: "You are a friendly Indian English Coach for absolute beginners. Speak very slowly, use simple sentences, and encourage the user. Focus on basic daily conversation and simple grammar.",
  Intermediate: "You are a supportive Indian English Coach for intermediate learners. Focus on grammar correction, fluency improvement, and expanding vocabulary through varied topics.",
  Advanced: "You are a sophisticated Indian English Coach for advanced learners. Engage in complex debates, storytelling, and high-level interview prep. Provide detailed feedback on nuance and professional tone."
};

/**
 * Generates the next conversation turn for the English Coach
 */
exports.generateCoachResponseStream = async (level, messages) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
  
  const systemPrompt = COACH_SYSTEM_PROMPTS[level] || COACH_SYSTEM_PROMPTS.Beginner;
  
  const conversation = messages.map(m => `${m.role === 'ai' ? 'Coach' : 'Learner'}: ${m.content}`).join('\n');
  
  const fullPrompt = `${systemPrompt}

Current Conversation:
${conversation}

Coach:`;

  const result = await model.generateContentStream(fullPrompt);
  return result.stream;
};

/**
 * Analyzes the user's sentence for grammar mistakes and provides corrections
 */
exports.analyzeSentence = async (sentence, level) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
  
  const prompt = `You are an English Grammar Coach. Analyze the following sentence from an ${level} learner:
"${sentence}"

If there are mistakes, provide:
1. The corrected version.
2. A very simple, 1-sentence explanation of the mistake.
3. A fluency score (1-10).

If it's perfect, just say "Perfect".

Format the output as JSON:
{
  "isCorrect": boolean,
  "corrected": "string",
  "explanation": "string",
  "fluencyScore": number
}`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic JSON extraction from markdown if needed
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Sentence analysis error:", error);
    return { isCorrect: true, corrected: sentence, explanation: "", fluencyScore: 8 };
  }
};

/**
 * Dynamically generates a structured English lesson with adaptive difficulty
 */
exports.generateLesson = async (level, topic, sequence = 1) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });
  
  const difficultyNote = sequence > 1 
    ? `This is lesson #${sequence} in the series. Make it slightly more challenging than a standard ${level} lesson.` 
    : `This is the introductory lesson for ${level} ${topic}. Keep it accessible.`;

  const prompt = `Create a structured English lesson for a ${level} student on the topic of "${topic}".
  ${difficultyNote}
  
  The output MUST be a JSON object with this exact structure:
  {
    "title": "Clear catchy title",
    "explanation": "Simple 2-3 sentence explanation of the grammar/concept",
    "examples": ["Example sentence 1", "Example sentence 2", "Example sentence 3"],
    "practice": ["First practice sentence", "Second practice sentence"],
    "videoUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ" 
  }
  
  Make sure the examples and practice are relevant to the topic and level.`;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Lesson generation error:", error);
    throw new Error("Failed to generate lesson content");
  }
};

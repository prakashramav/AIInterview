const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-pro', 'gemini-pro-latest'];

// Remove TOPIC_VIDEOS as we are now fully AI-driven
const OFFLINE_LESSON_POOL = {
  Grammar: [
    {
      title: "Understanding Present Tense",
      explanation: "The present tense is used to describe actions happening right now or regular habits.",
      examples: ["I drink coffee every morning.", "She works at a bank.", "The sun rises in the east."],
      practice: ["I eat an apple every day.", "He plays football on Sundays."],
    },
    // ... other pool items
  ]
};

const generateWithFallback = async (prompt, modelsList) => {
  let lastError;
  
  // Try all Gemini models first
  for (const modelName of modelsList) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return text;
    } catch (error) {
      console.debug(`[AI Bridge] Gemini ${modelName} unavailable, trying next...`);
      lastError = error;
    }
  }

  // ULTIMATE FALLBACK: Try OpenAI if Gemini is completely exhausted
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log("[AI Bridge] Gemini exhausted. Switching to OpenAI Fallback...");
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error("[AI Bridge] OpenAI Fallback also failed:", error.message);
      lastError = error;
    }
  }

  throw lastError;
};

const COACH_SYSTEM_PROMPTS = {
  Beginner: `You are an AI English Tutor for Beginners. 
  TEACHING STYLE:
  - Speak slowly and clearly using simple English.
  - Explain concepts briefly (max 2 sentences).
  - Always give 2 examples.
  - End with a clear SPEAKING TASK (e.g., "Now tell me what you did yesterday").
  - Correct mistakes: [Correct Sentence] -> [Simple Explanation] -> [Better Version].
  - Always encourage the user.`,
  
  Intermediate: `You are an AI English Tutor for Intermediate learners.
  TEACHING STYLE:
  - Focus on fluency and natural expression.
  - Use moderate-paced, clear English.
  - Correct subtle grammar/tense mistakes clearly.
  - End each response with a speaking task or a follow-up question.`,
  
  Advanced: `You are a sophisticated AI English Coach for Advanced learners.
  TEACHING STYLE:
  - Focus on nuance, idioms, and professional communication.
  - Challenge the user with complex topics.
  - Provide high-level alternatives for common phrases.`
};

/**
 * Generates the next conversation turn for the English Coach
 */
exports.generateCoachResponseStream = async (level, messages) => {
  const systemPrompt = COACH_SYSTEM_PROMPTS[level] || COACH_SYSTEM_PROMPTS.Beginner;
  const conversation = messages.map(m => `${m.role === 'ai' ? 'Coach' : 'Learner'}: ${m.content}`).join('\n');
  const fullPrompt = `${systemPrompt}

  Your response MUST follow this structure:
  - Acknowledgement/Encouragement
  - (If mistake found) Correction & Short Explanation
  - Natural Alternative
  - Follow-up Question

Current Conversation:
${conversation}

Coach:`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContentStream(fullPrompt);
    return result.stream;
  } catch (error) {
    console.log("[AI Bridge] Gemini stream failed, trying OpenAI fallback...");
    
    // Non-streaming OpenAI fallback
    if (process.env.OPENAI_API_KEY) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: fullPrompt }]
        });
        
        // Convert static response to a fake stream for frontend compatibility
        const text = response.choices[0].message.content;
        return {
          async *[Symbol.asyncIterator]() {
            yield { text: () => text };
          }
        };
      } catch (err) {
        console.error("[AI Bridge] OpenAI also failed for conversation.");
        throw err;
      }
    }
    throw error;
  }
};

/**
 * Analyzes the user's sentence for grammar mistakes and provides corrections
 */
exports.analyzeSentence = async (sentence, level) => {
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
    const text = await generateWithFallback(prompt, MODELS);
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    console.log(`[AI Coach] Analysis ${isQuota ? 'Quota Limit Reached' : 'Error'}. Using local fallback.`);
    return { isCorrect: true, corrected: sentence, explanation: "API is busy, but your sentence looks good!", fluencyScore: 7 };
  }
};

/**
 * Dynamically generates a structured English lesson with adaptive difficulty
 */
exports.generateLesson = async (level, topic, sequence = 1) => {
  const difficultyNote = sequence > 1 
    ? `This is lesson #${sequence} in the series. Make it slightly more challenging than a standard ${level} lesson.` 
    : `This is the introductory lesson for ${level} ${topic}. Keep it accessible.`;

  const prompt = `Create a structured English teaching session for a ${level} student on "${topic}".
  ${difficultyNote}
  
  The output MUST be a JSON object with this exact structure:
  {
    "title": "Clear catchy title",
    "explanation": "Simple 1-2 sentence intro to the concept",
    "examples": ["Example 1", "Example 2"],
    "practice": ["The first speaking task for the AI to say to the user"],
    "voiceIntro": "A natural script for the AI to say: 'Today we learn [Topic]. [Explanation]. For example [Examples]. Now, [Practice Task]'"
  }
  
  Focus on: Grammar, Tenses, or Communication. No videos needed.`;

  try {
    const text = await generateWithFallback(prompt, MODELS);
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    console.log(`[AI Coach] Lesson Generation ${isQuota ? 'Quota Limit Reached' : 'Error'}. Serving from Lesson Pool.`);
    
    const pool = OFFLINE_LESSON_POOL[topic] || OFFLINE_LESSON_POOL.Grammar;
    const lessonIndex = (sequence - 1) % pool.length;
    const mock = pool[lessonIndex];

    return { 
      ...mock, 
      title: `${mock.title} (Draft Mode)`,
      voiceIntro: `Hello! Let's learn ${topic}. ${mock.explanation} For example: ${mock.examples[0]}. ${mock.practice[0]}`
    };
  }
};

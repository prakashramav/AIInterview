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

const CURRICULUM = {
  A1: ['Greetings & Names', 'Personal Info', 'Numbers & Time', 'Daily Objects', 'Present Simple'],
  A2: ['Daily Routine', 'Past Simple', 'Future (Going to)', 'Describing People', 'Family & Home'],
  B1: ['Present Perfect', 'Travel & Directions', 'Expressing Opinions', 'Health & Fitness', 'Passive Voice'],
  B2: ['Conditionals', 'Modals of Deduction', 'Business English', 'Reporting Speech', 'Formal vs Informal'],
  C1: ['Idioms & Slang', 'Advanced Structures', 'Persuasion & Debate', 'Storytelling', 'Global Issues']
};

const COACH_SYSTEM_PROMPTS = {
  A1: `You are a friendly, patient female English teacher from India. 
  Your voice is warm, clear, and has a professional Indian English accent.
  GOAL: Conduct a 12-STEP STATE-BASED interactive lesson.
  
  INDIAN TEACHER STYLE (MANDATORY):
  - Speak slowly and clearly: "Hello... how are you today?"
  - Warm & Encouraging: "Nice try, beta!", "Good effort... let's try again."
  - Professional Fillers: "Alright...", "Hmm...", "Okay, I see...".
  - Use natural Indian English phrasing (clear, slightly formal but kind).
  - SHORT & SWEET: 1-2 lines max. Use "..." for natural pauses.

  ADAPTIVE CLARIFICATION:
  - If user is confused, rephrase simply in a very warm way. NEVER repeat.

  STRICT 12-STEP FLOW:
  1. Intro | 2. Explain | 3. Examples | 4. Task 1 | 5. WAIT | 6. Evaluate
  7. Praise | 8. Next Concept | 9. Task 2 | 10. Loop | 11. Mastery | 12. Summary

  STRICT RULES:
  - Return ONLY a valid JSON object.
  - Teach ONE step at a time.
  - Set waitForUser: true ONLY at tasks.`,
  
  A2: `You are a supportive female Indian English teacher. Speak clearly and warmly. Follow the 12-STEP flow. Return JSON ONLY.`,
  B1: `You are an adaptive female Indian English coach. Use reactive listening and gentle, warm challenges. Follow the 12-STEP flow. Return JSON ONLY.`,
  B2: `You are a professional female Indian mentor. Clear, slightly formal but friendly tone. Reference user points. Follow the 12-STEP flow. Return JSON ONLY.`,
  C1: `You are a sophisticated female Indian English Master. Engage in high-level warm discussion. Follow the 12-STEP flow. Return JSON ONLY.`
};

/**
 * Generates the next conversation turn for the English Coach
 */
exports.generateCoachResponseStream = async (level, messages, currentStep = 1, lessonContext = "") => {
  const systemPrompt = COACH_SYSTEM_PROMPTS[level] || COACH_SYSTEM_PROMPTS.A1;
  const history = messages.slice(-6).map(m => `${m.role === 'ai' ? 'Teacher' : 'Student'}: ${m.content}`).join('\n');
  const fullPrompt = `${systemPrompt}
  CURRICULUM CONTEXT: ${lessonContext}
  CURRENT STEP: ${currentStep} of 12

  YOUR TASK:
  Generate the JSON response for the NEXT part of the 12-step flow.
  - If Student just spoke, Step 6 (Evaluation) or move to Next Step.
  - If you just explained, Step 4 or 9 (Task) and set waitForUser: true.
  - If lesson is ending, Step 12 and set lessonCompleted: true.

  STRICT JSON FORMAT (MANDATORY):
  {
    "message": "Spoken text with pauses '...' ",
    "waitForUser": true/false,
    "evaluation": { "score": 0-10, "corrected": "...", "explanation": "..." },
    "nextStep": number,
    "lessonCompleted": boolean
  }

  Conversation History:
  ${history}

  Teacher (as JSON):`;

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
      }
    }
    
    // ULTIMATE OFFLINE FALLBACK
    console.log("[AI Coach] API Quota Limit Reached. Serving offline coaching Turn.");
    const isEvaluationStep = [6, 10, 11].includes(currentStep);
    const mockJson = JSON.stringify({
      message: isEvaluationStep 
        ? "I heard you! That was a good try. ... Let's keep moving forward with our lesson. ... "
        : "I understand. Let's continue with the next part of our curriculum. ... ",
      waitForUser: !isEvaluationStep,
      evaluation: isEvaluationStep ? { score: 8, corrected: "Your sentence was understandable!", explanation: "Good effort." } : null,
      nextStep: currentStep + 1,
      lessonCompleted: currentStep >= 11
    });

    return {
      async *[Symbol.asyncIterator]() {
        yield { text: () => mockJson };
      }
    };
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
    return { 
      isCorrect: true, 
      corrected: sentence, 
      explanation: "I understood you perfectly! Let's continue practicing.", 
      fluencyScore: 8 
    };
  }
};

/**
 * Dynamically generates a structured English lesson with adaptive difficulty
 */
exports.generateLesson = async (level, sequence = 1) => {
  // Map sequence to topic in the curriculum
  const levelTopics = CURRICULUM[level] || CURRICULUM.A1;
  const topicIndex = (sequence - 1) % levelTopics.length;
  const topic = levelTopics[topicIndex];

  const difficultyNote = sequence > 1 
    ? `This is lesson #${sequence} in the series. Focus on "${topic}".` 
    : `This is the introductory lesson for ${level} focusing on "${topic}".`;

  const prompt = `You are a professional English teacher. Create a FULL 10-STEP LESSON for a ${level} student on the topic: "${topic}".
  ${difficultyNote}
  
  The output MUST be a JSON object with this exact structure:
  {
    "title": "Lesson ${sequence}: ${topic}",
    "goal": "Clear learning objective for this lesson",
    "explanation": "Simple conceptual breakdown of ${topic}",
    "examples": ["Example 1", "Example 2", "Example 3", "Example 4", "Example 5"],
    "speakingTasks": ["Speaking Task for the user"],
    "voiceIntro": "A COMPLETE TEACHING SCRIPT following the 10-step structure: 1. Intro, 2. Concept, 3. 5-8 Examples, 4. Check, 5. Task, 6. Correction, 7. Loop, 8. Boost, 9. Summary, 10. Next Task."
  }
  
  Focus on speaking and real-world communication. Use '...' for pauses.`;

  try {
    const text = await generateWithFallback(prompt, MODELS);
    const jsonStr = text.match(/\{.*\}/s)?.[0] || text;
    return JSON.parse(jsonStr);
  } catch (error) {
    const isQuota = error.message?.includes('429') || error.message?.includes('quota');
    console.log(`[AI Coach] Lesson Generation ${isQuota ? 'Quota Limit Reached' : 'Error'}. Serving offline lesson.`);
    
    // Offline fallback for curriculum
    return { 
      title: `Lesson ${sequence}: ${topic}`,
      goal: `Master basic communication for ${topic}`,
      explanation: `Today we are learning about ${topic} at the ${level} level.`,
      examples: ["Example sentences will go here."],
      speakingTasks: ["Please say a sentence related to " + topic],
      voiceIntro: `Hello! Welcome to Lesson ${sequence}. Today we learn ${topic}. Don't worry, I'll guide you step by step. ... First, let me explain...`
    };
  }
};

/**
 * Generates a dynamic opening question based on the user's level
 */
exports.generateOpeningQuestion = async (level) => {
  const prompt = `You are a warm, professional female English teacher from India.
  GOAL: Generate a SHORT, friendly opening question (1 sentence) for a ${level} English student.
  
  STYLE:
  - Natural Indian English accent phrasing.
  - Level-appropriate vocabulary.
  - Very friendly and welcoming.
  - Return ONLY the question text.
  
  Example: "Hello! I'm so glad to see you. Tell me, how was your day today?"`;

  try {
    const text = await generateWithFallback(prompt, MODELS);
    return text.replace(/["']/g, "").trim();
  } catch (error) {
    return `Hi! I'm your English Coach. Let's practice ${level} English together. How are you doing today?`;
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MOCK_QUESTIONS = [
  "That's an interesting point. Could you tell me about a specific time you encountered a difficult challenge related to that, and how you solved it?",
  "Alright, moving on. How do you usually handle state management in complex applications to ensure scalability?",
  "I see. Can you explain the difference between a SQL and a NoSQL database, and when you would choose one over the other?",
  "Got it. Let's talk about performance. What are some strategies you use to optimize the load time of a web application?",
  "Okay. In your experience, what is the most important aspect of writing maintainable and clean code?",
  "Interesting. How do you approach testing in your development workflow? Do you prefer unit tests or integration tests?",
  "Understood. If you were starting a new project today, what tech stack would you choose and why?"
];

const getMockQuestion = () => MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)];

const generateWithFallback = async (prompt, modelsList, config = {}) => {
  let lastError;
  for (const modelName of modelsList) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName, ...config });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.warn(`[Gemini] Model ${modelName} failed. Reason: ${error.statusText || error.message}`);
      lastError = error;
      // If the error is not a 503 (High Demand) or 429 (Rate Limit) or 404 (Not Found), we might want to break,
      // but to be safe we'll just try the next model.
    }
  }
  throw lastError;
};

exports.generateQuestion = async (jobRole, experienceLevel, previousMessages = []) => {
  const lastUserAnswer = previousMessages.length > 0 && previousMessages[previousMessages.length - 1].role === 'user' 
    ? previousMessages[previousMessages.length - 1].content 
    : "None";

  const formattedMessages = previousMessages.map(m => {
    return `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`;
  }).join('\n');

  const prompt = `You are a professional interviewer conducting a LIVE VIDEO INTERVIEW.

IMPORTANT:
You MUST start the conversation immediately.
Do NOT wait for the candidate to speak.

---

🎯 FIRST ACTION (MANDATORY):
As soon as the session starts, say:
"Hi... can you hear me? Alright, great. Let's get started. Can you briefly introduce yourself?"

---

🎤 BEHAVIOR RULES:
* You ALWAYS lead the conversation
* You ALWAYS ask the next question
* NEVER wait for user to initiate
* Ask ONLY one question at a time
* Keep responses short and spoken-style
* Use natural pauses like "..."

---

🧠 INTERVIEW FLOW:
1. Start interview automatically (no input required)
2. After each answer:
   * Acknowledge briefly ("Alright...", "Okay...")
   * Ask next question immediately
3. If user is silent:
   After 3-5 seconds say: "Are you still there?" Then repeat question or simplify it
4. If answer is weak: "Can you explain that a bit more?"
5. If answer is strong: Ask deeper follow-up

---

🚫 DO NOT:
* Wait for user to start
* Act like a chatbot
* Give explanations
* Ask multiple questions

---

INTERVIEW CONTEXT:
Role: ${jobRole}
Experience Level: ${experienceLevel}

Conversation History:
${formattedMessages}

Now BEGIN the interview immediately. Output ONLY the spoken text.`;

  try {
    const responseText = await generateWithFallback(
      prompt, 
      ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest']
    );
    return responseText;
  } catch (error) {
    if (error.status === 429) {
      console.log('Quota exceeded in generateQuestion, using random mock question');
      return getMockQuestion();
    }
    console.error('Gemini Error:', error);
    throw new Error('Failed to generate question after trying fallback models');
  }
};

exports.evaluateInterview = async (jobRole, experienceLevel, messages) => {

  const systemPrompt = `You are an elite Technical Interviewer and Senior Career Coach. 
Your goal is to provide a BRUTALLY HONEST and HIGHLY ANALYTICAL evaluation of the candidate's performance.

RULES FOR EVALUATION:
1. Be specific: Reference their exact technical answers.
2. Be critical: Identify surface-level knowledge or hesitations.
3. Focus on "Topics to Master": Explicitly list core technical areas they failed or struggled with.
4. Professional tone: Use recruiter-level vocabulary.

Format your response as a JSON object:
{
  "score": <1-10>,
  "breakdown": { "technical": <1-10>, "communication": <1-10>, "confidence": <1-10> },
  "strengths": ["Specific technical strength 1", "Behavioral strength..."],
  "weaknesses": ["Specific technical concept they missed", "Communication flaw..."],
  "suggestions": ["Topic to focus on: [Topic Name]", "Practice [Method] to improve [Skill]"],
  "exampleAnswer": "A perfect, senior-level answer for the candidate's weakest technical question."
}`;

  const conversation = messages.map(m => `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`).join('\n');
  const prompt = `${systemPrompt}\n\nInterview Transcript:\n${conversation}`;

  try {
    const responseText = await generateWithFallback(
      prompt,
      ['gemini-2.5-pro', 'gemini-pro-latest', 'gemini-2.0-flash'],
      { generationConfig: { responseMimeType: "application/json" } }
    );
    return JSON.parse(responseText);
  } catch (error) {
    if (error.status === 429) {
      console.log('Quota exceeded in evaluateInterview, returning realistic mock evaluation');
      return {
        score: 6,
        breakdown: { technical: 5, communication: 7, confidence: 6 },
        strengths: ["Clear vocal delivery", "Basic understanding of core concepts"],
        weaknesses: ["Lack of depth in technical architecture", "Reliance on generic explanations", "Inconsistent use of STAR method for behavioral answers"],
        suggestions: ["FOCUS: Master System Design and Scalability principles", "FOCUS: Deep dive into the internal workings of your primary language/framework", "PRACTICE: Use the STAR method (Situation, Task, Action, Result) for all scenario-based questions"],
        exampleAnswer: "When asked about performance optimization, don't just say 'I use cache'. Instead say: 'I implement a multi-layer caching strategy using Redis for high-frequency data and browser-side service workers for static assets, while carefully managing TTL to ensure data consistency.'"
      };
    }
    console.error('Gemini Evaluation Error:', error);
    throw new Error('Failed to evaluate interview after trying fallback models');
  }
};

exports.generateQuestionStream = async (jobRole, experienceLevel, previousMessages = []) => {
  const lastUserAnswer = previousMessages.length > 0 && previousMessages[previousMessages.length - 1].role === 'user' 
    ? previousMessages[previousMessages.length - 1].content 
    : "None";

  const formattedMessages = previousMessages.map(m => {
    return `${m.role === 'ai' ? 'Interviewer' : 'Candidate'}: ${m.content}`;
  }).join('\n');

  const prompt = `You are a professional interviewer conducting a LIVE VIDEO INTERVIEW.

IMPORTANT:
You MUST start the conversation immediately.
Do NOT wait for the candidate to speak.

---

🎯 FIRST ACTION (MANDATORY):
As soon as the session starts, say:
"Hi... can you hear me? Alright, great. Let's get started. Can you briefly introduce yourself?"

---

🎤 BEHAVIOR RULES:
* You ALWAYS lead the conversation
* You ALWAYS ask the next question
* NEVER wait for user to initiate
* Ask ONLY one question at a time
* Keep responses short and spoken-style
* Use natural pauses like "..."

---

🧠 INTERVIEW FLOW:
1. Start interview automatically (no input required)
2. After each answer:
   * Acknowledge briefly ("Alright...", "Okay...")
   * Ask next question immediately
3. If user is silent:
   After 3-5 seconds say: "Are you still there?" Then repeat question or simplify it
4. If answer is weak: "Can you explain that a bit more?"
5. If answer is strong: Ask deeper follow-up

---

🚫 DO NOT:
* Wait for user to start
* Act like a chatbot
* Give explanations
* Ask multiple questions

---

INTERVIEW CONTEXT:
Role: ${jobRole}
Experience Level: ${experienceLevel}

Conversation History:
${formattedMessages}

Now BEGIN the interview immediately. Output ONLY the spoken text.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Gemini Stream Error:', error);
    throw error;
  }
};

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { OpenAI } = require('openai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Gets a response from AI with Gemini 2.0 Flash as primary and GPT-4o as fallback.
 */
async function getInterviewResponse(systemPrompt, messages, userMessage, config = {}) {
  const { temperature = 0.85, maxOutputTokens = 250 } = config;
  
  // Last 10 messages for context
  const recentHistory = messages.slice(-10);

  // 1. Try Gemini
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp', // Using experimental 2.0 as it's often more available on v1beta
      systemInstruction: systemPrompt
    });
    
    // Format history for Gemini
    const history = recentHistory.map(m => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chat = model.startChat({
      history: history,
      generationConfig: {
        temperature: temperature,
        topP: 0.95,
        maxOutputTokens: maxOutputTokens,
      }
    });

    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    // Safety check for blocked content
    if (!response.candidates || response.candidates.length === 0 || !response.candidates[0].content) {
      throw new Error('AI response was blocked or empty');
    }

    return response.text();

  } catch (error) {
    console.warn('[AI] Gemini failed, falling back to GPT-4o:', error.message);
    
    // 2. Fallback to OpenAI GPT-4o
    try {
      const gptMessages = [
        { role: 'system', content: systemPrompt },
        ...recentHistory.map(m => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content
        })),
        { role: 'user', content: userMessage }
      ];

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: gptMessages,
        temperature: temperature,
        max_tokens: maxOutputTokens
      });

      return completion.choices[0].message.content;

    } catch (fallbackError) {
      console.error('[AI] Both Gemini and OpenAI failed:', fallbackError.message);
      
      // 3. Final offline mock fallback
      if (userMessage === "START_INTERVIEW") {
        return "Hey! I'm Aryan. Good to connect. To get us started, could you tell me a bit about your background and what you've been working on recently?";
      }

      const offlineFallbacks = [
        "That's an interesting angle. Can you tell me more about how you arrived at that?",
        "Walk me through your thinking on that one.",
        "Hmm, and how would that behave under heavy load?",
        "Good — now what would you do differently if you had to scale this to a million users?",
      ];
      
      return offlineFallbacks[Math.floor(Math.random() * offlineFallbacks.length)];
    }
  }
}

module.exports = { getInterviewResponse };

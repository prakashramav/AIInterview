const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extracts grammar and fluency errors from the user's message using Gemini.
 */
async function extractErrors(userMessage) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
Analyse this English sentence for grammar, vocabulary, or fluency errors. Return ONLY a JSON array of error strings. Max 2 errors. If no errors, return [].

Sentence: "${userMessage}"

Example output: ["Using 'having' instead of 'have'", "Missing article before 'experience'"]
    `.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Clean potential markdown if Gemini wraps it in ```json
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('[ERROR_TRACKER] Extraction failed:', error.message);
    return [];
  }
}

/**
 * Builds a summary string of recent errors.
 */
function buildErrorSummary(errors) {
  if (!errors || errors.length === 0) return "None";
  return errors.slice(-3).join(', ');
}

module.exports = { extractErrors, buildErrorSummary };

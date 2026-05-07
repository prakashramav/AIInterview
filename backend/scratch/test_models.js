const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = await genAI.listModels();
  for (const m of models) {
    console.log(`${m.name} - ${m.supportedGenerationMethods}`);
  }
}

listModels().catch(console.error);

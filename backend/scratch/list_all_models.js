const axios = require('axios');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await axios.get(url);
  res.data.models.forEach(m => {
    console.log(`${m.name} - ${m.supportedGenerationMethods}`);
  });
}

listModels().catch(console.error);

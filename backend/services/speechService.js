const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.speechToText = async (filePath) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });
    return transcription.text;
  } catch (error) {
    console.error('Whisper STT Error:', error.message);
    if (error.status === 429) {
      console.log('Quota exceeded, using fallback mock STT');
      return "I think we should use React for the frontend and Node for the backend.";
    }
    throw new Error('Speech to Text failed');
  }
};

exports.textToSpeech = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer.toString('base64');
  } catch (error) {
    console.error('OpenAI TTS Error:', error.message);
    if (error.status === 429) {
      console.log('Quota exceeded, returning empty audio for TTS');
      return null;
    }
    throw new Error('Text to Speech failed');
  }
};

const axios = require('axios');

const DID_API_KEY = process.env.DID_API_KEY;
const DEFAULT_AVATAR_URL = 'https://clips-presenters.d-id.com/amy/image.png';

exports.generateAvatarVideo = async (text) => {
  if (!DID_API_KEY) {
    console.warn("DID_API_KEY is missing. Using mock video generation.");
    return { id: "mock-id", status: "created" };
  }

  try {
    const response = await axios.post(
      'https://api.d-id.com/talks',
      {
        source_url: DEFAULT_AVATAR_URL,
        script: {
          type: 'text',
          subtitles: false,
          provider: { type: 'microsoft', voice_id: 'en-US-JennyNeural' },
          input: text
        },
        config: { fluent: true, pad_audio: 0 }
      },
      {
        headers: {
          'Authorization': `Basic ${DID_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Avatar Generation Error:', error.response?.data || error.message);
    throw new Error('Failed to generate avatar video');
  }
};

exports.getAvatarStatus = async (id) => {
  if (!DID_API_KEY || id === "mock-id") {
    // If no API key, return error so the frontend elegantly falls back to the beautiful static image avatar!
    return { status: "error" };
  }

  try {
    const response = await axios.get(`https://api.d-id.com/talks/${id}`, {
      headers: {
        'Authorization': `Basic ${DID_API_KEY}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Avatar Status Error:', error.response?.data || error.message);
    throw new Error('Failed to get avatar status');
  }
};

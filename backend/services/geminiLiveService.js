const WebSocket = require('ws');
const { buildInterviewSystemPrompt } = require('./interviewPromptBuilder');

const activeSessions = new Map();

/**
 * Creates a real-time multimodal live session with Gemini 2.0.
 */
function createLiveSession(session, browserWs) {
  const sessionId = session._id.toString();
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

  const geminiWs = new WebSocket(url);

  geminiWs.on('open', () => {
    console.log(`[GeminiLive] Connected for session ${sessionId}`);
    
    // 1. Send Setup Message
    const setupMsg = {
      setup: {
        model: "models/gemini-3.1-flash-live-preview",
        generation_config: {
          response_modalities: ["AUDIO"],
          speech_config: {
            voice_config: {
              prebuilt_voice_config: {
                voice_name: "Charon" // Professional male voice
              }
            }
          },
          temperature: 0.85,
          top_p: 0.95,
        },
        system_instruction: {
          parts: [{
            text: buildInterviewSystemPrompt(session)
          }]
        },
        realtime_input_config: {
          automatic_activity_detection: {
            disabled: false,
            start_of_speech_sensitivity: "START_SENSITIVITY_LOW",
            end_of_speech_sensitivity: "END_SENSITIVITY_LOW",
            prefix_padding_ms: 200,
            silence_duration_ms: 800
          }
        },
        input_audio_transcription: {},
        output_audio_transcription: {}
      }
    };

    geminiWs.send(JSON.stringify(setupMsg));
  });

  geminiWs.on('message', (data) => {
    try {
      const msg = JSON.parse(data.toString());
      
      if (msg.setupComplete) {
        browserWs.send(JSON.stringify({ type: 'ready' }));
      }

      // Audio Response from AI
      if (msg.serverContent?.modelTurn?.parts) {
        msg.serverContent.modelTurn.parts.forEach(part => {
          if (part.inlineData) {
            browserWs.send(JSON.stringify({ 
              type: 'audio', 
              data: part.inlineData.data 
            }));
          }
        });
      }

      // Transcriptions
      if (msg.serverContent?.inputTranscription?.text) {
        browserWs.send(JSON.stringify({ 
          type: 'user_transcript', 
          text: msg.serverContent.inputTranscription.text 
        }));
      }

      if (msg.serverContent?.outputTranscription?.text) {
        browserWs.send(JSON.stringify({ 
          type: 'ai_transcript', 
          text: msg.serverContent.outputTranscription.text 
        }));
      }

      if (msg.serverContent?.turnComplete) {
        browserWs.send(JSON.stringify({ type: 'turn_complete' }));
      }

    } catch (err) {
      console.error('[GeminiLive] Message Parse Error:', err);
    }
  });

  geminiWs.on('error', (err) => {
    console.error(`[GeminiLive] Error for ${sessionId}:`, err);
    browserWs.send(JSON.stringify({ type: 'error', message: 'Gemini connection failed' }));
  });

  geminiWs.on('close', (code, reason) => {
    console.log(`[GeminiLive] Closed for ${sessionId}. Code: ${code}, Reason: ${reason}`);
    activeSessions.delete(sessionId);
  });

  activeSessions.set(sessionId, { geminiWs, startedAt: Date.now() });
  return geminiWs;
}

function sendAudioChunk(sessionId, base64AudioChunk) {
  const session = activeSessions.get(sessionId);
  if (session && session.geminiWs.readyState === WebSocket.OPEN) {
    const audioMsg = {
      realtime_input: {
        media_chunks: [{
          data: base64AudioChunk,
          mime_type: "audio/pcm;rate=16000"
        }]
      }
    };
    session.geminiWs.send(JSON.stringify(audioMsg));
  }
}

function endLiveSession(sessionId) {
  const session = activeSessions.get(sessionId);
  if (session) {
    if (session.geminiWs.readyState === WebSocket.OPEN) {
      // Could send turn_complete if needed, but usually we just close
      session.geminiWs.close();
    }
    activeSessions.delete(sessionId);
  }
}

module.exports = { createLiveSession, sendAudioChunk, endLiveSession };

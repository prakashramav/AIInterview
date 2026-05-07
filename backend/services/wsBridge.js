const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const Interview = require('../models/Interview');
const { createLiveSession, sendAudioChunk, endLiveSession } = require('./geminiLiveService');

module.exports = function(server) {
  const wss = new WebSocketServer({ server, path: '/ws/interview' });

  wss.on('connection', async (browserWs, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const sessionId = url.searchParams.get('sessionId');
      const token = url.searchParams.get('token');

      if (!sessionId || !token) {
        console.error('[WSBridge] Missing sessionId or token');
        browserWs.close(4001, 'Missing params');
        return;
      }

      // 1. Verify JWT
      let decoded;
      try {
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;
        decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
      } catch (err) {
        console.error('[WSBridge] Token verification failed:', err.message);
        browserWs.close(4002, 'Invalid token');
        return;
      }

      // 2. Load Session
      const session = await Interview.findById(sessionId);
      if (!session) {
        console.error('[WSBridge] Session not found');
        browserWs.close(4003, 'Session not found');
        return;
      }

      // 3. Create Gemini Live Session
      const geminiWs = createLiveSession(session, browserWs);

      // 4. Handle Browser Messages
      browserWs.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          
          if (msg.type === 'audio_chunk') {
            sendAudioChunk(sessionId, msg.data);
          }
          
          if (msg.type === 'end_session') {
            endLiveSession(sessionId);
            browserWs.close();
          }
        } catch (err) {
          console.error('[WSBridge] Browser message error:', err);
        }
      });

      browserWs.on('close', () => {
        console.log(`[WSBridge] Browser connection closed for ${sessionId}`);
        endLiveSession(sessionId);
      });

      browserWs.on('error', (err) => {
        console.error(`[WSBridge] Browser WS Error for ${sessionId}:`, err.message);
        endLiveSession(sessionId);
      });

    } catch (err) {
      console.error('[WSBridge] Connection error:', err);
      browserWs.close(5000, 'Internal error');
    }
  });

  console.log('[WSBridge] WebSocket server initialized on /ws/interview');
};

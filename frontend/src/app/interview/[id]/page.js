'use client';
import { useEffect, useRef, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import AudioCapture from '@/lib/audioCapture';
import AudioPlayback from '@/lib/audioPlayback';
import Cookies from 'js-cookie';
import api from '@/services/api';

export default function InterviewPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  const [status, setStatus] = useState('idle');
  // status: idle | connecting | ready | listening | ai_speaking | ended | error
  const [aiTranscript, setAiTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [questionCount, setQuestionCount] = useState(0);
  const [difficulty, setDifficulty] = useState('Easy');
  const [isMuted, setIsMuted] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const wsRef = useRef(null);
  const captureRef = useRef(null);
  const playbackRef = useRef(null);

  // No auto-start, wait for user gesture
  useEffect(() => {
    return () => cleanup();
  }, []);

  async function handleJoinCall() {
    setStatus('connecting');
    try {
      // 1. Initialize mic immediately (User Gesture)
      captureRef.current = new AudioCapture((base64Chunk) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            data: base64Chunk
          }));
        }
        updateVolumeLevel(base64Chunk);
      });
      await captureRef.current.start();
      
      // 2. Start session
      await startSession();
    } catch (err) {
      console.error('Mic access denied:', err);
      setStatus('error');
      alert('Microphone access is required. Please check your browser settings and try again.');
    }
  }

  async function startSession() {
    if (!id || id === 'undefined') return;

    try {
      // 1. WebSocket connection to backend bridge
      const token = Cookies.get('token');
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/ws/interview?sessionId=${id}&token=${token}`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      // 2. Init audio playback (needs user gesture)
      playbackRef.current = new AudioPlayback();
      playbackRef.current.ensureContext(); // Initialize context

      // 3. Handle messages from backend
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === 'ready') {
          setStatus('listening');
        }

        if (msg.type === 'audio') {
          setStatus('ai_speaking');
          playbackRef.current.addChunk(msg.data);
        }

        if (msg.type === 'ai_transcript') {
          setAiTranscript(msg.text);
          setQuestionCount(q => q + 1);
          if (questionCount >= 6) setDifficulty('Hard');
          else if (questionCount >= 3) setDifficulty('Medium');
        }

        if (msg.type === 'user_transcript') {
          setUserTranscript(msg.text);
        }

        if (msg.type === 'turn_complete') {
          setStatus('listening');
        }

        if (msg.type === 'error') {
          console.error('[WS] Error:', msg.message);
          setStatus('error');
        }
      };

      ws.onclose = () => {
        console.log('[WS] Closed');
        setStatus('ended');
      };
      
      ws.onerror = (e) => {
        console.error('[WS] Error event:', e);
        setStatus('error');
      };

    } catch (err) {
      console.error('Failed to start session:', err);
      setStatus('error');
    }
  }

  async function startMic() {
    try {
      captureRef.current = new AudioCapture((base64Chunk) => {
        if (wsRef.current?.readyState === WebSocket.OPEN && !isMuted) {
          wsRef.current.send(JSON.stringify({
            type: 'audio_chunk',
            data: base64Chunk
          }));
        }
        updateVolumeLevel(base64Chunk);
      });
      await captureRef.current.start();
    } catch (err) {
      console.error('Mic access denied:', err);
      setStatus('error');
      alert('Microphone access is required. Please check your browser settings and try again.');
    }
  }

  function updateVolumeLevel(base64Chunk) {
    const binary = atob(base64Chunk);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const int16 = new Int16Array(bytes.buffer);
    let sum = 0;
    for (let i = 0; i < int16.length; i++) {
      sum += int16[i] * int16[i];
    }
    const rms = Math.sqrt(sum / int16.length) / 32768;
    setVolumeLevel(Math.min(100, Math.round(rms * 500))); // Scaled for visual effect
  }

  function toggleMute() {
    setIsMuted(m => !m);
  }

  async function endCall() {
    try {
      setStatus('ending');
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'end_session' }));
      }
      
      // Trigger evaluation on backend
      await api.post('/interview/end', { sessionId: id });
      
      cleanup();
      // Redirect to report page
      router.push(`/interview/report/${id}`);
    } catch (err) {
      console.error('Error ending interview:', err);
      // Fallback redirect even if evaluation fails
      cleanup();
      router.push(`/interview/report/${id}`);
    }
  }

  function cleanup() {
    captureRef.current?.stop();
    playbackRef.current?.stop();
    wsRef.current?.close();
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      {/* Join Call Overlay */}
      {status === 'idle' && (
        <div className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-900 rounded-[40px] p-10 border border-white/5 shadow-2xl text-center space-y-8">
            <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(37,99,235,0.4)]">
              🎙️
            </div>
            <div>
              <h2 className="text-3xl font-black mb-3">Ready to start?</h2>
              <p className="text-gray-400 font-medium">Aryan Mehta is waiting for you. Ensure your microphone is working.</p>
            </div>
            <button 
              onClick={handleJoinCall}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-900/20 active:scale-95"
            >
              Join Interview Call
            </button>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
              By joining, you agree to allow microphone access
            </p>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-gray-900/80 backdrop-blur z-50">
        <span className="font-bold text-xl tracking-tight">InterviewAI</span>
        <div className="flex gap-3">
          <button onClick={toggleMute}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              isMuted ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
            }`}>
            {isMuted ? '🔇 Muted' : '🎙️ Mic On'}
          </button>
          <button onClick={endCall}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-bold shadow-lg shadow-red-900/20 transition-all">
            End Interview
          </button>
        </div>
      </div>

      {/* Aryan avatar */}
      <div className="flex flex-col items-center gap-6 mb-12 relative">
        <div className={`w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-700 flex items-center justify-center text-5xl font-black shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all duration-500 ${
          status === 'ai_speaking' ? 'scale-110 ring-4 ring-blue-400 ring-offset-8 ring-offset-gray-950 animate-pulse' : 'scale-100'
        }`}>
          A
        </div>
        
        {/* Animated speaking rings */}
        {status === 'ai_speaking' && (
          <div className="absolute top-0 w-32 h-32 rounded-full animate-ping bg-blue-500/20 pointer-events-none" />
        )}

        <div className="text-center">
          <h2 className="text-3xl font-black mb-1">Aryan Mehta</h2>
          <p className="text-sm font-bold text-blue-400 uppercase tracking-widest">Senior Software Engineer</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 rounded-full border border-gray-800">
             <div className={`w-2 h-2 rounded-full ${
               status === 'listening' ? 'bg-green-500 animate-pulse' : 
               status === 'ai_speaking' ? 'bg-blue-500' : 'bg-gray-500'
             }`} />
             <span className="text-[10px] font-black uppercase tracking-wider">
               {status === 'connecting' && 'Connecting...'}
               {status === 'ready' && 'Ready'}
               {status === 'listening' && 'Aryan is Listening'}
               {status === 'ai_speaking' && 'Aryan is Speaking'}
               {status === 'ended' && 'Call Ended'}
               {status === 'error' && 'Connection Lost'}
             </span>
          </div>
        </div>
      </div>

      {/* AI transcript */}
      <div className="w-full max-w-2xl space-y-4 px-4">
        {aiTranscript && (
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-[32px] px-8 py-6 border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <p className="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Aryan</p>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-gray-100">
              {aiTranscript}
            </p>
          </div>
        )}

        {/* User transcript */}
        {userTranscript && (
          <div className="bg-indigo-900/20 backdrop-blur-xl rounded-[32px] px-8 py-6 border border-indigo-500/10 shadow-xl relative overflow-hidden self-end ml-12">
            <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
            <p className="text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest">You</p>
            <p className="text-base md:text-lg font-medium leading-relaxed text-gray-300 italic">
              "{userTranscript}"
            </p>
          </div>
        )}
      </div>

      {/* Progress Footer */}
      <div className="fixed bottom-12 w-full max-w-md px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Progress</span>
            <span className="text-sm font-bold">Question {questionCount} of ~10</span>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter ${
            difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
            difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {difficulty}
          </div>
        </div>

        {/* Volume Level */}
        <div className="bg-gray-900/80 p-5 rounded-[24px] border border-gray-800 flex items-center gap-4 shadow-2xl">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
             status === 'listening' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'
           }`}>
              <Mic size={20} className={status === 'listening' ? 'animate-pulse' : ''} />
           </div>
           <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mic Input</span>
                <span className="text-[10px] font-bold text-gray-400">{isMuted ? 'Muted' : 'Live'}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 transition-all duration-75"
                  style={{ width: `${isMuted ? 0 : volumeLevel}%` }}
                />
              </div>
           </div>
        </div>

        {/* End Session Button */}
        <button 
          onClick={endCall}
          disabled={status === 'ending'}
          className="w-full py-4 bg-gray-900 hover:bg-red-950/30 text-gray-400 hover:text-red-400 border border-gray-800 hover:border-red-500/30 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
        >
          {status === 'ending' ? (
            <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          ) : (
             <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse group-hover:scale-125 transition-all" />
          )}
          {status === 'ending' ? 'Finishing Interview...' : 'End Interview Session'}
        </button>
      </div>
    </div>
  );
}

function Mic({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>
    </svg>
  );
}

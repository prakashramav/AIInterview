'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/api';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { use } from 'react';

import VideoPlayer from '@/components/VideoPlayer';
import AvatarPlayer from '@/components/AvatarPlayer';
import RecorderControls from '@/components/RecorderControls';
import useMediaStream from '@/hooks/useMediaStream';
import useSpeechRecognition from '@/hooks/useSpeechRecognition';
import useAvatar from '@/hooks/useAvatar';

export default function LiveInterviewSession({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const { id } = params;
  const router = useRouter();

  // State
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);

  // WebRTC Hooks
  const { stream, videoRef, error: mediaError } = useMediaStream();
  const { isRecording, startRecording, stopRecording, transcript, setTranscript } = useSpeechRecognition();
  
  // Avatar Hook
  const { videoUrl, isGenerating, generateVideo } = useAvatar();

  // Inactivity & Nudge Timers
  const inactivityTimerRef = useRef(null);
  const nudgeTimersRef = useRef([]);

  const resetInactivityTimer = () => {
    // Clear all existing timers
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    nudgeTimersRef.current.forEach(timer => clearTimeout(timer));
    nudgeTimersRef.current = [];

    // Nudge 1: After 30 seconds
    nudgeTimersRef.current.push(setTimeout(() => {
      if (!isRecording && !processing) {
        const nudge = "I didn't get that... are you still there? I'm ready for your answer whenever you are.";
        speakText(nudge);
      }
    }, 30000));

    // Nudge 2: After 75 seconds
    nudgeTimersRef.current.push(setTimeout(() => {
      if (!isRecording && !processing) {
        const nudge = "I'm still waiting for your response. Is everything alright? We can continue our discussion once you're ready.";
        speakText(nudge);
      }
    }, 75000));

    // Final Timeout: After 120 seconds
    inactivityTimerRef.current = setTimeout(() => {
      alert("Interview ended due to 2 minutes of inactivity.");
      handleComplete(true); // Force complete
    }, 120000); 
  };
  
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interview/${id}`);
        setInterview(res.data);
        if (res.data.status === 'completed') {
          router.push(`/interview/${id}/feedback`);
        } else if (res.data.messages && res.data.messages.length === 1 && res.data.messages[0].role === 'ai') {
          // Speak the very first question automatically when the interview starts
          const firstMessage = res.data.messages[0].content;
          
          setTimeout(() => {
            speakText(firstMessage);
            generateVideo(firstMessage);
            resetInactivityTimer();
          }, 1000);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        resetInactivityTimer();
      }
    };
    fetchInterview();

    return () => {
      window.speechSynthesis.cancel();
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [id, router]);

  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel(); // stop previous
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a good Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India'));
    const fallbackVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
    
    if (indianVoice) {
      utterance.voice = indianVoice;
    } else if (fallbackVoice) {
      utterance.voice = fallbackVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsAISpeaking(true);
    utterance.onend = () => setIsAISpeaking(false);
    utterance.onerror = () => setIsAISpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmitAnswer = async () => {
    const finalTranscript = stopRecording();
    
    if (!finalTranscript.trim()) {
      alert("We couldn't hear anything. Please try speaking again.");
      return;
    }

    setProcessing(true);
    setTranscript(finalTranscript); // Show user what they just said

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/interview/answer-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewId: id, answer: finalTranscript })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let sentenceBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.done) {
                if (sentenceBuffer.trim().length > 0) {
                  speakText(sentenceBuffer.trim());
                  sentenceBuffer = "";
                }
                if (data.messages) {
                  setInterview(prev => ({ ...prev, messages: data.messages }));
                  
                  // Trigger avatar video generation for the latest AI message
                  const aiMessages = data.messages.filter(m => m.role === 'ai');
                  const lastAI = aiMessages[aiMessages.length - 1];
                  if (lastAI) {
                    generateVideo(lastAI.content);
                  }
                }
                break;
              }
              
              if (data.chunk) {
                sentenceBuffer += data.chunk;
                // Check if buffer contains a sentence ending punctuation
                const sentenceEndRegex = /([.?!])\s/g;
                let match;
                while ((match = sentenceEndRegex.exec(sentenceBuffer)) !== null) {
                  const splitIndex = match.index + 1;
                  const sentence = sentenceBuffer.substring(0, splitIndex);
                  speakText(sentence.trim());
                  sentenceBuffer = sentenceBuffer.substring(splitIndex).trimStart();
                  sentenceEndRegex.lastIndex = 0;
                }
              }
            } catch (e) {
              console.error("Parse error for line", line, e);
            }
          }
        }
      }

    } catch (err) {
      console.error(err);
      alert('Failed to submit answer.');
    } finally {
      setProcessing(false);
      resetInactivityTimer();
    }
  };

  const handleComplete = async (force = false) => {
    if (!force && !confirm('Are you sure you want to end the interview?')) return;
    setCompleting(true);
    
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    nudgeTimersRef.current.forEach(timer => clearTimeout(timer));
    nudgeTimersRef.current = [];

    // Stop camera and microphone immediately
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    // Double check videoRef to ensure hardware light turns off
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    try {
      await api.post(`/interview/${id}/complete`);
      router.push(`/interview/${id}/feedback`);
    } catch (err) {
      console.error(err);
      alert('Failed to complete interview');
      setCompleting(false);
    }
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!interview) return <div className="flex-1 flex items-center justify-center">Interview not found</div>;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full p-4 md:p-6 h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-card border border-border p-4 rounded-2xl shadow-sm mb-4">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            Live Interview Session
          </h2>
          <p className="text-sm text-foreground/60">{interview.jobRole} • {interview.experienceLevel}</p>
        </div>
        <button 
          onClick={handleComplete}
          disabled={completing || isRecording || processing}
          className="flex items-center gap-2 bg-card text-foreground hover:bg-red-500/10 hover:text-red-500 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-border"
        >
          {completing ? 'Evaluating...' : 'End Interview'}
        </button>
      </div>

      {mediaError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-4 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p className="text-sm">{mediaError}</p>
        </div>
      )}

      {/* Main Video Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[400px]">
        {/* Candidate Feed */}
        <VideoPlayer videoRef={videoRef} error={mediaError} />

        {/* AI Interviewer Feed */}
        <AvatarPlayer 
          videoUrl={videoUrl} 
          isGenerating={isGenerating} 
          isFallbackSpeaking={isAISpeaking} 
        />
      </div>

      {/* Real-time Transcript */}
      <div className="mt-4 bg-background/50 border border-border rounded-xl p-4 min-h-[80px] flex items-center justify-center text-center">
        {transcript ? (
          <p className="text-foreground/80 italic text-sm max-w-3xl">"{transcript}"</p>
        ) : (
          <p className="text-foreground/40 text-sm">
            {isRecording ? "Listening..." : "Your speech transcript will appear here..."}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="mt-6 flex justify-center pb-8">
        <RecorderControls 
          isRecording={isRecording}
          isProcessing={processing}
          onStart={startRecording}
          onStop={handleSubmitAnswer}
        />
      </div>
    </div>
  );
}

import { useState, useRef } from 'react';

export default function useRecorder(stream) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = () => {
    if (!stream) return;
    audioChunksRef.current = [];
    
    // We record only audio for the STT endpoint to keep payloads small
    // The video stream is just for the live UX
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) return;

    const audioStream = new MediaStream([audioTrack]);
    const options = { mimeType: 'audio/webm' };
    
    try {
      mediaRecorderRef.current = new MediaRecorder(audioStream, options);
    } catch (e) {
      console.warn("audio/webm not supported, falling back to default", e);
      mediaRecorderRef.current = new MediaRecorder(audioStream);
    }

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.start(100); // collect 100ms chunks
    setIsRecording(true);
  };

  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  return { isRecording, startRecording, stopRecording };
}

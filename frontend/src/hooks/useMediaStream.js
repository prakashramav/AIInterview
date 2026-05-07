import { useState, useEffect, useRef } from 'react';

export default function useMediaStream() {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    async function setupStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing media devices.", err);
        if (err.name === 'NotAllowedError') {
          setError("Permission denied. Please click the camera icon in your browser's address bar to allow access and refresh the page.");
        } else {
          setError("Could not access camera or microphone. Please check your hardware connections.");
        }
      }
    }

    setupStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { stream, videoRef, error };
}

import { useState } from 'react';
import api from '@/services/api';

export default function useAvatar() {
  const [videoUrl, setVideoUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateVideo = async (text) => {
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const res = await api.post('/interview/avatar/generate', { text });
      const { id } = res.data;

      // Poll for status
      const poll = setInterval(async () => {
        const statusRes = await api.get(`/interview/avatar/status/${id}`);
        if (statusRes.data.status === 'done') {
          clearInterval(poll);
          setVideoUrl(statusRes.data.result_url);
          setIsGenerating(false);
        } else if (statusRes.data.status === 'error') {
          clearInterval(poll);
          setIsGenerating(false);
        }
      }, 2000);
    } catch (err) {
      console.error('Avatar generation error', err);
      setIsGenerating(false);
    }
  };

  return { videoUrl, isGenerating, generateVideo };
}

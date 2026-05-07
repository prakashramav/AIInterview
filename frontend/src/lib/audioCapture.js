/**
 * Captures audio from the microphone and converts it to PCM 16kHz base64 chunks.
 */
class AudioCapture {
  constructor(onChunk) {
    this.onChunk = onChunk; // callback with base64 chunk
    this.stream = null;
    this.context = null;
    this.processor = null;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,        // mono
        sampleRate: 16000,      // 16kHz
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      }
    });

    this.context = new AudioContext({ sampleRate: 16000 });
    const source = this.context.createMediaStreamSource(this.stream);
    
    // Use ScriptProcessor for wide compatibility
    this.processor = this.context.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
      const float32 = e.inputBuffer.getChannelData(0);
      
      // Convert Float32 → Int16 PCM
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      
      // Convert to base64
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = btoa(binary);
      
      this.onChunk(base64);
    };

    source.connect(this.processor);
    this.processor.connect(this.context.destination);
  }

  stop() {
    this.processor?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.context?.close();
  }
}

export default AudioCapture;

/**
 * Plays base64 PCM 24kHz audio chunks in order with no gaps.
 */
class AudioPlayback {
  constructor() {
    this.context = null;
    this.queue = [];
    this.playing = false;
    this.nextStartTime = 0;
  }

  ensureContext() {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: 24000 });
      this.nextStartTime = this.context.currentTime;
    }
    if (this.context.state === 'suspended') {
      this.context.resume();
    }
  }

  addChunk(base64Chunk) {
    this.ensureContext();

    // Decode base64 → ArrayBuffer
    const binary = atob(base64Chunk);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    // Int16 PCM → Float32
    const int16 = new Int16Array(bytes.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
      float32[i] = int16[i] / 32768.0;
    }

    // Create AudioBuffer
    const buffer = this.context.createBuffer(1, float32.length, 24000);
    buffer.copyToChannel(float32, 0);

    // Schedule playback
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);

    const now = this.context.currentTime;
    const startAt = Math.max(now, this.nextStartTime);
    
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;
  }

  stop() {
    if (this.context && this.context.state !== 'closed') {
      try {
        this.context.close();
      } catch (err) {
        console.warn('Error closing AudioContext:', err);
      }
    }
    this.context = null;
    this.nextStartTime = 0;
  }
}

export default AudioPlayback;

import { useEffect } from 'react';
import { CameraOff } from 'lucide-react';

export default function VideoPlayer({ videoRef, error }) {
  return (
    <div className="relative w-full h-full bg-black rounded-2xl overflow-hidden border border-border shadow-xl flex items-center justify-center">
      {error ? (
        <div className="text-red-500 flex flex-col items-center gap-2 p-6 text-center">
          <CameraOff size={40} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover mirror-mode"
          style={{ transform: 'scaleX(-1)' }}
        />
      )}
      
      {/* Candidate Name Badge */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm font-medium">
        You (Candidate)
      </div>
    </div>
  );
}

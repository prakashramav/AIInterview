import { Loader2 } from 'lucide-react';

export default function AvatarPlayer({ videoUrl, isGenerating, isFallbackSpeaking }) {
  // Premium, professional interviewer image placeholder
  const avatarImage = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop";

  return (
    <div className="relative w-full h-full bg-card rounded-2xl overflow-hidden border border-border shadow-xl flex flex-col items-center justify-center min-h-[300px]">
      
      {videoUrl ? (
        <video 
          src={videoUrl} 
          autoPlay 
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="relative w-full h-full">
           <img 
             src={avatarImage} 
             alt="AI Interviewer" 
             className={`w-full h-full object-cover transition-all duration-700 ${isFallbackSpeaking ? 'scale-105 brightness-110' : 'scale-100 brightness-90 grayscale-[20%]'}`}
           />
           
           {/* Speaking Overlay Effect - Pulsing frame */}
           {isFallbackSpeaking && (
              <div className="absolute inset-0 shadow-[inset_0_0_50px_rgba(var(--primary),0.3)] animate-pulse"></div>
           )}

           {isGenerating && (
             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
               <Loader2 size={48} className="text-white animate-spin" />
             </div>
           )}
        </div>
      )}

      {/* Avatar Name Badge */}
      <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm font-medium">
        Interviewer (AI Avatar)
      </div>

      {/* Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-sm">
        <div className={`w-2 h-2 rounded-full ${isFallbackSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
        {isGenerating ? 'Rendering...' : isFallbackSpeaking ? 'Speaking...' : 'Listening...'}
      </div>
    </div>
  );
}

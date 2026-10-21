import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  rank?: number;
  fitMode?: 'smart-portrait' | 'cover' | 'contain';
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  className = 'w-24 h-24',
  rank,
  fitMode = 'cover',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Border accent based on rank
  let ringColor = 'ring-slate-700/60';
  if (rank === 1) ringColor = 'ring-amber-400/90 ring-4 shadow-lg shadow-amber-500/30';
  else if (rank === 2) ringColor = 'ring-slate-300/80 ring-2 shadow-md shadow-slate-300/20';
  else if (rank === 3) ringColor = 'ring-amber-700/80 ring-2 shadow-md shadow-amber-700/20';

  if (!src || hasError) {
    return (
      <div
        className={`rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 border border-slate-700 flex flex-col items-center justify-center text-slate-400 ring-2 ${ringColor} ${className}`}
      >
        <User className="w-1/2 h-1/2 text-slate-400 stroke-1" />
        <span className="text-[10px] uppercase tracking-wider font-semibold mt-1 text-slate-500">
          {alt.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  // 1. Smart Portrait Dual-Layer Mode (Guarantees zero cut off on head/hair and edges)
  if (fitMode === 'smart-portrait') {
    return (
      <div className={`relative rounded-2xl overflow-hidden ring-2 ${ringColor} bg-navy-950 flex items-center justify-center ${className}`}>
        {/* Loading shimmer skeleton */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-navy-800 animate-pulse flex items-center justify-center z-20">
            <User className="w-1/3 h-1/3 text-slate-600" />
          </div>
        )}

        {/* Ambient Blurred Aura: Fills any edges with the natural lighting/colors of the photo */}
        <img
          src={src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={`absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-45 scale-125 transition-opacity duration-500 pointer-events-none ${
            isLoaded ? 'opacity-45' : 'opacity-0'
          }`}
        />

        {/* Studio vignette overlay to ground the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/20 pointer-events-none z-[5]" />

        {/* Crisp Hero Foreground Photo: Preserves 100% of the image without clipping */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`relative z-10 w-full h-full object-contain object-center p-1 sm:p-2 transition-all duration-300 drop-shadow-2xl ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
      </div>
    );
  }

  // 2. Standard Mode: Uses object-top so the head/hair is never cropped off
  const objectFitClass = fitMode === 'contain' ? 'object-contain object-center' : 'object-cover object-top';

  return (
    <div className={`relative rounded-2xl overflow-hidden ring-2 ${ringColor} bg-navy-900 ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-navy-800 animate-pulse flex items-center justify-center">
          <User className="w-1/3 h-1/3 text-slate-600" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full ${objectFitClass} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

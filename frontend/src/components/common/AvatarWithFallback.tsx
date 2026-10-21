import React, { useState } from 'react';
import { User } from 'lucide-react';

interface AvatarWithFallbackProps {
  src?: string;
  alt: string;
  className?: string;
  rank?: number;
}

export const AvatarWithFallback: React.FC<AvatarWithFallbackProps> = ({
  src,
  alt,
  className = 'w-24 h-24',
  rank,
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
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

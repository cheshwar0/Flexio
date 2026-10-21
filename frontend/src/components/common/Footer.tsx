import React from 'react';
import { Sparkles, LogOut } from 'lucide-react';

interface FooterProps {
  motivationalMessage?: string;
  activeSlide?: number;
  totalSlides?: number;
  onExit?: () => void;
  onSelectSlide?: (index: number) => void;
}

export const Footer: React.FC<FooterProps> = ({
  motivationalMessage = 'EXCELLENCE DESERVES RECOGNITION',
  activeSlide,
  totalSlides,
  onExit,
  onSelectSlide,
}) => {
  return (
    <footer className="relative w-full z-20 px-8 py-4 border-t border-slate-800/80 bg-navy-950/80 backdrop-blur-xl">
      {/* Bottom gold accent divider */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        {/* Left: Subtle brand watermark */}
        <div className="flex items-center gap-2 text-xs text-slate-500 uppercase tracking-widest font-medium">
          <span>CORPORATE RECOGNITION DISPLAY</span>
        </div>

        {/* Center: Core Motivational Message */}
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          <p className="text-sm md:text-base font-bold tracking-[0.25em] text-amber-300 uppercase font-display drop-shadow">
            {motivationalMessage}
          </p>
          <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>

        {/* Right: Carousel Progress Dots & Just Exit Button in Right Below Corner */}
        <div className="flex items-center gap-3">
          {totalSlides !== undefined && totalSlides > 1 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-navy-900 border border-slate-800">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  id={`slide-dot-${idx}`}
                  type="button"
                  onClick={() => onSelectSlide && onSelectSlide(idx)}
                  title={`Go to slide ${idx + 1}`}
                  className="py-1 px-0.5 focus:outline-none cursor-pointer"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-500 ${
                      activeSlide === idx
                        ? 'w-6 bg-amber-400 shadow-md shadow-amber-500/50'
                        : 'w-2 bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          )}



          {onExit && (
            <button
              onClick={onExit}
              title="Exit TV Display"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900/90 hover:bg-navy-800 border border-slate-700/80 text-xs font-bold text-slate-200 hover:text-amber-400 transition-all shadow-md cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-amber-400" />
              <span>Exit</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

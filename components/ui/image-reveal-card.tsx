"use client";

import { useState, useEffect } from "react";

interface ImageRevealCardProps {
  sample: string;
  mask: string;
  className?: string;
  transitionDuration?: number;
  direction?: "left-to-right" | "right-to-left";
}

export function ImageRevealCard({ sample, mask, className = "", transitionDuration = 0.2, direction = "right-to-left" }: ImageRevealCardProps) {
  const [revealPosition, setRevealPosition] = useState(direction === "right-to-left" ? 0 : 100);
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false);

  useEffect(() => {
    if (isInteracting) {
      setHasAutoRevealed(true);
      setRevealPosition(direction === "right-to-left" ? 0 : 100);
      return;
    }

    if (!hasAutoRevealed) {
      const timer = setTimeout(() => {
        setRevealPosition(direction === "right-to-left" ? 100 : 0);
        setHasAutoRevealed(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setRevealPosition(direction === "right-to-left" ? 100 : 0);
    }
  }, [isInteracting, hasAutoRevealed, direction]);

  const handleMouseEnter = () => {
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
  };

  const handleTouch = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsInteracting(prev => !prev);
    setHasAutoRevealed(true);
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-[5px] touch-pan-y select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleTouch}
    >
      <img
        src={sample}
        alt="Sample"
        className="w-full h-full object-cover select-none pointer-events-none"
        draggable={false}
      />
      <div className="absolute bottom-2 left-2 text-white text-sm font-medium px-2 py-1 bg-black/40 backdrop-blur-sm rounded">
        Sample
      </div>

      <div
        className="absolute top-0 left-0 w-full h-full overflow-hidden"
        style={{
          clipPath: `inset(0 ${100 - revealPosition}% 0 0)`,
          transition: `clip-path ${transitionDuration}s ease-in-out`,
        }}
      >
        <img
          src={mask}
          alt="Mask"
          className="w-full h-full object-cover select-none pointer-events-none"
          draggable={false}
        />
        <div className="absolute bottom-2 left-2 text-white text-sm font-medium px-2 py-1 bg-black/40 backdrop-blur-sm rounded">
          Inference result
        </div>
      </div>

      <div
        className="absolute top-0 h-full w-1 bg-gradient-to-r from-white/60 via-white to-white/60 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
        style={{
          left: `${revealPosition}%`,
          transition: `left ${transitionDuration}s ease-in-out`,
          transform: 'translateX(-50%)',
        }}
      />
    </div>
  );
}

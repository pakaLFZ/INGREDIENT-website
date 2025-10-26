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
  const [revealPosition, setRevealPosition] = useState(direction === "right-to-left" ? 100 : 0);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAutoRevealed, setHasAutoRevealed] = useState(false);

  useEffect(() => {
    if (isHovered) {
      setHasAutoRevealed(true);
      setRevealPosition(direction === "right-to-left" ? 100 : 0);
      return;
    }

    if (!hasAutoRevealed) {
      const timer = setTimeout(() => {
        setRevealPosition(direction === "right-to-left" ? 0 : 100);
        setHasAutoRevealed(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setRevealPosition(direction === "right-to-left" ? 0 : 100);
    }
  }, [isHovered, hasAutoRevealed, direction]);

  return (
    <div
      className={`relative w-full h-full overflow-hidden rounded-[5px] ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <img
        src={sample}
        alt="Sample"
        className="w-full h-full object-cover"
        draggable={false}
      />

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
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>

      <div
        className="absolute top-0 h-full w-0.5"
        style={{
          left: `${revealPosition}%`,
          transition: `left ${transitionDuration}s ease-in-out`,
        }}
      />
    </div>
  );
}

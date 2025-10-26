"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageTransitionProps {
  firstImage: string
  secondImage: string
  alt?: string
  transitionDuration?: number
  direction?: "top-to-bottom" | "bottom-to-top" | "left-to-right" | "right-to-left"
  className?: string
}

export function ImageTransition({
  firstImage,
  secondImage,
  alt = "Transition image",
  transitionDuration = 500,
  direction = "top-to-bottom",
  className,
}: ImageTransitionProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full h-full">
        <img
          src={firstImage}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>

      <div
        className="absolute inset-0 w-full h-full"
        style={{
          clipPath: isHovered
            ? "inset(0 0 0 0)"
            : direction === "top-to-bottom"
            ? "inset(0 0 100% 0)"
            : direction === "bottom-to-top"
            ? "inset(100% 0 0 0)"
            : direction === "left-to-right"
            ? "inset(0 100% 0 0)"
            : "inset(0 0 0 100%)",
          transition: `clip-path ${transitionDuration}ms ease-in-out`,
        }}
      >
        <img
          src={secondImage}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}

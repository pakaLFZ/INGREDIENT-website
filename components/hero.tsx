"use client"

import { useEffect, useState } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { BloodCellViewer } from "@/components/demo-1/blood-cell-viewer"

const tools = [
  "affordable. ",
  "reproducible. ",
  "efficient. ",
  "intuitive. ",
  "explainable. ",
  "collaborative. ",
  "compatible. ",
  "flexible. "
]

function TypingWordRotate() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % tools.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TypingAnimation
      key={tools[index]}
      className="font-bold leading-none"
      duration={100}
    >
      {tools[index]}
    </TypingAnimation>
  )
}

export function Hero() {
  return (
    <div className="w-screen bg-black overflow-hidden" style={{ minHeight: "95vh" }}>
      <div className="flex flex-col md:flex-row h-full min-h-[95vh]">
        {/* Mobile: Image on top, Desktop: Image on right (horizontally and vertically centered) */}
        <div className="flex justify-center items-center p-4 md:w-1/2 md:order-2">
          <div className="w-[50vw] h-[50vw] md:w-[200px] md:h-[200px]">
            <BloodCellViewer />
          </div>
        </div>

        {/* Mobile: Text on bottom, Desktop: Text on left (aligned top) */}
        <div className="flex items-start justify-start p-6 md:p-8 lg:p-12 md:w-1/2 md:order-1">
          <div className="tracking-tight text-white font-bold text-[32px] md:text-[30px] lg:text-[30px]">
            <p><span>The tools we build for researchers are </span><TypingWordRotate /></p>
          </div>
        </div>
      </div>
    </div>
  )
}
